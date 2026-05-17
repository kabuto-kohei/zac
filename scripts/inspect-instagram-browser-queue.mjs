import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { formatSourceCandidate } from "./source-candidate-format.mjs";

const monitorPath = process.env.ZAC_SOURCE_MONITOR_PATH ?? "data/intake/source-monitor-run.json";
const outputJsonPath = process.env.ZAC_INSTAGRAM_INSPECTION_JSON ?? "data/intake/instagram-post-inspection.json";
const outputMdPath = process.env.ZAC_INSTAGRAM_INSPECTION_MD ?? "data/intake/instagram-post-inspection.md";
const outputSqlPath = process.env.ZAC_INSTAGRAM_INSPECTION_SQL ?? "data/intake/instagram-post-observations.sql";
const fixturePath = process.env.ZAC_INSTAGRAM_BROWSER_FIXTURE_JSON ?? "";
const userDataDir = process.env.ZAC_INSTAGRAM_BROWSER_USER_DATA_DIR ?? ".zac-browser/instagram";
const postsPerSource = parsePositiveInt(process.env.ZAC_INSTAGRAM_POSTS_PER_SOURCE, 3);
const sourceLimit = parsePositiveInt(process.env.ZAC_INSTAGRAM_SOURCE_LIMIT ?? process.env.ZAC_INSTAGRAM_POST_SOURCE_LIMIT, 25);
const sourceDelayMs = parsePositiveInt(process.env.ZAC_INSTAGRAM_BROWSER_SOURCE_DELAY_MS, 2500);
const sourceTimeoutMs = parsePositiveInt(process.env.ZAC_INSTAGRAM_BROWSER_SOURCE_TIMEOUT_MS, 60000);
const postTimeoutMs = parsePositiveInt(process.env.ZAC_INSTAGRAM_BROWSER_POST_TIMEOUT_MS, 30000);
const navigationTimeoutMs = parsePositiveInt(process.env.ZAC_INSTAGRAM_BROWSER_NAVIGATION_TIMEOUT_MS, 25000);
const requireAuthenticatedSession = parseBoolean(process.env.ZAC_INSTAGRAM_BROWSER_REQUIRE_AUTH, true);
const headless = parseBoolean(process.env.ZAC_INSTAGRAM_BROWSER_HEADLESS, true);
const generatedAt = new Date();
const generatedAtSql = toSqlTimestamp(generatedAt);

const monitor = JSON.parse(await fs.readFile(monitorPath, "utf8"));
const queue = (monitor.queues?.instagramPostInspection ?? []).slice(0, sourceLimit);
const knownPostUrls = new Set(
  queue.flatMap((source) => source.knownPostUrls ?? source.recentPostUrls ?? []).filter((value) => typeof value === "string"),
);

const result = {
  generatedAt: generatedAt.toISOString(),
  mode: fixturePath ? "browser_fixture" : "browser_roller",
  cadence: {
    targetRunsPerDay: 8,
    targetHoursJst: ["every 3 hours"],
    postsPerSource,
    sourceLimit,
  },
  policy: {
    sourceEligibility: "Only approved official Instagram sources from instagramPostInspection are eligible.",
    savedFields: "post URL, shortcode, displayed/parsed posted date, classification, short summary, short quote, review status, decision note",
    excludedFields: "passwords, cookies, session tokens, full captions, images, videos, comments, DMs, stories",
    publication: "Never publish automatically. Browser observations can only become public after Admin candidate review approval.",
  },
  browserSession: {
    state: "unknown",
    userDataDir: fixturePath ? null : userDataDir,
    headless: fixturePath ? null : headless,
    checkedAt: generatedAt.toISOString(),
    reason: null,
  },
  summary: {
    sourcesQueued: queue.length,
    sourcesVisited: 0,
    sourcesSucceeded: 0,
    sourcesFailed: 0,
    sourcesDeferred: 0,
    profilesWithNoRecentPosts: 0,
    postsSeen: 0,
    newPostsOpened: 0,
    duplicatePostsSkipped: 0,
    observedPosts: 0,
    pendingPosts: 0,
    ignoredPosts: 0,
    calendarCandidates: 0,
  },
  inspections: [],
};

