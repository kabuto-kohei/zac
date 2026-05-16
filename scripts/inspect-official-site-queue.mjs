import fs from "node:fs/promises";

const monitorPath = process.env.ZAC_SOURCE_MONITOR_PATH ?? "data/intake/source-monitor-run.json";
const outputJsonPath = process.env.ZAC_OFFICIAL_SITE_INSPECTION_JSON ?? "data/intake/official-site-inspection.json";
const outputMdPath = process.env.ZAC_OFFICIAL_SITE_INSPECTION_MD ?? "data/intake/official-site-inspection.md";
const outputSqlPath = process.env.ZAC_OFFICIAL_SITE_INSPECTION_SQL ?? "data/intake/official-site-observations.sql";
const sourceLimit = parsePositiveInt(process.env.ZAC_OFFICIAL_SITE_SOURCE_LIMIT, 24);
const requestDelayMs = parsePositiveInt(process.env.ZAC_OFFICIAL_SITE_REQUEST_DELAY_MS, 1000);
const requestTimeoutMs = parsePositiveInt(process.env.ZAC_OFFICIAL_SITE_REQUEST_TIMEOUT_MS, 10000);
const candidatesPerSource = parsePositiveInt(process.env.ZAC_OFFICIAL_SITE_CANDIDATES_PER_SOURCE, 3);
const generatedAt = new Date();
const generatedAtSql = toSqlTimestamp(generatedAt);

const monitor = JSON.parse(await fs.readFile(monitorPath, "utf8"));
const queue = (monitor.queues?.inspectNow ?? [])
  .filter((source) => source.sourceType === "official_site" && /^https?:\/\//u.test(source.sourceUrl ?? ""))
  .slice(0, sourceLimit);

const inspections = [];

for (const source of queue) {
  const page = await fetchOfficialPage(source.sourceUrl);
  const candidates = page.ok ? extractCandidates(page.text, source).slice(0, candidatesPerSource) : [];
  inspections.push({
    handle: source.handle,
    displayName: source.displayName,
    sourceUrl: source.sourceUrl,
    sourceType: source.sourceType,
    ok: page.ok,
    error: page.error ?? null,
    failureCategory: page.failureCategory ?? null,
    failureDetail: page.failureDetail ?? null,
    candidates,
  });
  await sleep(requestDelayMs);
}

const flatCandidates = inspections.flatMap((inspection) => inspection.candidates);
const result = {
  generatedAt: generatedAt.toISOString(),
  policy: {
    savedFields: "page URL, derived source fragment, classification, short summary, short quote, review status",
    excludedFields: "full page text, copied images, copied videos, HTML snapshots",
  },
  summary: {
    sourcesQueued: queue.length,
    sourcesFetched: inspections.filter((inspection) => inspection.ok).length,
    sourcesFailed: inspections.filter((inspection) => !inspection.ok).length,
    observedItems: flatCandidates.length,
    pendingItems: flatCandidates.filter((item) => item.reviewStatus === "pending").length,
    ignoredItems: flatCandidates.filter((item) => item.reviewStatus === "ignored").length,
    calendarCandidates: flatCandidates.filter((item) => item.startsAt).length,
  },
  inspections,
};

await fs.writeFile(outputJsonPath, `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(outputMdPath, renderMarkdown(result));
await fs.writeFile(outputSqlPath, renderSql(result));

console.log(
  JSON.stringify(
    {
      generatedAt: result.generatedAt,
      sourcesFetched: result.summary.sourcesFetched,
      sourcesFailed: result.summary.sourcesFailed,
      observedItems: result.summary.observedItems,
      pendingItems: result.summary.pendingItems,
      outputJsonPath,
      outputMdPath,
      outputSqlPath,
    },
    null,
    2,
  ),
);

async function fetchOfficialPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 ZacOfficialSourceMonitor/1.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    if (!response.ok) {
      return classifyHttpFailure(response.status);
    }

    const html = await response.text();
    return { ok: true, text: htmlToSearchText(html), error: null };
  } catch (error) {
    return classifyThrownFailure(error);
  }
}

function extractCandidates(text, source) {
  const compact = normalizeWhitespace(text);
  const dateMatches = [...compact.matchAll(/(?:(20\d{2})[年\/.-])?\s*(\d{1,2})\s*(?:月|\/|\.)\s*(\d{1,2})\s*(?:日)?/g)];
  const candidates = [];
  const seen = new Set();

  for (const match of dateMatches) {
    const year = match[1] ? Number(match[1]) : generatedAt.getFullYear();
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!isValidMonthDay(month, day)) {
      continue;
    }

    const index = match.index ?? 0;
    const context = compact.slice(Math.max(0, index - 80), Math.min(compact.length, index + 160));
    const classification = classifyText(context);
    if (classification === "notice") {
      continue;
    }

    const startsAt = new Date(Date.UTC(year, month - 1, day, 10 - 9, 0));
    if (Number.isNaN(startsAt.getTime())) {
      continue;
    }

    const key = `${source.handle}:${classification}:${toJstDateKey(startsAt)}:${normalizeKey(context).slice(0, 48)}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const title = buildTitle(source.displayName, classification, startsAt, context);
    candidates.push({
      handle: source.handle,
      sourceUrl: `${source.sourceUrl}#zac-${toJstDateKey(startsAt)}-${classification}-${candidates.length + 1}`,
      sourceExternalId: `official-site:${source.handle}:${toJstDateKey(startsAt)}:${classification}:${candidates.length + 1}`,
      classification,
      title,
      summary: `${source.displayName}の公式サイト上で${categoryLabel(classification)}に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。`,
      startsAt: startsAt.toISOString(),
      endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000).toISOString(),
      sourceQuote: truncate(context, 120),
      extractionConfidence: "0.60",
      reviewStatus: "pending",
      decisionNote: "Potential calendar candidate from official site text; human review required before publishing.",
    });
  }

  return candidates;
}

