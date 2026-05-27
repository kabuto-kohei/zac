import { and, desc, eq, eventSources, gyms, inArray, isNull, sourcePostObservations } from "@zac/db";
import {
  sourceObservationReviewFixtures,
  type SourceObservationReviewActionInput,
  type SourceObservationReviewItem,
} from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";

const reviewLimit = 120;
const reviewScanLimit = 360;
const lowConfidenceThreshold = "0.60";
const handleStopTokens = new Set([
  "bouldering",
  "climbing",
  "climbinggym",
  "gym",
  "official",
  "tokyo",
  "jp",
]);

export async function listSourceObservationReviewQueue() {
  const rows = await listPersistentSourceObservationReviewQueue();

  if (!isRuntimeFallbackAllowed()) {
    return rows;
  }

  return rows.length > 0 ? rows : sourceObservationReviewFixtures;
}

export async function reviewSourceObservation(observationId: string, input: SourceObservationReviewActionInput) {
  const db = getDatabase();

  if (!db || !isUuid(observationId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("not_found", "Source observation not found.", 404);
    }
    return { observationId, action: input.action, recorded: true };
  }

  const [observation] = await db.select().from(sourcePostObservations).where(eq(sourcePostObservations.id, observationId)).limit(1);

  if (!observation || observation.deletedAt) {
    throw new ApiError("not_found", "Source observation not found.", 404);
  }

  const now = new Date();
  const note = input.reason ?? defaultReviewReason(input.action);
  await db
    .update(sourcePostObservations)
    .set({
      reviewStatus: input.action === "ignore" ? "ignored" : "pending",
      decisionNote: appendDecisionNote(observation.decisionNote, note),
      updatedAt: now,
    })
    .where(eq(sourcePostObservations.id, observationId));

  return { observationId, action: input.action, recorded: true };
}

async function listPersistentSourceObservationReviewQueue() {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const observations = await db
      .select()
      .from(sourcePostObservations)
      .where(
        and(
          isNull(sourcePostObservations.deletedAt),
          eq(sourcePostObservations.platform, "instagram"),
          eq(sourcePostObservations.reviewStatus, "pending"),
        ),
      )
      .orderBy(desc(sourcePostObservations.observedAt))
      .limit(reviewScanLimit);

    const sourceIds = [...new Set(observations.map((observation) => observation.eventSourceId).filter((id): id is string => Boolean(id)))];
    const sources =
      sourceIds.length > 0
        ? await db
            .select()
            .from(eventSources)
            .where(and(isNull(eventSources.deletedAt), inArray(eventSources.id, sourceIds)))
            .limit(sourceIds.length)
        : [];
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    const gymRows = await db.select().from(gyms).where(and(isNull(gyms.deletedAt), eq(gyms.status, "published"))).limit(1000);

    return observations
      .map((observation) => {
        const source = observation.eventSourceId ? sourceById.get(observation.eventSourceId) ?? null : null;
        const gymMatch = resolveGymMatch(observation, source, gymRows);
        return { observation, source, gymMatch };
      })
      .filter((item) => needsHumanSourceReview(item.observation, item.gymMatch))
      .sort(compareReviewItems)
      .slice(0, reviewLimit)
      .map((item) => toReviewItem(item.observation, item.gymMatch));
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list source observations.", 503);
    }
    return [];
  }
}