let context = null;
try {
  const fixture = fixturePath ? await readFixture(fixturePath) : null;
  if (fixture) {
    result.browserSession = {
      ...result.browserSession,
      state: fixture.browserSessionState ?? "authenticated",
      reason: fixture.browserSessionReason ?? null,
    };
  } else {
    await fs.mkdir(userDataDir, { recursive: true });
    context = await chromium.launchPersistentContext(userDataDir, {
      channel: process.env.ZAC_INSTAGRAM_BROWSER_CHANNEL || undefined,
      headless,
      locale: "ja-JP",
      timezoneId: "Asia/Tokyo",
      viewport: { width: 1280, height: 900 },
    });
    context.setDefaultNavigationTimeout(navigationTimeoutMs);
    context.setDefaultTimeout(Math.min(sourceTimeoutMs, 30000));
    const page = await context.newPage();
    result.browserSession = await checkBrowserSession(page);
    await page.close();
  }

  if (requireAuthenticatedSession && result.browserSession.state !== "authenticated") {
    result.summary.sourcesDeferred = queue.length;
    result.inspections = queue.map((source) => deferredInspection(source, result.browserSession));
    await writeOutputs(result);
    console.error(`Instagram browser session is not authenticated: ${result.browserSession.state}`);
    process.exitCode = 2;
  } else {
    for (const [index, source] of queue.entries()) {
      const inspection = fixture ? inspectFixtureSource(source, fixture) : await inspectBrowserSource(context, source);
      result.inspections.push(inspection);
      result.summary.sourcesVisited += inspection.deferred ? 0 : 1;
      result.summary.sourcesSucceeded += inspection.ok ? 1 : 0;
      result.summary.sourcesFailed += !inspection.ok && !inspection.deferred ? 1 : 0;
      result.summary.sourcesDeferred += inspection.deferred ? 1 : 0;
      result.summary.profilesWithNoRecentPosts += inspection.noRecentPosts ? 1 : 0;
      result.summary.postsSeen += inspection.postsSeen;
      result.summary.newPostsOpened += inspection.newPostsOpened;
      result.summary.duplicatePostsSkipped += inspection.duplicatePostsSkipped;
      result.summary.observedPosts += inspection.posts.length;
      if (!fixture && index < queue.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, sourceDelayMs));
      }
    }

    const flatPosts = result.inspections.flatMap((inspection) => inspection.posts);
    result.summary.pendingPosts = flatPosts.filter((post) => post.reviewStatus === "pending").length;
    result.summary.ignoredPosts = flatPosts.filter((post) => post.reviewStatus === "ignored").length;
    result.summary.calendarCandidates = flatPosts.filter((post) => post.startsAt).length;
    await writeOutputs(result);
  }
} catch (error) {
  result.browserSession = {
    ...result.browserSession,
    state: "browser_unavailable",
    reason: truncate(String(error?.message ?? error), 180),
  };
  result.summary.sourcesDeferred = queue.length;
  result.inspections = queue.map((source) => deferredInspection(source, result.browserSession));
  await writeOutputs(result);
  console.error(result.browserSession.reason);
  process.exitCode = 2;
} finally {
  if (context) {
    await context.close();
  }
}

console.log(
  JSON.stringify(
    {
      generatedAt: result.generatedAt,
      mode: result.mode,
      browserSession: result.browserSession.state,
      sourcesVisited: result.summary.sourcesVisited,
      sourcesSucceeded: result.summary.sourcesSucceeded,
      sourcesFailed: result.summary.sourcesFailed,
      sourcesDeferred: result.summary.sourcesDeferred,
      postsSeen: result.summary.postsSeen,
      newPostsOpened: result.summary.newPostsOpened,
      observedPosts: result.summary.observedPosts,
      pendingPosts: result.summary.pendingPosts,
      outputJsonPath,
      outputMdPath,
      outputSqlPath,
    },
    null,
    2,
  ),
);

