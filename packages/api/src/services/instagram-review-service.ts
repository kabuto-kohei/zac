import { and, desc, eq, eventSources, gyms, inArray, isNull, sourcePostObservations } from "@zac/db";
import {
  gymFixtures,
  instagramReviewQueueFixtures,
  type InstagramReviewQueueActionInput,
  type InstagramReviewQueueItem,
} from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";

const queueLimit = 120;

export async function listInstagramReviewQueue() {
  const rows = await listPersistentInstagramReviewQueue();

  if (!isRuntimeFallbackAllowed()) {
    return rows;
  }

  return rows.length > 0 ? rows : instagramReviewQueueFixtures;
}

export async function recordInstagramReviewQueueAction(sourceId: string, input: InstagramReviewQueueActionInput) {
  const db = getDatabase();

  if (!db || !isUuid(sourceId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("not_found", "Instagram source not found.", 404);
    }
    return { sourceId, action: input.action, recorded: true };
  }

  const [source] = await db.select().from(eventSources).where(eq(eventSources.id, sourceId)).limit(1);

  if (!source || source.deletedAt || source.platform !== "instagram") {
    throw new ApiError("not_found", "Instagram source not found.", 404);
  }

  const now = new Date();
  const note = input.reason ?? defaultQueueActionReason(input.action);
  await db
    .update(eventSources)
    .set({
      lastCheckedAt: input.action === "no_info" ? now : source.lastCheckedAt,
      updatedAt: now,
    })
    .where(eq(eventSources.id, sourceId));

  try {
    await db.insert(sourcePostObservations).values({
      eventSourceId: sourceId,
      platform: "instagram",
      handle: source.handle,
      sourceUrl: `${source.sourceUrl}#zac-admin-${input.action}-${now.getTime()}`,
      sourceExternalId: `admin:${sourceId}:${input.action}:${now.getTime()}`,
      observedAt: now,
      classification: "notice",
      title: queueActionTitle(input.action),
      summary: note,
      reviewStatus: input.action === "needs_followup" ? "pending" : "ignored",
      decisionNote: note,
    });
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not record Instagram review action.", 503);
    }
  }

  return { sourceId, action: input.action, recorded: true };
}

async function listPersistentInstagramReviewQueue() {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const sources = await db
      .select()
      .from(eventSources)
      .where(and(eq(eventSources.platform, "instagram"), eq(eventSources.sourceType, "official_instagram"), eq(eventSources.status, "approved"), isNull(eventSources.deletedAt)))
      .orderBy(desc(eventSources.updatedAt))
      .limit(queueLimit);

    if (sources.length === 0) {
      return [];
    }

    const allGyms = await db.select().from(gyms).where(isNull(gyms.deletedAt)).limit(1000);
    const gymBySourceId = new Map<string, (typeof allGyms)[number]>();

    for (const source of sources) {
      const sourceHandle = normalizeHandle(source.handle);
      const sourceUrl = normalizeUrl(source.sourceUrl);
      const matchedGym = allGyms.find((gym) => normalizeHandle(gym.instagramHandle) === sourceHandle || normalizeUrl(gym.instagramUrl) === sourceUrl);
      if (matchedGym) {
        gymBySourceId.set(source.id, matchedGym);
      }
    }

    const observations = await db
      .select()
      .from(sourcePostObservations)
      .where(inArray(sourcePostObservations.eventSourceId, sources.map((source) => source.id)))
      .orderBy(desc(sourcePostObservations.observedAt))
      .limit(500);

    const observationsBySourceId = new Map<string, typeof observations>();
    for (const observation of observations) {
      if (!observation.eventSourceId) {
        continue;
      }
      const sourceObservations = observationsBySourceId.get(observation.eventSourceId) ?? [];
      sourceObservations.push(observation);
      observationsBySourceId.set(observation.eventSourceId, sourceObservations);
    }

    return sources
      .map((source) => {
        const gym = gymBySourceId.get(source.id);
        const sourceObservations = observationsBySourceId.get(source.id) ?? [];
        const latestObservation = sourceObservations[0];
        const fallbackUrl = gym?.websiteUrl ?? "";

        return toQueueItem({
          source,
          gym: gym
            ? { id: gym.id, name: gym.name, area: gym.area ?? "", websiteUrl: fallbackUrl }
            : fallbackGym(source.handle, source.sourceUrl),
          latestObservedAt: latestObservation?.observedAt ?? null,
          observedPosts: sourceObservations.filter((observation) => observation.reviewStatus !== "ignored").length,
          fallbackUrl,
        });
      })
      .sort(compareQueuePriority);
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list Instagram review queue.", 503);
    }
    return [];
  }
}

