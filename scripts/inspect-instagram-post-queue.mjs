import fs from "node:fs/promises";

const monitorPath = process.env.ZAC_SOURCE_MONITOR_PATH ?? "data/intake/source-monitor-run.json";
const outputJsonPath = process.env.ZAC_INSTAGRAM_INSPECTION_JSON ?? "data/intake/instagram-post-inspection.json";
const outputMdPath = process.env.ZAC_INSTAGRAM_INSPECTION_MD ?? "data/intake/instagram-post-inspection.md";
const outputSqlPath = process.env.ZAC_INSTAGRAM_INSPECTION_SQL ?? "data/intake/instagram-post-observations.sql";
const postsPerSource = parsePositiveInt(process.env.ZAC_INSTAGRAM_POSTS_PER_SOURCE, 3);
const sourceLimit = parsePositiveInt(process.env.ZAC_INSTAGRAM_SOURCE_LIMIT, 64);
const requestDelayMs = parsePositiveInt(process.env.ZAC_INSTAGRAM_REQUEST_DELAY_MS, 2000);
const requestTimeoutMs = parsePositiveInt(process.env.ZAC_INSTAGRAM_REQUEST_TIMEOUT_MS, 8000);
const generatedAt = new Date();
const generatedAtSql = toSqlTimestamp(generatedAt);

const monitor = JSON.parse(await fs.readFile(monitorPath, "utf8"));
const queue = (monitor.queues?.instagramPostInspection ?? []).slice(0, sourceLimit);
const previousResult = await readPreviousResult(outputJsonPath);
const previousByHandle = new Map((previousResult?.inspections ?? []).map((inspection) => [inspection.handle, inspection]));

if (process.env.ZAC_INSTAGRAM_REUSE_PREVIOUS === "1" && previousResult) {
  previousResult.generatedAt = generatedAt.toISOString();
  await fs.writeFile(outputJsonPath, `${JSON.stringify(previousResult, null, 2)}\n`);
  await fs.writeFile(outputMdPath, renderMarkdown(previousResult));
  await fs.writeFile(outputSqlPath, renderSql(previousResult));
  console.log(
    JSON.stringify(
      {
        generatedAt: previousResult.generatedAt,
        reusedPrevious: true,
        sourcesFetched: previousResult.summary.sourcesFetched,
        sourcesFailed: previousResult.summary.sourcesFailed,
        observedPosts: previousResult.summary.observedPosts,
        outputJsonPath,
        outputMdPath,
        outputSqlPath,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const inspections = [];
for (const source of queue) {
  const profile = await fetchProfile(source.handle);
  const previous = previousByHandle.get(source.handle);
  const posts = extractPosts(profile, source).slice(0, postsPerSource).map((post) => inspectPost(post, source));
  const shouldUsePrevious = profile?.error && previous?.ok;
  inspections.push({
    eventSourceId: source.eventSourceId,
    handle: source.handle,
    displayName: source.displayName,
    sourceUrl: source.sourceUrl,
    ok: shouldUsePrevious ? true : Boolean(profile && !profile.error),
    posts: shouldUsePrevious ? previous.posts : posts,
    error: shouldUsePrevious ? null : (profile?.error ?? null),
    reusedPrevious: shouldUsePrevious,
  });
  await sleep(requestDelayMs);
}

const flatPosts = inspections.flatMap((inspection) => inspection.posts);
const result = {
  generatedAt: generatedAt.toISOString(),
  policy: {
    savedFields: "post URL, shortcode, posted date, classification, short summary, short quote, review status",
    excludedFields: "full captions, images, videos",
  },
  summary: {
    sourcesQueued: queue.length,
    sourcesFetched: inspections.filter((inspection) => inspection.ok).length,
    sourcesFailed: inspections.filter((inspection) => !inspection.ok).length,
    observedPosts: flatPosts.length,
    pendingPosts: flatPosts.filter((post) => post.reviewStatus === "pending").length,
    ignoredPosts: flatPosts.filter((post) => post.reviewStatus === "ignored").length,
    calendarCandidates: flatPosts.filter((post) => post.startsAt).length,
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
      observedPosts: result.summary.observedPosts,
      pendingPosts: result.summary.pendingPosts,
      ignoredPosts: result.summary.ignoredPosts,
      outputJsonPath,
      outputMdPath,
      outputSqlPath,
    },
    null,
    2,
  ),
);

async function fetchProfile(handle) {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "accept": "application/json,text/plain,*/*",
          "referer": `https://www.instagram.com/${encodeURIComponent(handle)}/`,
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 ZacSourceMonitor/1.0",
          "x-ig-app-id": "936619743392459",
        },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      if (json?.status === "fail") {
        return { error: json.message || "instagram_api_failed" };
      }
      return json?.data?.user ?? { error: "profile_not_found" };
    } catch {
      if (attempt === 3) {
        return { error: "profile_fetch_failed" };
      }
      await sleep(750 * attempt * attempt);
    }
  }
  return null;
}