async function inspectBrowserSource(context, source) {
  const page = await context.newPage();
  const sourceStartedAt = Date.now();
  try {
    const profileUrl = normalizeInstagramProfileUrl(source.sourceUrl, source.handle);
    const response = await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: sourceTimeoutMs });
    await page.waitForTimeout(1500);
    const pageState = await classifyInstagramPage(page, response);
    if (pageState.state !== "profile_visible") {
      return {
        ...baseInspection(source),
        ok: false,
        error: pageState.state,
        failureCategory: pageState.category,
        failureDetail: pageState.reason,
      };
    }

    const postUrls = await extractProfilePostUrls(page, source.handle);
    const uniquePostUrls = dedupe(postUrls).slice(0, postsPerSource);
    if (uniquePostUrls.length === 0) {
      const bodyText = normalizeWhitespace(await page.locator("body").innerText({ timeout: 5000 }).catch(() => ""));
      return {
        ...baseInspection(source),
        ok: false,
        error: "post_links_unavailable",
        failureCategory: "post_links_unavailable",
        failureDetail: buildPostLinksUnavailableDetail(bodyText),
        noRecentPosts: true,
      };
    }

    const newPostUrls = uniquePostUrls.filter((url) => !knownPostUrls.has(url));
    const posts = [];
    for (const postUrl of newPostUrls) {
      if (Date.now() - sourceStartedAt > sourceTimeoutMs) {
        break;
      }
      const post = await inspectBrowserPost(page, source, postUrl);
      if (post) {
        posts.push(post);
        knownPostUrls.add(post.sourceUrl);
      }
    }

    return {
      ...baseInspection(source),
      ok: true,
      posts,
      postsSeen: uniquePostUrls.length,
      newPostsOpened: newPostUrls.length,
      duplicatePostsSkipped: uniquePostUrls.length - newPostUrls.length,
      noRecentPosts: uniquePostUrls.length === 0,
    };
  } catch (error) {
    return {
      ...baseInspection(source),
      ok: false,
      error: "browser_source_failed",
      failureCategory: classifyBrowserError(error),
      failureDetail: truncate(String(error?.message ?? error), 180),
    };
  } finally {
    await page.close();
  }
}

async function inspectBrowserPost(page, source, postUrl) {
  try {
    const response = await page.goto(postUrl, { waitUntil: "domcontentloaded", timeout: postTimeoutMs });
    await page.waitForTimeout(1000);
    const pageState = await classifyInstagramPage(page, response);
    if (pageState.category === "login_required" || pageState.category === "checkpoint_required") {
      return null;
    }

    const visibleText = normalizeWhitespace(await page.locator("body").innerText({ timeout: Math.min(postTimeoutMs, 10000) }));
    const shortText = selectRelevantText(visibleText, source.displayName);
    return inspectPost(
      {
        handle: source.handle,
        sourceUrl: normalizeInstagramPostUrl(postUrl),
        sourceExternalId: extractPostExternalId(postUrl),
        sourcePostedAt: extractPostedAtFromPageText(visibleText),
        text: shortText,
      },
      source,
    );
  } catch {
    return null;
  }
}