function toReviewItem(
  observation: typeof sourcePostObservations.$inferSelect,
  gymMatch: { gym: typeof gyms.$inferSelect; reason: string } | null,
): SourceObservationReviewItem {
  const startsAt = observation.startsAt ? formatDateTime(observation.startsAt) : null;
  const confidence = observation.extractionConfidence == null ? null : Number(observation.extractionConfidence);

  return {
    id: observation.id,
    gymName: gymMatch?.gym.name ?? observation.handle,
    gymMatchStatus: gymMatch ? "matched" : "missing",
    gymMatchReason: gymMatch?.reason ?? "掲載ジムとの安全な紐づけが未確定です。",
    handle: observation.handle,
    sourceUrl: observation.sourceUrl,
    sourceLabel: "公式Instagram",
    classification: parseCategory(observation.classification),
    title: observation.title ?? "Instagram投稿確認",
    summary: observation.summary ?? "",
    sourceQuote: observation.sourceQuote ?? "",
    observedAt: formatDateTime(observation.observedAt),
    sourcePostedAt: observation.sourcePostedAt ? formatDateTime(observation.sourcePostedAt) : null,
    startsAt,
    extractionConfidence: Number.isFinite(confidence) ? confidence : null,
    reviewStatus: parseReviewStatus(observation.reviewStatus),
    reviewReason: buildReviewReason(startsAt, confidence, observation.decisionNote, gymMatch),
  };
}

function needsHumanSourceReview(observation: typeof sourcePostObservations.$inferSelect, gymMatch: { gym: typeof gyms.$inferSelect; reason: string } | null) {
  const startsAt = observation.startsAt ? formatDateTime(observation.startsAt) : null;
  const confidence = observation.extractionConfidence == null ? null : Number(observation.extractionConfidence);
  return !startsAt || (confidence != null && confidence <= Number(lowConfidenceThreshold)) || !gymMatch;
}

function compareReviewItems(
  left: {
    observation: typeof sourcePostObservations.$inferSelect;
    gymMatch: { gym: typeof gyms.$inferSelect; reason: string } | null;
  },
  right: {
    observation: typeof sourcePostObservations.$inferSelect;
    gymMatch: { gym: typeof gyms.$inferSelect; reason: string } | null;
  },
) {
  return reviewRank(left.observation, left.gymMatch) - reviewRank(right.observation, right.gymMatch) || right.observation.observedAt.getTime() - left.observation.observedAt.getTime();
}

function reviewRank(observation: typeof sourcePostObservations.$inferSelect, gymMatch: { gym: typeof gyms.$inferSelect; reason: string } | null) {
  if (!gymMatch) return 0;
  if (!observation.startsAt) return 1;
  return 2;
}

function buildReviewReason(
  startsAt: string | null,
  confidence: number | null,
  decisionNote: string | null,
  gymMatch: { gym: typeof gyms.$inferSelect; reason: string } | null,
) {
  if (!gymMatch) {
    return "掲載ジムにまだ紐づいていません。公式性と対象ジムを確認してください。";
  }
  if (!startsAt) {
    return "日付候補が未確定です。情報源を開き、掲載できる日付・内容かを人間が確認してください。";
  }
  if (confidence != null && confidence <= Number(lowConfidenceThreshold)) {
    return "抽出信頼度が低いため、候補レビューへ進める前に根拠と日付を確認してください。";
  }
  return decisionNote || "自動抽出結果の確認が必要です。";
}

function resolveGymMatch(
  observation: typeof sourcePostObservations.$inferSelect,
  source: typeof eventSources.$inferSelect | null,
  gymRows: Array<typeof gyms.$inferSelect>,
) {
  const handle = normalizeHandle(source?.handle ?? observation.handle);
  const sourceUrl = normalizeUrl(source?.sourceUrl);

  const byHandle = gymRows.find((gym) => normalizeHandle(gym.instagramHandle) === handle);
  if (byHandle) {
    return { gym: byHandle, reason: "Instagram handle matched a listed gym." };
  }

  const byProfileUrl = gymRows.find((gym) => sourceUrl && normalizeUrl(gym.instagramUrl) === sourceUrl);
  if (byProfileUrl) {
    return { gym: byProfileUrl, reason: "Instagram profile URL matched a listed gym." };
  }

  const sourceType = source?.sourceType ?? "";
  if (sourceType === "official_site") {
    const byOfficialSite = gymRows.find((gym) => sourceUrl && (normalizeUrl(gym.websiteUrl) === sourceUrl || normalizeUrl(gym.sourceUrl) === sourceUrl));
    if (byOfficialSite) {
      return { gym: byOfficialSite, reason: "Official site URL matched a listed gym." };
    }
  }

  const verifiedSource = source?.status === "approved" && source?.sourceVerifiedAt;
  if (!verifiedSource || sourceType !== "official_instagram") {
    return null;
  }

  const scored = gymRows
    .map((gym) => ({ gym, score: scoreVerifiedHandleGym(handle, source, gym) }))
    .filter((item) => item.score >= 80)
    .sort((left, right) => right.score - left.score || left.gym.name.localeCompare(right.gym.name, "ja"));

  const best = scored[0];
  const second = scored[1];
  if (best && (scored.length === 1 || (second && best.score - second.score >= 20))) {
    return { gym: best.gym, reason: "Verified source handle matched brand/location tokens for a listed gym." };
  }

  return null;
}