async function readPreviousResult(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

function extractPosts(profile, source) {
  if (profile?.error) {
    return [];
  }
  const edges = profile?.edge_owner_to_timeline_media?.edges ?? [];
  return edges.map((edge) => {
    const node = edge.node;
    return {
      handle: source.handle,
      shortcode: node.shortcode,
      sourceUrl: `https://www.instagram.com/p/${node.shortcode}/`,
      sourcePostedAt: node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000) : null,
      caption: normalizeWhitespace(node.edge_media_to_caption?.edges?.[0]?.node?.text ?? ""),
      isVideo: Boolean(node.is_video),
    };
  });
}

function inspectPost(post, source) {
  const classification = classifyCaption(post.caption);
  const dateRange = extractDateRange(post.caption);
  const reviewStatus = classification === "notice" || classification === "recruit" ? "ignored" : "pending";
  const title = buildTitle(post.caption, classification, source.displayName);
  const summary = buildSummary(source.displayName, classification, dateRange);

  return {
    eventSourceId: source.eventSourceId,
    handle: source.handle,
    displayName: source.displayName,
    sourceUrl: post.sourceUrl,
    sourceExternalId: post.shortcode,
    sourcePostedAt: post.sourcePostedAt?.toISOString() ?? null,
    classification,
    title,
    summary,
    startsAt: dateRange?.startsAt?.toISOString() ?? null,
    endsAt: dateRange?.endsAt?.toISOString() ?? null,
    sourceQuote: buildQuote(post.caption),
    extractionConfidence: scoreConfidence(classification, dateRange),
    reviewStatus,
    decisionNote: buildDecisionNote(classification, dateRange),
  };
}

function classifyCaption(caption) {
  const value = caption.toLowerCase();
  if (/(求人|採用|アルバイト|スタッフ募集|recruit)/i.test(caption)) return "recruit";
  if (/(貸切|貸し切り|private booking|private event)/i.test(caption)) return "private_booking";
  if (/(コンペ|コンペティション|competition|circuit|大会|選手権|stone circuit|tamax|cup|rock on)/i.test(caption)) return "competition";
  if (/(ルートセット|セット替え|ホールド替え|課題替え|まぶし替え|壁替え|全面セット|reset|route set|routeset|setting)/i.test(caption)) return "route_set";
  if (/(営業時間|営業予定|臨時休業|休業|営業変更|短縮営業|open|close|closed|closure)/i.test(caption)) return "opening_change";
  if (/(講習|セッション|道場|体験|ガイダンス|ワークショップ|試し履き|イベント|session|workshop|lesson)/i.test(caption)) return "event";
  if (/(お知らせ|告知|news|notice)/i.test(caption) || value.length > 0) return "notice";
  return "notice";
}