function inspectFixtureSource(source, fixture) {
  const byHandle = new Map((fixture.sources ?? []).map((item) => [normalizeHandle(item.handle), item]));
  const fixtureSource = byHandle.get(normalizeHandle(source.handle));
  if (!fixtureSource) {
    return {
      ...baseInspection(source),
      ok: false,
      error: "fixture_source_missing",
      failureCategory: "fixture_missing",
      failureDetail: "No fixture entry for source handle.",
    };
  }

  if (fixtureSource.error) {
    return {
      ...baseInspection(source),
      ok: false,
      error: fixtureSource.error,
      failureCategory: fixtureSource.failureCategory ?? "fixture_failure",
      failureDetail: fixtureSource.failureDetail ?? fixtureSource.error,
    };
  }

  const postUrls = dedupe((fixtureSource.posts ?? []).map((post) => normalizeInstagramPostUrl(post.sourceUrl)));
  const newPosts = (fixtureSource.posts ?? []).filter((post) => !knownPostUrls.has(normalizeInstagramPostUrl(post.sourceUrl)));
  const posts = newPosts.map((post) =>
    inspectPost(
      {
        handle: source.handle,
        sourceUrl: normalizeInstagramPostUrl(post.sourceUrl),
        sourceExternalId: post.sourceExternalId ?? extractPostExternalId(post.sourceUrl),
        sourcePostedAt: post.sourcePostedAt ? new Date(post.sourcePostedAt) : null,
        text: normalizeWhitespace(post.text ?? post.captionPreview ?? ""),
      },
      source,
    ),
  );
  for (const post of posts) {
    knownPostUrls.add(post.sourceUrl);
  }

  return {
    ...baseInspection(source),
    ok: true,
    posts,
    postsSeen: postUrls.length,
    newPostsOpened: newPosts.length,
    duplicatePostsSkipped: postUrls.length - newPosts.length,
    noRecentPosts: postUrls.length === 0,
  };
}

function inspectPost(post, source) {
  const classification = classifyText(post.text);
  const dateRange = extractDateRange(post.text);
  const reviewStatus = classification === "notice" || classification === "recruit" ? "ignored" : "pending";
  const title = buildTitle(post.text, classification, source.displayName);
  const formatted = formatSourceCandidate({
    category: classification,
    sourceName: source.displayName,
    sourceType: "official_instagram",
    rawTitle: title,
    startsAt: dateRange?.startsAt ?? null,
    endsAt: dateRange?.endsAt ?? null,
    sourceQuote: buildQuote(post.text),
    extractionConfidence: scoreConfidence(classification, dateRange),
  });

  return {
    eventSourceId: source.eventSourceId,
    handle: source.handle,
    displayName: source.displayName,
    sourceUrl: post.sourceUrl,
    sourceExternalId: post.sourceExternalId,
    sourcePostedAt: post.sourcePostedAt?.toISOString?.() ?? null,
    classification,
    title: formatted.title,
    summary: formatted.summary,
    startsAt: dateRange?.startsAt?.toISOString() ?? null,
    endsAt: dateRange?.endsAt?.toISOString() ?? null,
    sourceQuote: formatted.sourceQuote,
    extractionConfidence: formatted.extractionConfidence,
    reviewStatus,
    decisionNote: reviewStatus === "pending" ? formatted.decisionNote : buildDecisionNote(classification, dateRange),
  };
}

async function checkBrowserSession(page) {
  try {
    const response = await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: navigationTimeoutMs });
    await page.waitForTimeout(1500);
    const state = await classifyInstagramPage(page, response);
    if (state.category === "login_required") {
      return { state: "login_required", userDataDir, headless, checkedAt: new Date().toISOString(), reason: state.reason };
    }
    if (state.category === "checkpoint_required") {
      return { state: "checkpoint_required", userDataDir, headless, checkedAt: new Date().toISOString(), reason: state.reason };
    }
    return { state: "authenticated", userDataDir, headless, checkedAt: new Date().toISOString(), reason: null };
  } catch (error) {
    return {
      state: "browser_unavailable",
      userDataDir,
      headless,
      checkedAt: new Date().toISOString(),
      reason: truncate(String(error?.message ?? error), 180),
    };
  }
}

async function classifyInstagramPage(page, response) {
  const url = page.url();
  const status = response?.status?.() ?? null;
  const text = normalizeWhitespace(await page.locator("body").innerText({ timeout: 5000 }).catch(() => ""));
  if (/\/accounts\/login|login_required|ログイン|Log in|Sign up|Create an account/i.test(`${url}\n${text}`)) {
    return { state: "login_required", category: "login_required", reason: `Instagram login UI detected; status=${status ?? "unknown"}` };
  }
  if (/checkpoint|本人確認|認証コード|suspicious|challenge/i.test(`${url}\n${text}`)) {
    return { state: "checkpoint_required", category: "checkpoint_required", reason: "Instagram checkpoint or challenge UI detected." };
  }
  if (status === 404 || /Sorry, this page isn't available|ページをご利用いただけません/i.test(text)) {
    return { state: "profile_unavailable", category: "profile_unavailable", reason: `Profile or post unavailable; status=${status ?? "unknown"}` };
  }
  if (status && status >= 500) {
    return { state: "instagram_unavailable", category: "instagram_unavailable", reason: `Instagram returned HTTP ${status}` };
  }
  return { state: "profile_visible", category: "profile_visible", reason: null };
}