function classifyText(value) {
  if (/(コンペ|コンペティション|competition|circuit|大会|選手権|cup|トライアル|セッションコンペ)/iu.test(value)) return "competition";
  if (/(ルートセット|セット替え|ホールド替え|課題替え|全面セット|まぶし替え|reset|route set|routeset|setting)/iu.test(value)) return "route_set";
  if (/(貸切|貸し切り|private booking|private event)/iu.test(value)) return "private_booking";
  if (/(営業時間|営業予定|臨時休業|休業|短縮営業|open|close|closed|closure)/iu.test(value)) return "opening_change";
  if (/(工事|改装|メンテナンス|construction|maintenance)/iu.test(value)) return "construction";
  if (/(講習|スクール|セッション|道場|体験|ワークショップ|イベント|session|workshop|lesson)/iu.test(value)) return "event";
  return "notice";
}

function buildTitle(displayName, classification, startsAt, context) {
  const date = formatDate(startsAt);
  const label = categoryLabel(classification);
  const named = context.match(/(?:【([^】]{3,40})】|「([^」]{3,40})」|『([^』]{3,40})』)/u);
  const name = named?.[1] ?? named?.[2] ?? named?.[3] ?? "";
  return truncate(name ? `${displayName} ${name}` : `${displayName} ${date} ${label}`, 80);
}

function categoryLabel(classification) {
  return {
    competition: "コンペ情報",
    route_set: "セット情報",
    opening_change: "営業情報",
    private_booking: "貸切情報",
    construction: "工事情報",
    event: "イベント情報",
    notice: "告知",
  }[classification];
}

function renderSql(result) {
  const rows = dedupeBy(result.inspections.flatMap((inspection) => inspection.candidates), (candidate) => candidate.sourceUrl);
  const checkedSources = result.inspections.filter((inspection) => inspection.ok);
  const checkedSourceSql =
    checkedSources.length > 0
      ? `WITH checked_sources (handle, source_url) AS (
  VALUES
${checkedSources.map((source) => `    (${sqlString(source.handle)}, ${sqlString(source.sourceUrl)})`).join(",\n")}
)
UPDATE "event_sources" s
SET
  "last_checked_at" = ${sqlString(generatedAtSql)}::timestamptz,
  "updated_at" = now()
FROM checked_sources c
WHERE s."handle" = c.handle
  AND s."source_url" = c.source_url;`
      : "-- No successfully fetched official-site sources in this run.";

  const observedSql =
    rows.length > 0
      ? `WITH observed_items (
  handle,
  source_url,
  source_external_id,
  classification,
  title,
  summary,
  starts_at,
  ends_at,
  source_quote,
  extraction_confidence,
  review_status,
  decision_note
) AS (
  VALUES
${rows.map(renderCandidateSqlRow).join(",\n")}
),
matched_sources AS (
  SELECT
    o.*,
    s."id" AS event_source_id
  FROM observed_items o
  LEFT JOIN "event_sources" s
    ON s."deleted_at" IS NULL
   AND s."handle" = o.handle
   AND s."source_type" = 'official_site'
)
INSERT INTO "source_post_observations" (
  "event_source_id",
  "platform",
  "handle",
  "source_url",
  "source_external_id",
  "observed_at",
  "classification",
  "title",
  "summary",
  "starts_at",
  "ends_at",
  "source_quote",
  "extraction_confidence",
  "review_status",
  "decision_note"
)
SELECT
  event_source_id,
  'web',
  handle,
  source_url,
  source_external_id,
  ${sqlString(generatedAtSql)}::timestamptz,
  classification,
  title,
  summary,
  starts_at::timestamptz,
  ends_at::timestamptz,
  source_quote,
  extraction_confidence::numeric,
  review_status,
  decision_note
FROM matched_sources
ON CONFLICT ("source_url") DO UPDATE SET
  "event_source_id" = EXCLUDED."event_source_id",
  "observed_at" = EXCLUDED."observed_at",
  "classification" = EXCLUDED."classification",
  "title" = EXCLUDED."title",
  "summary" = EXCLUDED."summary",
  "starts_at" = EXCLUDED."starts_at",
  "ends_at" = EXCLUDED."ends_at",
  "source_quote" = EXCLUDED."source_quote",
  "extraction_confidence" = EXCLUDED."extraction_confidence",
  "review_status" = EXCLUDED."review_status",
  "decision_note" = EXCLUDED."decision_note",
  "updated_at" = now(),
  "deleted_at" = NULL;`
      : "-- No official-site observations in this run.";

  return `-- Official-site observations generated from inspectNow official-site queue.
-- Generated: ${result.generatedAt}
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

${checkedSourceSql}

${observedSql}
`;
}