function extractDateRange(caption) {
  const normalized = caption.replaceAll("〜", "-").replaceAll("～", "-").replaceAll("ー", "-");
  const candidates = [];
  const monthDayPattern = /(?:(20\d{2})[年\/.-])?\s*(\d{1,2})\s*(?:月|\/|\.)\s*(\d{1,2})\s*(?:日)?/g;
  let match;
  while ((match = monthDayPattern.exec(normalized)) !== null) {
    const year = match[1] ? Number(match[1]) : generatedAt.getFullYear();
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      candidates.push({ year, month, day, index: match.index });
    }
  }

  if (candidates.length === 0) {
    const dayOnlyMatches = [...normalized.matchAll(/(?:^|[^\d])(\d{1,2})日/g)];
    const titleMonth = normalized.match(/(\d{1,2})月/);
    if (titleMonth) {
      const month = Number(titleMonth[1]);
      for (const dayMatch of dayOnlyMatches.slice(0, 2)) {
        const day = Number(dayMatch[1]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          candidates.push({ year: generatedAt.getFullYear(), month, day, index: dayMatch.index ?? 0 });
        }
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => a.index - b.index);
  const first = candidates[0];
  const second = candidates.find((candidate) => candidate.index > first.index && candidate.month === first.month) ?? null;
  const time = normalized.match(/(\d{1,2}):(\d{2})/);
  const hour = time ? Number(time[1]) : 10;
  const minute = time ? Number(time[2]) : 0;
  const startsAt = new Date(Date.UTC(first.year, first.month - 1, first.day, hour - 9, minute));
  const endsAt = second
    ? new Date(Date.UTC(second.year, second.month - 1, second.day, 21 - 9, 0))
    : new Date(startsAt.getTime() + 60 * 60 * 1000);
  return { startsAt, endsAt };
}

function buildTitle(caption, classification, displayName) {
  const firstLine = caption
    .split(/\n|。/)
    .map((line) => line.replace(/^【|】$/g, "").replace(/^《|》$/g, "").trim())
    .find((line) => line.length > 0);
  const fallback = {
    competition: "コンペ情報",
    route_set: "セット情報",
    opening_change: "営業情報",
    private_booking: "貸切情報",
    event: "イベント情報",
    recruit: "採用情報",
    notice: "投稿確認",
  }[classification];
  return truncate(firstLine || `${displayName} ${fallback}`, 80);
}

function buildSummary(displayName, classification, dateRange) {
  const label = {
    competition: "コンペ・大会",
    route_set: "セット替え",
    opening_change: "営業時間変更",
    private_booking: "貸切",
    event: "イベント",
    recruit: "採用",
    notice: "一般告知",
  }[classification];
  const dateText = dateRange ? ` 日付候補は${formatDate(dateRange.startsAt)}。` : "";
  return `${displayName}の公式Instagram投稿を${label}として確認。${dateText}公開UIに出す前に詳細確認が必要。`;
}

function buildQuote(caption) {
  const line = caption
    .split(/\n/)
    .map((item) => item.trim())
    .find((item) => item.length > 0);
  return truncate(line ?? "", 80);
}

function scoreConfidence(classification, dateRange) {
  if (classification === "notice" || classification === "recruit") return "0.40";
  return dateRange ? "0.72" : "0.55";
}

function buildDecisionNote(classification, dateRange) {
  if (classification === "notice") return "No calendar-worthy event signal found in the inspected caption preview.";
  if (classification === "recruit") return "Recruiting post; tracked to avoid repeated inspection but not a public calendar item.";
  if (dateRange) return "Potential calendar candidate from official Instagram; keep pending until human/source cross-check.";
  return "Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.";
}

function renderSql(result) {
  const rows = dedupeBy(result.inspections.flatMap((inspection) => inspection.posts), (post) => post.sourceUrl);
  const checkedSources = result.inspections.filter((inspection) => inspection.ok);
  const checkedSourceSql =
    checkedSources.length > 0
      ? `WITH checked_sources (id, handle) AS (
  VALUES
${checkedSources.map((source) => `    (${sqlString(source.eventSourceId)}::uuid, ${sqlString(source.handle)})`).join(",\n")}
)
UPDATE "event_sources" s
SET
  "last_checked_at" = ${sqlString(generatedAtSql)}::timestamptz,
  "updated_at" = now()
FROM checked_sources c
WHERE s."id" = c.id
  AND s."handle" = c.handle;`
      : `-- No successfully fetched sources in this run.`;
  const observedPostsSql =
    rows.length > 0
      ? `WITH observed_posts (
  event_source_id,
  handle,
  source_url,
  source_external_id,
  source_posted_at,
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
${rows.map(renderPostSqlRow).join(",\n")}
)
INSERT INTO "source_post_observations" (
  "event_source_id",
  "platform",
  "handle",
  "source_url",
  "source_external_id",
  "source_posted_at",
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
  'instagram',
  handle,
  source_url,
  source_external_id,
  source_posted_at,
  ${sqlString(generatedAtSql)}::timestamptz,
  classification,
  title,
  summary,
  starts_at,
  ends_at,
  source_quote,
  extraction_confidence,
  review_status,
  decision_note
FROM observed_posts
ON CONFLICT ("source_url") DO UPDATE SET
  "event_source_id" = EXCLUDED."event_source_id",
  "handle" = EXCLUDED."handle",
  "source_external_id" = EXCLUDED."source_external_id",
  "source_posted_at" = EXCLUDED."source_posted_at",
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
      : `-- No observed posts in this run.`;
  return `-- Official Instagram post observations generated from instagramPostInspection.
-- Generated: ${result.generatedAt}
-- Policy: store source links, short summaries, and short quotes only; do not store full captions or media.

${checkedSourceSql}

${observedPostsSql}
`;
}

function renderPostSqlRow(post) {
  return `    (${sqlString(post.eventSourceId)}::uuid, ${sqlString(post.handle)}, ${sqlString(post.sourceUrl)}, ${sqlString(post.sourceExternalId)}, ${sqlTimestampOrNull(post.sourcePostedAt)}, ${sqlString(post.classification)}, ${sqlString(post.title)}, ${sqlString(post.summary)}, ${sqlTimestampOrNull(post.startsAt)}, ${sqlTimestampOrNull(post.endsAt)}, ${sqlString(post.sourceQuote)}, ${post.extractionConfidence}::numeric, ${sqlString(post.reviewStatus)}, ${sqlString(post.decisionNote)})`;
}

function renderMarkdown(result) {
  const grouped = result.inspections
    .map((inspection) => {
      const posts = inspection.posts
        .map((post) => `  - ${post.reviewStatus}: ${post.classification} | ${post.title} | ${post.sourceUrl}`)
        .join("\n");
      return `- ${inspection.displayName} (${inspection.handle})${inspection.ok ? "" : " - fetch failed"}\n${posts || "  - no posts"}`;
    })
    .join("\n");
  return `# Instagram Post Inspection

- Generated: ${result.generatedAt}
- Sources queued: ${result.summary.sourcesQueued}
- Sources fetched: ${result.summary.sourcesFetched}
- Sources failed: ${result.summary.sourcesFailed}
- Observed posts: ${result.summary.observedPosts}
- Pending posts: ${result.summary.pendingPosts}
- Ignored posts: ${result.summary.ignoredPosts}
- Calendar candidates: ${result.summary.calendarCandidates}

## Policy

Store source links, short summaries, and short quotes only. Do not store full captions, images, or videos.

## Inspections

${grouped}
`;
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
  return value.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function truncate(value, max) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
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