async function extractProfilePostUrls(page, handle) {
  const urls = await page.locator('a[href*="/p/"], a[href*="/reel/"]').evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.href).filter(Boolean),
  );
  return urls
    .map(normalizeInstagramPostUrl)
    .filter((url) => url && url.startsWith("https://www.instagram.com/"))
    .filter((url) => !url.includes(`/${handle}/tagged`));
}

function buildPostLinksUnavailableDetail(text) {
  if (/ログイン|Log in|Sign up|Create an account/i.test(text)) {
    return "Profile opened without visible post links and login UI text was present.";
  }
  if (/投稿がありません|No Posts Yet/i.test(text)) {
    return "Profile explicitly reported no posts.";
  }
  return "Profile opened but no visible post/reel links were found; selector, login wall, or UI change may require review.";
}

function deferredInspection(source, browserSession) {
  return {
    ...baseInspection(source),
    ok: false,
    deferred: true,
    error: browserSession.state,
    failureCategory: browserSession.state,
    failureDetail: browserSession.reason,
  };
}

function baseInspection(source) {
  return {
    eventSourceId: source.eventSourceId,
    handle: source.handle,
    displayName: source.displayName,
    sourceUrl: source.sourceUrl,
    ok: false,
    deferred: false,
    posts: [],
    postsSeen: 0,
    newPostsOpened: 0,
    duplicatePostsSkipped: 0,
    noRecentPosts: false,
    error: null,
    failureCategory: null,
    failureDetail: null,
  };
}

function classifyText(text) {
  const value = text.toLowerCase();
  if (/(求人|採用|アルバイト|スタッフ募集|recruit)/i.test(text)) return "recruit";
  if (/(貸切|貸し切り|private booking|private event)/i.test(text)) return "private_booking";
  if (/(コンペ|コンペティション|competition|circuit|大会|選手権|stone circuit|tamax|cup|rock on)/i.test(text)) return "competition";
  if (/(ルートセット|セット替え|ホールド替え|課題替え|まぶし替え|壁替え|全面セット|reset|route set|routeset|setting)/i.test(text)) return "route_set";
  if (/(営業時間|営業予定|臨時休業|休業|営業変更|短縮営業|open|close|closed|closure)/i.test(text)) return "opening_change";
  if (/(講習|セッション|道場|体験|ガイダンス|ワークショップ|試し履き|イベント|session|workshop|lesson)/i.test(text)) return "event";
  if (/(お知らせ|告知|news|notice)/i.test(text) || value.length > 0) return "notice";
  return "notice";
}

function extractDateRange(text) {
  const normalized = text.replaceAll("〜", "-").replaceAll("～", "-").replaceAll("ー", "-");
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

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.index - b.index);
  const first = candidates[0];
  const second = candidates.find((candidate) => candidate.index > first.index && candidate.month === first.month) ?? null;
  const time = normalized.match(/(\d{1,2}):(\d{2})/);
  const hour = time ? Number(time[1]) : 10;
  const minute = time ? Number(time[2]) : 0;
  const startsAt = new Date(Date.UTC(first.year, first.month - 1, first.day, hour - 9, minute));
  const endsAt = second ? new Date(Date.UTC(second.year, second.month - 1, second.day, 21 - 9, 0)) : new Date(startsAt.getTime() + 60 * 60 * 1000);
  return { startsAt, endsAt };
}

