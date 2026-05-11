import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { formatDatabaseError, waitForDatabaseDns } from "./db-runtime.mjs";

const requireFromDbPackage = createRequire(new URL("../packages/db/package.json", import.meta.url));
const postgres = requireFromDbPackage("postgres");

const databaseUrl = process.env.DATABASE_URL;
const outputPath = process.argv[2] ?? "data/intake/source-refresh-plan.json";

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

let sql;

try {
  await waitForDatabaseDns(databaseUrl, { label: "sources:plan-refresh" });
  sql = postgres(databaseUrl, { max: 1, prepare: false });
  const [
    sourceStatusRows,
    sourceTypeRows,
    gymStatusRows,
    eventCategoryRows,
    gymRiskRows,
    dailyApprovedSources,
    instagramPostSources,
    candidateInstagramSources,
    gymInstagramBackfill,
    upcomingEvents,
    closureVerificationRows,
  ] = await Promise.all([
    sql`
      select status, count(*)::int as count
      from event_sources
      where deleted_at is null
      group by status
      order by status
    `,
    sql`
      select source_type, count(*)::int as count
      from event_sources
      where deleted_at is null
      group by source_type
      order by source_type
    `,
    sql`
      select status, count(*)::int as count
      from gyms
      where deleted_at is null
      group by status
      order by status
    `,
    sql`
      select category, count(*)::int as count
      from events
      where deleted_at is null and status = 'scheduled'
      group by category
      order by category
    `,
    sql`
      select
        count(*) filter (where coalesce(instagram_handle, '') = '' and coalesce(instagram_url, '') = '')::int as missing_instagram,
        count(*) filter (where source_type = 'directory_crosscheck')::int as directory_only,
        count(*) filter (where coalesce(source_url, '') = '')::int as missing_source_url
      from gyms
      where deleted_at is null
    `,
    sql`
      select platform, handle, display_name, source_url, source_type, status, relationship_source_handle, last_checked_at, source_verified_at
      from event_sources
      where deleted_at is null
        and status = 'approved'
        and source_type in ('official_instagram', 'official_site')
      order by last_checked_at asc nulls first, source_verified_at asc nulls first, platform asc, handle asc
      limit 80
    `,
    sql`
      select
        s.id,
        s.platform,
        s.handle,
        s.display_name,
        s.source_url,
        s.source_type,
        s.status,
        s.relationship_source_handle,
        s.last_checked_at,
        s.source_verified_at,
        max(o.observed_at) as last_observed_at,
        count(o.id)::int as observed_posts
      from event_sources s
      left join source_post_observations o
        on o.deleted_at is null
        and o.event_source_id = s.id
      where s.deleted_at is null
        and s.status = 'approved'
        and s.platform = 'instagram'
        and s.source_type = 'official_instagram'
      group by
        s.id,
        s.platform,
        s.handle,
        s.display_name,
        s.source_url,
        s.source_type,
        s.status,
        s.relationship_source_handle,
        s.last_checked_at,
        s.source_verified_at
      order by max(o.observed_at) asc nulls first, s.last_checked_at asc nulls first, s.source_verified_at asc nulls first, s.handle asc
      limit 80
    `,
    sql`
      select platform, handle, display_name, source_url, source_type, status, relationship_source_handle, discovery_source, source_verified_at
      from event_sources
      where deleted_at is null
        and status = 'candidate'
        and platform = 'instagram'
      order by source_verified_at asc nulls first, handle asc
      limit 80
    `,
    sql`
      select name, area, source_url, source_attribution, source_verified_at
      from gyms
      where deleted_at is null
        and coalesce(instagram_handle, '') = ''
        and coalesce(instagram_url, '') = ''
      order by source_type = 'official_site' desc, source_verified_at asc nulls first, area asc, name asc
      limit 80
    `,
    sql`
      select category, title, starts_at, ends_at, source_url, source_account, review_status, extraction_confidence
      from events
      where deleted_at is null
        and status = 'scheduled'
        and starts_at >= now()
      order by starts_at asc
      limit 80
    `,
    sql`
      select
        source_external_id,
        name,
        area,
        website_url,
        instagram_handle,
        instagram_url,
        source_url,
        source_attribution,
        source_type,
        source_verified_at
      from gyms
      where deleted_at is null
        and status = 'published'
        and (
          source_verified_at is null
          or source_verified_at < now() - interval '30 days'
          or source_type = 'directory_crosscheck'
          or coalesce(source_url, '') = ''
          or coalesce(website_url, '') = ''
        )
      order by
        case when source_type = 'directory_crosscheck' then 0 else 1 end,
        source_verified_at asc nulls first,
        area asc,
        name asc
      limit 80
    `,
  ]);

  const plan = {
    generatedAt: new Date().toISOString(),
    policy: {
      publicDataOnly: true,
      publishOnly: ["title", "summary", "category", "startsAt", "endsAt", "sourceUrl", "sourceLabel", "shortQuote"],
      neverPublish: ["instagram full caption", "copied image/video", "source_raw_text"],
      instagramFirst:
        "Treat official Instagram profiles as the first freshness signal for gyms. Official websites remain baseline/cross-check sources.",
      calendarRule: "Multi-day events are marked only on the start date; the full period belongs on the detail page.",
      closureRule:
        "Mark closed only with an official closure notice, or with two independent current sources when the official source is unavailable. Partial evidence stays published and queued.",
    },
    summary: {
      sourceStatus: toCountObject(sourceStatusRows, "status"),
      sourceType: toCountObject(sourceTypeRows, "source_type"),
      gymStatus: toCountObject(gymStatusRows, "status"),
      eventCategory: toCountObject(eventCategoryRows, "category"),
      gyms: gymRiskRows[0] ?? { missing_instagram: 0, directory_only: 0, missing_source_url: 0 },
    },
    queues: {
      dailyApprovedSources: dailyApprovedSources.map(formatSource),
      instagramPostInspection: instagramPostSources.map(formatInstagramPostSource),
      candidateInstagramVerification: candidateInstagramSources.map(formatSource),
      gymInstagramBackfill: gymInstagramBackfill.map((gym) => ({
        name: gym.name,
        area: gym.area ?? "",
        sourceUrl: gym.source_url ?? "",
        sourceAttribution: gym.source_attribution ?? "",
        sourceVerifiedAt: formatNullableDate(gym.source_verified_at),
      })),
      upcomingEventReview: upcomingEvents.map((event) => ({
        category: event.category,
        title: event.title,
        startsAt: formatNullableJstDateTime(event.starts_at),
        endsAt: formatNullableJstDateTime(event.ends_at),
        sourceUrl: event.source_url ?? "",
        sourceLabel: event.source_account ?? "",
        reviewStatus: event.review_status,
        extractionConfidence: event.extraction_confidence ?? null,
      })),
      closureVerification: closureVerificationRows.map((gym) => ({
        sourceExternalId: gym.source_external_id,
        name: gym.name,
        area: gym.area ?? "",
        websiteUrl: gym.website_url ?? "",
        instagramHandle: gym.instagram_handle ?? "",
        instagramUrl: gym.instagram_url ?? "",
        sourceUrl: gym.source_url ?? "",
        sourceAttribution: gym.source_attribution ?? "",
        sourceType: gym.source_type ?? "",
        sourceVerifiedAt: formatNullableDate(gym.source_verified_at),
        requiredEvidence:
          "official closure/relocation/rename notice, or two independent current sources if the official source is unavailable",
      })),
    },
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(`wrote ${outputPath}`);
  console.log(
    JSON.stringify(
      {
        sourceStatus: plan.summary.sourceStatus,
        sourceType: plan.summary.sourceType,
        gymBackfillQueue: plan.queues.gymInstagramBackfill.length,
        candidateInstagramQueue: plan.queues.candidateInstagramVerification.length,
        dailyApprovedQueue: plan.queues.dailyApprovedSources.length,
        instagramPostQueue: plan.queues.instagramPostInspection.length,
        upcomingEventReviewQueue: plan.queues.upcomingEventReview.length,
        closureVerificationQueue: plan.queues.closureVerification.length,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(JSON.stringify(formatDatabaseError(error), null, 2));
  process.exitCode = 1;
} finally {
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}

function toCountObject(rows, key) {
  return Object.fromEntries(rows.map((row) => [row[key] ?? "unknown", row.count]));
}

function formatSource(source) {
  return {
    platform: source.platform,
    handle: source.handle,
    displayName: source.display_name ?? source.handle,
    sourceUrl: source.source_url,
    sourceType: source.source_type,
    status: source.status,
    relationshipSourceHandle: source.relationship_source_handle ?? null,
    discoverySource: source.discovery_source ?? "",
    lastCheckedAt: formatNullableDate(source.last_checked_at),
    sourceVerifiedAt: formatNullableDate(source.source_verified_at),
  };
}

function formatInstagramPostSource(source) {
  return {
    eventSourceId: source.id,
    platform: source.platform,
    handle: source.handle,
    displayName: source.display_name ?? source.handle,
    sourceUrl: source.source_url,
    sourceType: source.source_type,
    status: source.status,
    relationshipSourceHandle: source.relationship_source_handle ?? null,
    lastCheckedAt: formatNullableDate(source.last_checked_at),
    sourceVerifiedAt: formatNullableDate(source.source_verified_at),
    lastObservedAt: formatNullableDate(source.last_observed_at),
    observedPosts: source.observed_posts ?? 0,
    requiredEvidence:
      "recent public Instagram post/reel URL plus short summary and classification; no full captions or media copies",
  };
}

function formatNullableDate(value) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function formatNullableJstDateTime(value) {
  if (!value) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}`;
}
