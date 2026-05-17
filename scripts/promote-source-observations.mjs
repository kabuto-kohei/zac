import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { withDatabaseClient } from "./db-runtime.mjs";
import { formatSourceCandidate, normalizeObservationCategory } from "./source-candidate-format.mjs";

const requireFromDbPackage = createRequire(new URL("../packages/db/package.json", import.meta.url));
const postgres = requireFromDbPackage("postgres");

const databaseUrl = process.env.DATABASE_URL;
const outputJsonPath = process.env.ZAC_OBSERVATION_PROMOTION_JSON ?? "data/intake/source-observation-promotions.json";
const outputMdPath = process.env.ZAC_OBSERVATION_PROMOTION_MD ?? "data/intake/source-observation-promotions.md";
const outputSqlPath = process.env.ZAC_OBSERVATION_PROMOTION_SQL ?? "data/intake/source-observation-promotions.sql";
const promotionLimit = parsePositiveInt(process.env.ZAC_OBSERVATION_PROMOTION_LIMIT, 96);
const publishApproved = process.env.ZAC_PROMOTE_OBSERVATIONS_APPROVE === "1";
const systemUserId = process.env.ZAC_SYSTEM_USER_ID ?? "00000000-0000-4000-8000-000000000001";
const generatedAt = new Date();
const todayStart = startOfTodayJst(generatedAt);

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const data = await withDatabaseClient(
  postgres,
  databaseUrl,
  async (sql) => {
    const observations = await sql`
      SELECT
        o.id,
        o.event_source_id,
        o.handle,
        o.source_url,
        o.source_external_id,
        o.source_posted_at,
        o.observed_at,
        o.classification,
        o.title,
        o.summary,
        o.starts_at,
        o.ends_at,
        o.source_quote,
        o.extraction_confidence,
        o.review_status,
        o.decision_note,
        es.display_name,
        es.source_type,
        es.source_url AS event_source_url,
        g.id AS gym_id,
        g.name AS gym_name
      FROM source_post_observations o
      LEFT JOIN event_sources es ON es.id = o.event_source_id
      LEFT JOIN gyms g
        ON g.deleted_at IS NULL
       AND g.status = 'published'
       AND (
          lower(coalesce(g.instagram_handle, '')) = lower(o.handle)
          OR g.instagram_url = es.source_url
          OR g.instagram_url = o.source_url
          OR g.website_url = es.source_url
          OR g.website_url = split_part(o.source_url, '#', 1)
          OR g.source_url = es.source_url
          OR g.source_url = split_part(o.source_url, '#', 1)
       )
      WHERE o.deleted_at IS NULL
        AND o.review_status = 'pending'
        AND o.starts_at IS NOT NULL
      ORDER BY o.starts_at ASC, o.observed_at ASC
      LIMIT ${promotionLimit};
    `;

    const events = await sql`
      SELECT id, gym_id, category, title, starts_at, source_url, status, review_status
      FROM events
      WHERE deleted_at IS NULL;
    `;

    return { observations, events };
  },
  { label: "source observation promotion" },
);

const existing = buildExistingIndex(data.events);
const seenObservationIds = new Set();
const promotions = [];
const skipped = [];

for (const row of data.observations) {
  if (seenObservationIds.has(row.id)) {
    skipped.push({ id: row.id, sourceUrl: row.source_url, title: row.title, reason: "duplicate observation row from source/gym matching" });
    continue;
  }
  seenObservationIds.add(row.id);

  const evaluation = evaluateObservation(row, existing);
  if (!evaluation.ok) {
    skipped.push({ id: row.id, sourceUrl: row.source_url, title: row.title, reason: evaluation.reason });
    continue;
  }

  const promotion = buildPromotion(row, evaluation.category);
  promotions.push(promotion);
  existing.sourceUrls.add(row.source_url);
  existing.fingerprints.add(fingerprintFor(promotion.gymId, promotion.category, promotion.startsAt));
}

const result = {
  generatedAt: generatedAt.toISOString(),
  mode: publishApproved ? "approved_public" : "draft_review",
  policy: {
    source: "source_post_observations",
    publicSafety: "default promotions are draft + pending; public API only serves approved events",
    excludedFields: "full captions, images, videos",
  },
  summary: {
    observationsRead: data.observations.length,
    promotions: promotions.length,
    skipped: skipped.length,
  },
  promotions,
  skipped,
};