function buildTitle(text, classification, displayName) {
  const firstLine = text
    .split(/\n|。/)
    .map((line) => line.replace(/^【|】$/g, "").replace(/^《|》$/g, "").trim())
    .find((line) => line.length > 0 && !/^Instagram|いいね|コメント|シェア|Follow/i.test(line));
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

function buildQuote(text) {
  const line = text
    .split(/\n/)
    .map((item) => item.trim())
    .find((item) => item.length > 0 && !/^Instagram|いいね|コメント|シェア|Follow/i.test(item));
  return truncate(line ?? "", 80);
}

function scoreConfidence(classification, dateRange) {
  if (classification === "notice" || classification === "recruit") return "0.40";
  return dateRange ? "0.72" : "0.55";
}

function buildDecisionNote(classification, dateRange) {
  if (classification === "notice") return "Browser roller found no calendar-worthy event signal in the visible post text.";
  if (classification === "recruit") return "Recruiting post; tracked to avoid repeated inspection but not a public calendar item.";
  if (dateRange) return "Browser roller inspected an approved official Instagram source and found a possible calendar candidate; Admin approval is required before publication.";
  return "Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.";
}

function selectRelevantText(text, displayName) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(Instagram|Log in|Sign up|Follow|いいね|コメント|シェア)$/i.test(line));
  const displayIndex = lines.findIndex((line) => line.includes(displayName));
  const selected = displayIndex >= 0 ? lines.slice(displayIndex, displayIndex + 12) : lines.slice(0, 16);
  return truncate(selected.join("\n"), 900);
}

function extractPostedAtFromPageText(text) {
  const match = text.match(/(20\d{2})年\s*(\d{1,2})月\s*(\d{1,2})日|(\d{1,2})月\s*(\d{1,2})日/u);
  if (!match) return null;
  const year = match[1] ? Number(match[1]) : generatedAt.getFullYear();
  const month = Number(match[2] ?? match[4]);
  const day = Number(match[3] ?? match[5]);
  if (!month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, 0, 0));
}

function renderSql(value) {
  const rows = dedupeBy(value.inspections.flatMap((inspection) => inspection.posts), (post) => post.sourceExternalId || post.sourceUrl);
  const checkedSources = value.inspections.filter((inspection) => inspection.ok);
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
      : "-- No successfully inspected sources in this run.";

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
  source_posted_at::timestamptz,
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
FROM observed_posts
ON CONFLICT ("platform", "source_external_id") WHERE "source_external_id" IS NOT NULL DO UPDATE SET
  "event_source_id" = EXCLUDED."event_source_id",
  "handle" = EXCLUDED."handle",
  "source_url" = EXCLUDED."source_url",
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
      : "-- No new observed posts in this run.";

  return `-- Official Instagram browser roller observations.
-- Generated: ${value.generatedAt}
-- Policy: store source links, short summaries, and short quotes only; do not store passwords, cookies, full captions, images, videos, comments, DMs, or stories.

${checkedSourceSql}

${observedPostsSql}
`;
}

function renderPostSqlRow(post) {
  return `    (${sqlString(post.eventSourceId)}::uuid, ${sqlString(post.handle)}, ${sqlString(post.sourceUrl)}, ${sqlString(post.sourceExternalId)}, ${sqlTimestampOrNull(post.sourcePostedAt)}, ${sqlString(post.classification)}, ${sqlString(post.title)}, ${sqlString(post.summary)}, ${sqlTimestampOrNull(post.startsAt)}, ${sqlTimestampOrNull(post.endsAt)}, ${sqlString(post.sourceQuote)}, ${post.extractionConfidence}::numeric, ${sqlString(post.reviewStatus)}, ${sqlString(post.decisionNote)})`;
}