function toQueueItem(input: {
  source: typeof eventSources.$inferSelect;
  gym: { id: string; name: string; area: string; websiteUrl: string };
  latestObservedAt: Date | null;
  observedPosts: number;
  fallbackUrl: string;
}) {
  const lastCheckedAt = input.source.lastCheckedAt ? formatDate(input.source.lastCheckedAt) : "";
  const lastObservedAt = input.latestObservedAt ? formatDate(input.latestObservedAt) : "";
  const failureCategory = getFailureCategory(input.source.lastCheckedAt, input.latestObservedAt, input.observedPosts);
  const priority = getQueuePriority(failureCategory, input.fallbackUrl);
  const status = getQueueStatus(input.latestObservedAt, input.observedPosts);
  const reviewReason = buildReviewReason(failureCategory, input.source.lastCheckedAt, input.latestObservedAt, input.observedPosts);

  return {
    id: `instagram-review-${input.source.id}`,
    sourceId: input.source.id,
    gymId: input.gym.id,
    gymName: input.gym.name,
    area: input.gym.area,
    handle: input.source.handle,
    sourceUrl: input.source.sourceUrl,
    officialSiteUrl: input.fallbackUrl,
    fallbackAvailable: Boolean(input.fallbackUrl),
    lastCheckedAt,
    lastObservedAt,
    observedPosts: input.observedPosts,
    failureCategory,
    failureDetail: failureDetail(failureCategory),
    priority,
    status,
    reviewReason,
  } satisfies InstagramReviewQueueItem;
}

function fallbackGym(handle: string, sourceUrl: string) {
  const fixture = gymFixtures.find((gym) => normalizeHandle(gym.instagramHandle) === normalizeHandle(handle) || normalizeUrl(gym.instagramUrl) === normalizeUrl(sourceUrl));
  return {
    id: fixture?.id ?? "00000000-0000-0000-0000-000000000000",
    name: fixture?.name ?? handle,
    area: fixture?.area ?? "",
    websiteUrl: fixture?.websiteUrl ?? "",
  };
}

function compareQueuePriority(left: InstagramReviewQueueItem, right: InstagramReviewQueueItem) {
  const rank = { high: 0, normal: 1, low: 2 };
  return rank[left.priority] - rank[right.priority] || left.gymName.localeCompare(right.gymName, "ja");
}

function getFailureCategory(lastCheckedAt: Date | null, latestObservedAt: Date | null, observedPosts: number): InstagramReviewQueueItem["failureCategory"] {
  if (!lastCheckedAt) {
    return "not_checked";
  }
  if (observedPosts > 0 && latestObservedAt) {
    return "no_recent_posts";
  }
  return "access_restricted";
}

function getQueuePriority(failureCategory: InstagramReviewQueueItem["failureCategory"], fallbackUrl: string): InstagramReviewQueueItem["priority"] {
  if (failureCategory === "access_restricted" || failureCategory === "not_checked") {
    return "high";
  }
  return fallbackUrl ? "low" : "normal";
}

function getQueueStatus(latestObservedAt: Date | null, observedPosts: number): InstagramReviewQueueItem["status"] {
  if (observedPosts > 0 && latestObservedAt) {
    return "candidate_available";
  }
  return "needs_human_review";
}

function buildReviewReason(failureCategory: InstagramReviewQueueItem["failureCategory"], lastCheckedAt: Date | null, latestObservedAt: Date | null, observedPosts: number) {
  if (failureCategory === "access_restricted") {
    return "Instagram直取得がログイン要求またはアクセス制限で止まるため、公開プロフィールを管理者が確認します。";
  }
  if (failureCategory === "not_checked") {
    return "まだ自動確認が走っていないため、Instagramと公式サイトを確認します。";
  }
  return `${observedPosts}件の観測があります。最新観測 ${latestObservedAt ? formatDate(latestObservedAt) : "-"} / 最終確認 ${
    lastCheckedAt ? formatDate(lastCheckedAt) : "-"
  }。`;
}

function failureDetail(failureCategory: InstagramReviewQueueItem["failureCategory"]) {
  if (failureCategory === "access_restricted") {
    return "Instagram public endpoint is unstable for unattended access. Admin should open the public profile and record only confirmed facts.";
  }
  if (failureCategory === "not_checked") {
    return "This source has not been checked by the automation yet.";
  }
  return "No confirmed new post is ready for automatic promotion.";
}

function queueActionTitle(action: InstagramReviewQueueActionInput["action"]) {
  if (action === "no_info") {
    return "Instagram確認: 情報なし";
  }
  if (action === "recheck") {
    return "Instagram確認: 再確認";
  }
  return "Instagram確認: 要追加対応";
}

function defaultQueueActionReason(action: InstagramReviewQueueActionInput["action"]) {
  if (action === "no_info") {
    return "Admin confirmed no publishable event information at this time.";
  }
  if (action === "recheck") {
    return "Admin requested this source to be checked again.";
  }
  return "Admin marked this source for follow-up.";
}

function normalizeHandle(value: string | null | undefined) {
  return (value ?? "").replace(/^@/, "").trim().toLowerCase();
}

function normalizeUrl(value: string | null | undefined) {
  return (value ?? "").replace(/\/+$/, "").trim().toLowerCase();
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
