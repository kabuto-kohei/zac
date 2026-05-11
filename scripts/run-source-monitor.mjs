import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { formatDatabaseError, waitForDatabaseDns } from "./db-runtime.mjs";

const requireFromDbPackage = createRequire(new URL("../packages/db/package.json", import.meta.url));
const postgres = requireFromDbPackage("postgres");

const databaseUrl = process.env.DATABASE_URL;
const outputPath = process.argv[2] ?? "data/intake/source-monitor-run.json";
const markdownPath = outputPath.replace(/\.json$/u, ".md");
const now = new Date();
const approvedSourceLimit = parsePositiveInt(process.env.ZAC_SOURCE_APPROVED_LIMIT, 96);
const staleSourceLimit = parsePositiveInt(process.env.ZAC_SOURCE_STALE_LIMIT, 64);
const candidateSourceLimit = parsePositiveInt(process.env.ZAC_SOURCE_CANDIDATE_LIMIT, 96);
const upcomingEventLimit = parsePositiveInt(process.env.ZAC_SOURCE_EVENT_LIMIT, 120);
const gymDisciplineLimit = parsePositiveInt(process.env.ZAC_GYM_DISCIPLINE_LIMIT, 120);
const closureVerificationLimit = parsePositiveInt(process.env.ZAC_GYM_CLOSURE_LIMIT, 80);
const dueIntervalHours = parsePositiveInt(process.env.ZAC_SOURCE_DUE_HOURS, 6);

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

let sql;