function scoreVerifiedHandleGym(handle: string, source: typeof eventSources.$inferSelect, gym: typeof gyms.$inferSelect) {
  const handleTokens = normalizeSearchText(handle)
    .split(" ")
    .flatMap((token) => token.split(/[._-]+/u))
    .filter((token) => token.length >= 3 && !handleStopTokens.has(token));
  const brand = inferBrand(`${handle} ${source.displayName ?? ""}`) ?? inferBrand(`${gym.name} ${gym.sourceUrl ?? ""} ${gym.sourceAttribution ?? ""}`);
  const gymText = normalizeSearchText(`${gym.name} ${gym.area ?? ""} ${gym.sourceExternalId ?? ""} ${gym.sourceUrl ?? ""} ${gym.sourceAttribution ?? ""}`);

  let score = 0;
  if (brand && handle.includes(brand) && gymText.includes(brand)) {
    score += 45;
  }

  for (const token of handleTokens) {
    if (brand && token === brand) continue;
    if (gymText.includes(token)) {
      score += 30;
    }
  }

  return Math.min(score, 100);
}

function inferBrand(value: string) {
  const normalized = normalizeSearchText(value).replace(/\s+/gu, "");
  const brands = ["basecamp", "bpump", "dbouldering", "fishandbird", "noborock", "rocklands", "rocky", "westrock", "zeromito"];
  return brands.find((brand) => normalized.includes(brand)) ?? null;
}

function appendDecisionNote(current: string | null, note: string) {
  const trimmedCurrent = (current ?? "").trim();
  const trimmedNote = note.trim();
  if (!trimmedCurrent) return trimmedNote;
  if (!trimmedNote) return trimmedCurrent;
  return `${trimmedCurrent} Admin note: ${trimmedNote}`;
}

function defaultReviewReason(action: SourceObservationReviewActionInput["action"]) {
  if (action === "ignore") {
    return "Admin marked this observation as not suitable for event candidate review.";
  }
  return "Admin kept this observation pending for later source review.";
}

function parseCategory(value: string | null | undefined): SourceObservationReviewItem["classification"] {
  if (
    value === "event" ||
    value === "lesson" ||
    value === "competition" ||
    value === "route_set" ||
    value === "opening_change" ||
    value === "private_booking" ||
    value === "construction" ||
    value === "notice" ||
    value === "recruit"
  ) {
    return value;
  }
  return "event";
}

function parseReviewStatus(value: string | null | undefined): SourceObservationReviewItem["reviewStatus"] {
  if (value === "ignored" || value === "event_candidate") {
    return value;
  }
  return "pending";
}

function formatDateTime(value: Date) {
  return value.toISOString();
}

function normalizeHandle(value: string | null | undefined) {
  return (value ?? "").replace(/^@/u, "").trim().toLowerCase();
}

function normalizeUrl(value: string | null | undefined) {
  if (!value) return "";
  try {
    const parsed = new URL(value);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/+$/u, "").toLowerCase();
  } catch {
    return value.replace(/\/+$/u, "").trim().toLowerCase();
  }
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/&/gu, " and ")
    .replace(/（.*?）|\(.*?\)/gu, " ")
    .replace(/[^a-z0-9一-龠ぁ-んァ-ヶー._-]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}