function renderMarkdown(value) {
  const grouped = value.inspections
    .map((inspection) => {
      const posts = inspection.posts.map((post) => `  - ${post.reviewStatus}: ${post.classification} | ${post.title} | ${post.sourceUrl}`).join("\n");
      const failure = inspection.ok ? "" : ` - ${inspection.deferred ? "deferred" : "failed"} (${inspection.failureCategory ?? "unknown"})`;
      const counts = inspection.ok ? ` postsSeen=${inspection.postsSeen}, newOpened=${inspection.newPostsOpened}, duplicates=${inspection.duplicatePostsSkipped}` : "";
      return `- ${inspection.displayName} (${inspection.handle})${failure}${counts}\n${posts || "  - no new posts"}`;
    })
    .join("\n");
  return `# Instagram Browser Roller Inspection

- Generated: ${value.generatedAt}
- Mode: ${value.mode}
- Browser session: ${value.browserSession.state}${value.browserSession.reason ? ` (${value.browserSession.reason})` : ""}
- Target cadence: ${value.cadence.targetRunsPerDay} runs/day (${value.cadence.targetHoursJst.join(", ")} JST)
- Sources queued: ${value.summary.sourcesQueued}
- Sources visited: ${value.summary.sourcesVisited}
- Sources succeeded: ${value.summary.sourcesSucceeded}
- Sources failed: ${value.summary.sourcesFailed}
- Sources deferred: ${value.summary.sourcesDeferred}
- Posts seen: ${value.summary.postsSeen}
- New posts opened: ${value.summary.newPostsOpened}
- Duplicate posts skipped: ${value.summary.duplicatePostsSkipped}
- Observed posts: ${value.summary.observedPosts}
- Pending posts: ${value.summary.pendingPosts}
- Ignored posts: ${value.summary.ignoredPosts}
- Calendar candidates: ${value.summary.calendarCandidates}

## Policy

Only approved official Instagram sources are eligible. Store source links, short summaries, and short quotes only. Do not store passwords, cookies, session tokens, full captions, images, videos, comments, DMs, or stories. Public calendar publication still requires Admin candidate review approval.

## Inspections

${grouped || "No sources queued."}
`;
}

async function writeOutputs(value) {
  await fs.mkdir(path.dirname(outputJsonPath), { recursive: true });
  await fs.writeFile(outputJsonPath, `${JSON.stringify(value, null, 2)}\n`);
  await fs.writeFile(outputMdPath, renderMarkdown(value));
  await fs.writeFile(outputSqlPath, renderSql(value));
}

async function readFixture(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function normalizeInstagramProfileUrl(sourceUrl, handle) {
  if (sourceUrl && /^https:\/\/(?:www\.)?instagram\.com\//u.test(sourceUrl)) {
    return sourceUrl.endsWith("/") ? sourceUrl : `${sourceUrl}/`;
  }
  return `https://www.instagram.com/${encodeURIComponent(handle)}/`;
}

function normalizeInstagramPostUrl(value) {
  try {
    const parsed = new URL(value);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const kindIndex = parts.findIndex((part) => part === "p" || part === "reel");
    if (kindIndex >= 0 && parts[kindIndex + 1]) {
      return `https://www.instagram.com/${parts[kindIndex]}/${parts[kindIndex + 1]}/`;
    }
  } catch {
    return "";
  }
  return "";
}

function extractPostExternalId(value) {
  try {
    const parts = new URL(value).pathname.split("/").filter(Boolean);
    const kindIndex = parts.findIndex((part) => part === "p" || part === "reel");
    return kindIndex >= 0 ? parts[kindIndex + 1] ?? value : value;
  } catch {
    return value;
  }
}

function normalizeHandle(value) {
  return String(value ?? "").replace(/^@/u, "").trim().toLowerCase();
}

function classifyBrowserError(error) {
  const text = String(error?.message ?? error);
  if (/Timeout|timeout/i.test(text)) return "timeout";
  if (/net::ERR|ECONN|ENOTFOUND|EAI_AGAIN|fetch/i.test(text)) return "network";
  return "browser_error";
}

function sqlTimestampOrNull(value) {
  return value ? `${sqlString(toSqlTimestamp(new Date(value)))}::timestamptz` : "NULL::timestamptz";
}

function toSqlTimestamp(value) {
  return value.toISOString().replace("T", " ").replace("Z", "+00");
}

function sqlString(value) {
  if (value == null) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\r/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function truncate(value, max) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
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

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === "1" || value === "true";
}