function renderCandidateSqlRow(item) {
  return `    (${sqlString(item.handle)}, ${sqlString(item.sourceUrl)}, ${sqlString(item.sourceExternalId)}, ${sqlString(item.classification)}, ${sqlString(item.title)}, ${sqlString(item.summary)}, ${sqlTimestampOrNull(item.startsAt)}, ${sqlTimestampOrNull(item.endsAt)}, ${sqlString(item.sourceQuote)}, ${item.extractionConfidence}::numeric, ${sqlString(item.reviewStatus)}, ${sqlString(item.decisionNote)})`;
}

function renderMarkdown(result) {
  const rows = result.inspections
    .map((inspection) => {
      const candidates = inspection.candidates
        .map((item) => `  - ${item.reviewStatus}: ${item.classification} | ${item.title} | ${item.sourceUrl}`)
        .join("\n");
      const failure = inspection.ok ? "" : ` - fetch failed (${inspection.failureCategory ?? "unknown"})`;
      return `- ${inspection.displayName} (${inspection.handle})${failure}\n${candidates || "  - no candidates"}`;
    })
    .join("\n");

  return `# Official Site Inspection

- Generated: ${result.generatedAt}
- Sources queued: ${result.summary.sourcesQueued}
- Sources fetched: ${result.summary.sourcesFetched}
- Sources failed: ${result.summary.sourcesFailed}
- Observed items: ${result.summary.observedItems}
- Pending items: ${result.summary.pendingItems}
- Calendar candidates: ${result.summary.calendarCandidates}

## Policy

Store source links, short summaries, and short quotes only. Do not store full page text, HTML snapshots, images, or videos.

## Inspections

${rows}
`;
}

function htmlToSearchText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">");
}

function classifyHttpFailure(status) {
  if (status === 401 || status === 403) return { ok: false, error: "site_fetch_failed", failureCategory: "access_restricted", failureDetail: `HTTP ${status}` };
  if (status === 404) return { ok: false, error: "site_not_found", failureCategory: "not_found", failureDetail: "HTTP 404" };
  if (status === 429) return { ok: false, error: "site_fetch_failed", failureCategory: "rate_limited", failureDetail: "HTTP 429" };
  if (status >= 500) return { ok: false, error: "site_fetch_failed", failureCategory: "site_unavailable", failureDetail: `HTTP ${status}` };
  return { ok: false, error: "site_fetch_failed", failureCategory: "http_response", failureDetail: `HTTP ${status}` };
}

function classifyThrownFailure(error) {
  const name = String(error?.name ?? "");
  const message = String(error?.message ?? "");
  const code = String(error?.code ?? "");
  if (name === "TimeoutError" || /timeout|aborted/i.test(message)) {
    return { ok: false, error: "site_fetch_failed", failureCategory: "timeout", failureDetail: truncate(message || name, 120) };
  }
  return { ok: false, error: "site_fetch_failed", failureCategory: "network", failureDetail: truncate(`${code} ${message}`.trim() || name, 120) };
}

function isValidMonthDay(month, day) {
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function sqlTimestampOrNull(value) {
  return value ? `${sqlString(toSqlTimestamp(new Date(value)))}::timestamptz` : "NULL";
}

function toSqlTimestamp(value) {
  return value.toISOString().replace("T", " ").replace("Z", "+00");
}

function sqlString(value) {
  if (value == null) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function normalizeKey(value) {
  return normalizeWhitespace(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function truncate(value, max) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function toJstDateKey(date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function dedupeBy(values, getKey) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const key = getKey(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}