try {
  await waitForDatabaseDns(databaseUrl, { label: "sources:monitor" });
  sql = postgres(databaseUrl, { max: 1, prepare: false });
  const [
    approvedSources,
    staleSources,
    candidateSources,
    upcomingEvents,
    eventFingerprints,
    reviewSummaryRows,
    categoryRows,
    gymRows,
    gymDisciplineRows,
    closureVerificationRows,
  ] = await Promise.all([
    sql`
      select platform, handle, display_name, source_url, source_type, last_checked_at, source_verified_at
      from event_sources
      where deleted_at is null
        and status = 'approved'
        and source_type in ('official_instagram', 'official_site')
      order by last_checked_at asc nulls first, source_verified_at asc nulls first, handle asc
      limit ${approvedSourceLimit}
    `,
    sql`
      select platform, handle, display_name, source_url, source_type, last_checked_at, source_verified_at
      from event_sources
      where deleted_at is null
        and status = 'approved'
        and source_type in ('official_instagram', 'official_site')
        and (last_checked_at is null or last_checked_at < now() - (${dueIntervalHours}::text || ' hours')::interval)
      order by last_checked_at asc nulls first, source_verified_at asc nulls first, handle asc
      limit ${staleSourceLimit}
    `,
    sql`
      select platform, handle, display_name, source_url, source_type, relationship_source_handle, discovery_source
      from event_sources
      where deleted_at is null
        and status = 'candidate'
        and platform = 'instagram'
      order by source_verified_at asc nulls first, handle asc
      limit ${candidateSourceLimit}
    `,
    sql`
      select id, category, title, starts_at, ends_at, source_url, source_account, review_status, extraction_confidence
      from events
      where deleted_at is null
        and status = 'scheduled'
        and starts_at >= now()
      order by starts_at asc
      limit ${upcomingEventLimit}
    `,
    sql`
      select e.category, e.title, e.starts_at, e.ends_at, e.source_url, g.name as gym_name
      from events e
      left join gyms g on g.id = e.gym_id
      where e.deleted_at is null
        and e.status = 'scheduled'
      order by e.starts_at desc
      limit 240
    `,
    sql`
      select review_status, count(*)::int as count
      from events
      where deleted_at is null
      group by review_status
      order by review_status
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
        count(*)::int as total,
        count(*) filter (where coalesce(instagram_handle, '') <> '' or coalesce(instagram_url, '') <> '')::int as with_instagram,
        count(*) filter (where source_type = 'official_site')::int as official_site_verified,
        count(*) filter (where source_type = 'directory_crosscheck')::int as directory_only
      from gyms
      where deleted_at is null
        and status = 'published'
    `,
    sql`
      select source_external_id, name, area, disciplines_text, website_url, instagram_handle, instagram_url, source_url, source_attribution, source_type, source_verified_at
      from gyms
      where deleted_at is null
        and status = 'published'
        and (
          disciplines_text is null
          or disciplines_text = ''
          or disciplines_text = 'クライミング'
          or source_type = 'directory_crosscheck'
        )
      order by
        case when coalesce(instagram_handle, '') <> '' or coalesce(instagram_url, '') <> '' then 0 else 1 end,
        case when coalesce(website_url, '') <> '' then 0 else 1 end,
        source_verified_at asc nulls first,
        name asc
      limit ${gymDisciplineLimit}
    `,
    sql`
      select
        g.source_external_id,
        g.name,
        g.area,
        g.website_url,
        g.instagram_handle,
        g.instagram_url,
        g.source_url,
        g.source_attribution,
        g.source_type,
        g.source_verified_at,
        count(es.id) filter (where es.status = 'approved')::int as approved_sources
      from gyms g
      left join event_sources es
        on es.deleted_at is null
        and (
          lower(es.handle) = lower(g.instagram_handle)
          or es.source_url = g.website_url
          or es.source_url = g.instagram_url
          or es.display_name = g.name
        )
      where g.deleted_at is null
        and g.status = 'published'
        and (
          g.source_verified_at is null
          or g.source_verified_at < now() - interval '30 days'
          or g.source_type = 'directory_crosscheck'
          or coalesce(g.source_url, '') = ''
          or coalesce(g.website_url, '') = ''
        )
      group by
        g.source_external_id,
        g.name,
        g.area,
        g.website_url,
        g.instagram_handle,
        g.instagram_url,
        g.source_url,
        g.source_attribution,
        g.source_type,
        g.source_verified_at
      order by
        case when g.source_type = 'directory_crosscheck' then 0 else 1 end,
        case when count(es.id) filter (where es.status = 'approved') = 0 then 0 else 1 end,
        g.source_verified_at asc nulls first,
        g.area asc,
        g.name asc
      limit ${closureVerificationLimit}
    `,
  ]);

  const run = {
    generatedAt: now.toISOString(),
    cadence: {
      approvedSourceCheck: `every ${dueIntervalHours} hours`,
      upcomingEventRecheck: `every ${dueIntervalHours} hours for upcoming public calendar items`,
      candidatePromotion: "daily, after official-site/profile evidence",
      gymAccountBackfill: "weekly",
      closureRelocationRenameRecheck: "monthly, or sooner for directory-only and stale official-source rows",
    },
    policy: {
      sourceUse: "Use official sites and approved official Instagram profiles as source inputs.",
      publicOutput: ["title", "summary", "category", "startsAt", "endsAt", "sourceUrl", "sourceLabel", "shortQuote"],
      neverPublicOutput: ["full Instagram captions", "copied images/videos", "unreviewed raw text"],
      calendarRule: "Multi-day events are marked on the start date only; the full period is shown on the detail page.",
      eventSplitRule:
        "Classify each source item by primary user impact: competition, event/lesson, route_set, private_booking, opening_change, construction, notice, or recruit. If a route-set announcement includes closure/opening times, keep category route_set and store the closure/opening period in startsAt/endsAt. If a post is only a private rental closure, use private_booking. If it is only hours/temporary closure, use opening_change. If it is wall/area work, use construction.",
      closureRule:
        "A gym can be marked closed only with an official closure notice, or with two independent current sources when the official source is unavailable. If evidence is partial, keep the gym published and record it for recheck instead of guessing.",
      publicGrouping: {
        event: ["event", "lesson", "recruit"],
        competition: ["competition"],
        route_set: ["route_set"],
        opening_change: ["opening_change", "construction", "notice"],
        private_booking: ["private_booking"],
      },
    },
    summary: {
      databaseReachable: true,
      gyms: gymRows[0] ?? {},
      eventsByReviewStatus: toCountObject(reviewSummaryRows, "review_status"),
      scheduledEventsByCategory: toCountObject(categoryRows, "category"),
      dueApprovedSources: staleSources.length,
      candidateSources: candidateSources.length,
      upcomingEvents: upcomingEvents.length,
      approvedSourceRotation: approvedSources.length,
      gymDisciplineCandidates: gymDisciplineRows.length,
      closureVerificationCandidates: closureVerificationRows.length,
    },
    queues: {
      inspectNow: staleSources.map(formatSource),
      approvedSourceRotation: approvedSources.map(formatSource),
      operatorBatch: [...staleSources, ...approvedSources.filter((source) => !staleSources.some((stale) => stale.platform === source.platform && stale.handle === source.handle))]
        .slice(0, Math.min(16, Math.max(8, staleSourceLimit)))
        .map(formatSource),
      candidateVerification: candidateSources.map(formatCandidateSource),
      gymDisciplineVerification: gymDisciplineRows.map(formatGymDisciplineCandidate),
      closureVerification: closureVerificationRows.map(formatClosureCandidate),
      upcomingEventRecheck: upcomingEvents.map(formatEvent),
      existingEventFingerprints: eventFingerprints.map(formatEventFingerprint),
    },
    operatorChecklist: [
      "Open inspectNow first; if it is empty, process approvedSourceRotation in order. Use large batches and stop only at the configured source limit or a human gate.",
      "Look only for public, official updates that affect visit planning: competitions, lessons, route sets, construction, opening changes, closures, or recruitment.",
      "Before inserting an event, compare against queues.existingEventFingerprints by category, gym, normalized title, start date, and source host.",
      "Do not copy images, videos, or full captions.",
      "For each valid update, create or update an events row with a short summary, a source URL, and review_status = approved only when the source is clear.",
      "For uncertain extraction, keep review_status = pending and do not show it in public UI.",
      "After a source is checked, update event_sources.last_checked_at in the applied seed or an explicit SQL patch.",
      "For gym discipline filters, classify boulder/lead only from official site, official Instagram/SNS, or operator-owned source evidence; leave directory-only uncertainty as クライミング.",
      "For closure, relocation, or rename checks, update gym status only when evidence is clear. Prefer official closure notices; if official pages are gone, require two independent current sources before status = closed.",
    ],
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(run, null, 2)}\n`);
  await fs.writeFile(markdownPath, renderMarkdown(run));

  console.log(`wrote ${outputPath}`);
  console.log(`wrote ${markdownPath}`);
  console.log(
    JSON.stringify(
      {
        databaseReachable: run.summary.databaseReachable,
        dueApprovedSources: run.summary.dueApprovedSources,
        candidateSources: run.summary.candidateSources,
        upcomingEvents: run.summary.upcomingEvents,
        gymDisciplineCandidates: run.summary.gymDisciplineCandidates,
        closureVerificationCandidates: run.summary.closureVerificationCandidates,
        gymsWithInstagram: run.summary.gyms.with_instagram,
        gymsTotal: run.summary.gyms.total,
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

function formatSource(source) {
  return {
    platform: source.platform,
    handle: source.handle,
    displayName: source.display_name ?? source.handle,
    sourceUrl: source.source_url,
    sourceType: source.source_type,
    lastCheckedAt: formatNullableDateTime(source.last_checked_at),
    sourceVerifiedAt: formatNullableDateTime(source.source_verified_at),
  };
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatCandidateSource(source) {
  return {
    platform: source.platform,
    handle: source.handle,
    displayName: source.display_name ?? source.handle,
    sourceUrl: source.source_url,
    sourceType: source.source_type,
    relationshipSourceHandle: source.relationship_source_handle ?? null,
    discoverySource: source.discovery_source ?? null,
    requiredEvidence: "official site link, official profile identity, or gym/operator page before approval",
  };
}

function formatGymDisciplineCandidate(gym) {
  return {
    sourceExternalId: gym.source_external_id,
    name: gym.name,
    area: gym.area,
    currentDisciplines: gym.disciplines_text ?? "クライミング",
    websiteUrl: gym.website_url ?? "",
    instagramHandle: gym.instagram_handle ?? "",
    instagramUrl: gym.instagram_url ?? "",
    sourceUrl: gym.source_url ?? "",
    sourceAttribution: gym.source_attribution ?? "",
    sourceType: gym.source_type ?? "",
    sourceVerifiedAt: formatNullableDateTime(gym.source_verified_at),
    rule: "Use official site or official SNS evidence before changing disciplines to ボルダー, リード, or ボルダー / リード. Do not use ルート as a discipline label because it can mean either bouldering problems or lead routes.",
  };
}

function formatClosureCandidate(gym) {
  return {
    sourceExternalId: gym.source_external_id,
    name: gym.name,
    area: gym.area,
    websiteUrl: gym.website_url ?? "",
    instagramHandle: gym.instagram_handle ?? "",
    instagramUrl: gym.instagram_url ?? "",
    sourceUrl: gym.source_url ?? "",
    sourceAttribution: gym.source_attribution ?? "",
    sourceType: gym.source_type ?? "",
    sourceVerifiedAt: formatNullableDateTime(gym.source_verified_at),
    approvedSources: gym.approved_sources ?? 0,
    requiredEvidence:
      "Use official closure/relocation/rename notice when available. If official source is unavailable or removed, require two independent current sources before changing gym status to closed. Otherwise leave published and schedule recheck.",
    allowedStatusUpdate: ["published", "closed"],
  };
}

function formatEvent(event) {
  return {
    id: event.id,
    category: event.category,
    title: event.title,
    startsAt: formatNullableJstDateTime(event.starts_at),
    endsAt: formatNullableJstDateTime(event.ends_at),
    sourceUrl: event.source_url ?? "",
    sourceLabel: event.source_account ?? "",
    reviewStatus: event.review_status,
    extractionConfidence: event.extraction_confidence ?? null,
  };
}

function formatEventFingerprint(event) {
  return {
    key: [
      normalizeKey(event.category),
      normalizeKey(event.gym_name ?? "zac"),
      normalizeKey(event.title),
      formatNullableJstDateTime(event.starts_at)?.slice(0, 10) ?? "",
      normalizeHost(event.source_url ?? ""),
    ]
      .filter(Boolean)
      .join("|"),
    category: event.category,
    gymName: event.gym_name ?? "Zac",
    title: event.title,
    startsAt: formatNullableJstDateTime(event.starts_at),
    endsAt: formatNullableJstDateTime(event.ends_at),
    sourceHost: normalizeHost(event.source_url ?? ""),
  };
}

function toCountObject(rows, key) {
  return Object.fromEntries(rows.map((row) => [row[key] ?? "unknown", row.count]));
}

function formatNullableDateTime(value) {
  return value ? value.toISOString() : null;
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

function renderMarkdown(run) {
  const sourceRows = run.queues.inspectNow
    .slice(0, 12)
    .map((source, index) => `${index + 1}. ${source.displayName} (${source.handle}) - ${source.sourceUrl}`)
    .join("\n");
  const operatorRows = run.queues.operatorBatch
    .slice(0, 16)
    .map((source, index) => `${index + 1}. ${source.displayName} (${source.handle}) - ${source.sourceUrl}`)
    .join("\n");
  const eventRows = run.queues.upcomingEventRecheck
    .slice(0, 12)
    .map((event, index) => `${index + 1}. ${event.category}: ${event.title} - ${event.startsAt}`)
    .join("\n");
  const fingerprintRows = run.queues.existingEventFingerprints
    .slice(0, 16)
    .map((event) => `- ${event.key}`)
    .join("\n");
  const disciplineRows = run.queues.gymDisciplineVerification
    .slice(0, 24)
    .map((gym, index) => `${index + 1}. ${gym.name} (${gym.area}) - ${gym.currentDisciplines || "未設定"} - ${gym.sourceUrl || gym.websiteUrl || gym.instagramUrl}`)
    .join("\n");
  const closureRows = run.queues.closureVerification
    .slice(0, 24)
    .map((gym, index) => `${index + 1}. ${gym.name} (${gym.area}) - ${gym.sourceUrl || gym.websiteUrl || gym.instagramUrl || "source missing"} - ${gym.sourceType}`)
    .join("\n");

  return `# Source Monitor Run

- Generated: ${run.generatedAt}
- Due approved sources: ${run.summary.dueApprovedSources}
- Candidate Instagram sources: ${run.summary.candidateSources}
- Upcoming event rechecks: ${run.summary.upcomingEvents}
- Gym discipline verification candidates: ${run.summary.gymDisciplineCandidates}
- Closure verification candidates: ${run.summary.closureVerificationCandidates}
- Gyms with Instagram: ${run.summary.gyms.with_instagram}/${run.summary.gyms.total}

## Inspect Now

${sourceRows || "No stale approved sources."}

## Operator Batch

${operatorRows || "No approved sources in rotation."}

## Upcoming Event Recheck

${eventRows || "No upcoming events."}

## Existing Event Fingerprints

${fingerprintRows || "No scheduled event fingerprints."}

## Gym Discipline Verification

${disciplineRows || "No discipline verification candidates."}

## Closure / Relocation / Rename Verification

${closureRows || "No closure verification candidates."}

## Rules

- Publish only title, summary, category, date/time, source link, source label, and short quote.
- Do not publish full Instagram captions or copied images/videos.
- Multi-day events are marked on the start date only.
- Route-set announcements that include closure/opening times stay in route_set; private rental closures use private_booking; area work uses construction; pure temporary hours changes use opening_change.
- Gym discipline filters must use official site or official SNS evidence; keep directory-only uncertainty as クライミング.
- Do not use ルート as a gym discipline label. Use only ボルダー, リード, ボルダー / リード, or クライミング.
- Mark a gym closed only from an official closure notice, or from two independent current sources when the official source is unavailable. Partial evidence stays published and queued for recheck.
- Compare new findings with existing fingerprints before inserting.
- Keep uncertain extraction as pending.
`;
}

function normalizeKey(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\s　]+/gu, "")
    .replace(/[^\p{L}\p{N}_-]+/gu, "");
}

function normalizeHost(value) {
  try {
    return new URL(value).hostname.replace(/^www\./u, "");
  } catch {
    return "";
  }
}
