import { and, asc, desc, eq, gyms, inArray, isNull, lte, or, sourcePostObservations } from "@zac/db";
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
const lowConfidenceThreshold = "0.60";

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
          or(isNull(sourcePostObservations.startsAt), lte(sourcePostObservations.extractionConfidence, lowConfidenceThreshold)),
        ),
      )
      .orderBy(asc(sourcePostObservations.startsAt), desc(sourcePostObservations.observedAt))
      .limit(reviewLimit);

    const handles = [...new Set(observations.map((observation) => observation.handle).filter(Boolean))];
    const gymRows =
      handles.length > 0
        ? await db
            .select()
            .from(gyms)
            .where(and(isNull(gyms.deletedAt), inArray(gyms.instagramHandle, handles)))
            .limit(1000)
        : [];
    const gymByHandle = new Map(gymRows.map((gym) => [normalizeHandle(gym.instagramHandle), gym]));

    return observations.map((observation) => toReviewItem(observation, gymByHandle.get(normalizeHandle(observation.handle))?.name ?? null));
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list source observations.", 503);
    }
    return [];
  }
}

function toReviewItem(observation: typeof sourcePostObservations.$inferSelect, gymName: string | null): SourceObservationReviewItem {
  const startsAt = observation.startsAt ? formatDateTime(observation.startsAt) : null;
  const confidence = observation.extractionConfidence == null ? null : Number(observation.extractionConfidence);

  return {
    id: observation.id,
    gymName: gymName ?? observation.handle,
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
    reviewReason: buildReviewReason(startsAt, confidence, observation.decisionNote),
  };
}

function buildReviewReason(startsAt: string | null, confidence: number | null, decisionNote: string | null) {
  if (!startsAt) {
    return "日付候補が未確定です。情報源を開き、掲載できる日付・内容かを人間が確認してください。";
  }
  if (confidence != null && confidence <= Number(lowConfidenceThreshold)) {
    return "抽出信頼度が低いため、候補レビューへ進める前に根拠と日付を確認してください。";
  }
  return decisionNote || "自動抽出結果の確認が必要です。";
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