await fs.writeFile(outputJsonPath, `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(outputMdPath, renderMarkdown(result));
await fs.writeFile(outputSqlPath, renderSql(result));

console.log(
  JSON.stringify(
    {
      generatedAt: result.generatedAt,
      mode: result.mode,
      observationsRead: result.summary.observationsRead,
      promotions: result.summary.promotions,
      skipped: result.summary.skipped,
      outputJsonPath,
      outputMdPath,
      outputSqlPath,
    },
    null,
    2,
  ),
);

function evaluateObservation(row, existing) {
  const category = normalizeCategory(row.classification);
  if (!category) {
    return { ok: false, reason: `unsupported classification: ${row.classification ?? "unknown"}` };
  }

  if (!row.gym_id) {
    return { ok: false, reason: "no matching published gym" };
  }

  const title = normalizeWhitespace(row.title ?? "");
  if (!isUsefulTitle(title)) {
    return { ok: false, reason: "title is too weak for event candidate" };
  }
  if (isWeakAnnouncement(title, row.source_quote ?? "", category)) {
    return { ok: false, reason: "post looks like an announcement, not a calendar item" };
  }

  const startsAt = asDate(row.starts_at);
  const endsAt = asDate(row.ends_at) ?? startsAt;
  if (!startsAt) {
    return { ok: false, reason: "missing start date" };
  }
  if (startsAt < todayStart) {
    return { ok: false, reason: "past start date" };
  }
  if (endsAt < startsAt) {
    return { ok: false, reason: "end date is before start date" };
  }

  if (existing.sourceUrls.has(row.source_url)) {
    return { ok: false, reason: "source URL already exists in events" };
  }

  if (existing.fingerprints.has(fingerprintFor(row.gym_id, category, startsAt))) {
    return { ok: false, reason: "same gym/category/start date already exists" };
  }

  return { ok: true, category };
}

function buildPromotion(row, category) {
  const startsAt = asDate(row.starts_at);
  const endsAt = asDate(row.ends_at) ?? startsAt;
  const sourceAccount = normalizeWhitespace(row.display_name ?? row.handle);
  const formatted = formatSourceCandidate({
    category,
    sourceName: row.gym_name ?? sourceAccount,
    sourceType: row.source_type === "official_site" ? "official_site" : "official_instagram",
    rawTitle: row.title,
    startsAt,
    endsAt,
    sourceQuote: row.source_quote,
    extractionConfidence: row.extraction_confidence,
  });

  return {
    eventId: randomUUID(),
    observationId: row.id,
    gymId: row.gym_id,
    gymName: row.gym_name,
    category,
    title: formatted.title,
    summary: formatted.summary,
    description: formatted.description,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    capacityText: formatted.capacityText,
    sourceType: row.source_type === "official_site" ? "official_site" : "official_instagram",
    sourceUrl: row.source_url,
    sourceAccount,
    sourcePublishedAt: asDate(row.source_posted_at)?.toISOString() ?? null,
    sourceFetchedAt: asDate(row.observed_at)?.toISOString() ?? generatedAt.toISOString(),
    sourceQuote: formatted.sourceQuote,
    extractionConfidence: formatted.extractionConfidence,
    reviewStatus: publishApproved ? "approved" : "pending",
    reviewedAt: publishApproved ? generatedAt.toISOString() : null,
    status: publishApproved ? "scheduled" : "draft",
  };
}

function buildExistingIndex(events) {
  const sourceUrls = new Set();
  const fingerprints = new Set();

  for (const event of events) {
    if (event.source_url) {
      sourceUrls.add(event.source_url);
    }

    const startsAt = asDate(event.starts_at);
    if (event.gym_id && startsAt) {
      fingerprints.add(fingerprintFor(event.gym_id, normalizeCategory(event.category) ?? "event", startsAt));
    }
  }

  return { sourceUrls, fingerprints };
}

function normalizeCategory(value) {
  return normalizeObservationCategory(value);
}

function fingerprintFor(gymId, category, startsAt) {
  const date = asDate(startsAt);
  return `${gymId}:${category}:${date ? toJstDateKey(date) : "invalid"}`;
}

function isUsefulTitle(title) {
  const compact = title.replace(/[・.。！？!?【】「」『』（）()\s\d年月日\-_/〜~:：,.、]/gu, "");
  return compact.length >= 3;
}

function isWeakAnnouncement(title, summary, category) {
  const text = `${title} ${summary}`;
  if (/抽選発表|料金改定|サマーキャンペーン|今日の/u.test(text)) {
    return true;
  }
  if (/お知らせ/u.test(text) && !/セット|ホールド替え|営業時間|短縮営業|貸切/u.test(text)) {
    return true;
  }
  if (category === "opening_change" && !/営業時間|短縮営業|休業|貸切|close|オープン|クローズ/u.test(text)) {
    return true;
  }
  return false;
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function asDate(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toJstDateKey(date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function startOfTodayJst(date) {
  return new Date(`${toJstDateKey(date)}T00:00:00+09:00`);
}

function renderMarkdown(result) {
  const lines = [
    "# Source Observation Promotions",
    "",
    `Generated: ${result.generatedAt}`,
    `Mode: ${result.mode}`,
    "",
    "## Summary",
    "",
    `- observationsRead: ${result.summary.observationsRead}`,
    `- promotions: ${result.summary.promotions}`,
    `- skipped: ${result.summary.skipped}`,
    "",
    "## Promotions",
    "",
    ...result.promotions.map(
      (item) => `- ${item.status}/${item.reviewStatus}: ${item.category} | ${item.gymName} | ${item.title} | ${item.sourceUrl}`,
    ),
    "",
    "## Skipped",
    "",
    ...result.skipped.map((item) => `- ${item.reason}: ${item.title ?? "(no title)"} | ${item.sourceUrl}`),
  ];
  return `${lines.join("\n")}\n`;
}

function renderSql(result) {
  const header = [
    "-- Generated by scripts/promote-source-observations.mjs",
    `-- generated_at: ${result.generatedAt}`,
    `-- mode: ${result.mode}`,
    "-- This patch only stores review candidates unless ZAC_PROMOTE_OBSERVATIONS_APPROVE=1 was set.",
    "",
  ].join("\n");

  if (result.promotions.length === 0) {
    return `${header}-- No eligible source_post_observations to promote.\n`;
  }

  const rows = result.promotions
    .map(
      (item) =>
        `  (${[
          sqlUuid(item.eventId),
          sqlUuid(item.gymId),
          sqlString(item.category),
          sqlString(item.title),
          sqlString(item.summary),
          sqlString(item.description),
          sqlTimestamp(item.startsAt),
          sqlTimestamp(item.endsAt),
          sqlString(item.capacityText),
          sqlString(item.sourceType),
          sqlString(item.sourceUrl),
          sqlString(item.sourceAccount),
          sqlTimestampOrNull(item.sourcePublishedAt),
          sqlTimestamp(item.sourceFetchedAt),
          sqlString(item.sourceQuote),
          "NULL",
          sqlString("summary_with_link"),
          `${item.extractionConfidence}::numeric`,
          sqlString(item.reviewStatus),
          sqlTimestampOrNull(item.reviewedAt),
          sqlString(item.status),
          sqlString("public"),
          sqlUuid(systemUserId),
        ].join(", ")})`,
    )
    .join(",\n");

  const observationRows = result.promotions
    .map((item) => `  (${sqlString(item.observationId)}::uuid, ${sqlString(item.eventId)}::uuid)`)
    .join(",\n");

  return `${header}INSERT INTO "events" (
  "id",
  "gym_id",
  "category",
  "title",
  "summary",
  "description",
  "starts_at",
  "ends_at",
  "capacity_text",
  "source_type",
  "source_url",
  "source_account",
  "source_published_at",
  "source_fetched_at",
  "source_quote",
  "source_raw_text",
  "source_policy",
  "extraction_confidence",
  "review_status",
  "reviewed_at",
  "status",
  "visibility",
  "created_by"
)
SELECT *
FROM (VALUES
${rows}
) AS v(
  "id",
  "gym_id",
  "category",
  "title",
  "summary",
  "description",
  "starts_at",
  "ends_at",
  "capacity_text",
  "source_type",
  "source_url",
  "source_account",
  "source_published_at",
  "source_fetched_at",
  "source_quote",
  "source_raw_text",
  "source_policy",
  "extraction_confidence",
  "review_status",
  "reviewed_at",
  "status",
  "visibility",
  "created_by"
)
WHERE NOT EXISTS (
  SELECT 1 FROM "events" e WHERE e."deleted_at" IS NULL AND e."source_url" = v."source_url"
);

WITH promoted_observations("id", "event_id") AS (
  VALUES
${observationRows}
)
UPDATE "source_post_observations" o
SET
  "review_status" = 'event_candidate',
  "decision_note" = trim(concat_ws(' ', o."decision_note", 'Promoted to draft event candidate', promoted_observations."event_id"::text)),
  "updated_at" = now()
FROM promoted_observations
WHERE o."id" = promoted_observations."id";
`;
}

function sqlString(value) {
  return `'${String(value ?? "").replaceAll("'", "''")}'`;
}

function sqlTimestamp(value) {
  return `${sqlString(value)}::timestamptz`;
}

function sqlTimestampOrNull(value) {
  return value ? sqlTimestamp(value) : "NULL::timestamptz";
}

function sqlUuid(value) {
  return `${sqlString(value)}::uuid`;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
