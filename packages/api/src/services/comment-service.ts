import { and, comments, desc, eq, isNull } from "@zac/db";
import type { CommentSummary, CreateCommentInput } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";

type CommentTargetType = "session_plan" | "post";

const memoryComments = new Map<string, CommentSummary[]>();
let memoryCommentCount = 0;

export async function listComments(targetType: CommentTargetType, targetId: string) {
  const persisted = await listPersistentComments(targetType, targetId);
  return [...getMemoryComments(targetType, targetId), ...persisted];
}

export async function createComment(targetType: CommentTargetType, targetId: string, input: CreateCommentInput, actorId?: string) {
  const persisted = await createPersistentComment(targetType, targetId, input, actorId);

  if (persisted) {
    return persisted;
  }

  memoryCommentCount += 1;
  const comment = {
    id: `local-comment-${memoryCommentCount}`,
    body: input.body,
    authorName: "Climber",
    createdAt: formatDateTime(new Date()),
  } satisfies CommentSummary;

  const key = getCommentKey(targetType, targetId);
  memoryComments.set(key, [comment, ...getMemoryComments(targetType, targetId)]);
  return comment;
}

async function createPersistentComment(targetType: CommentTargetType, targetId: string, input: CreateCommentInput, actorId?: string) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(targetId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for comments.", 503);
    }
    return null;
  }

  try {
    const [row] = await db
      .insert(comments)
      .values({
        targetType,
        targetId,
        createdBy: actorId,
        body: input.body,
      })
      .returning();

    return row ? toCommentSummary(row) : null;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not create comment.", 503);
    }
    return null;
  }
}

async function listPersistentComments(targetType: CommentTargetType, targetId: string) {
  const db = getDatabase();

  if (!db || !isUuid(targetId)) {
    return [];
  }

  try {
    const rows = await db
      .select()
      .from(comments)
      .where(and(eq(comments.targetType, targetType), eq(comments.targetId, targetId), isNull(comments.deletedAt)))
      .orderBy(desc(comments.createdAt))
      .limit(50);
    return rows.map(toCommentSummary);
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list comments.", 503);
    }
    return [];
  }
}

function getMemoryComments(targetType: CommentTargetType, targetId: string) {
  return memoryComments.get(getCommentKey(targetType, targetId)) ?? [];
}

function getCommentKey(targetType: CommentTargetType, targetId: string) {
  return `${targetType}:${targetId}`;
}

function toCommentSummary(row: typeof comments.$inferSelect) {
  return {
    id: row.id,
    body: row.body,
    authorName: "Climber",
    createdAt: formatDateTime(row.createdAt),
  } satisfies CommentSummary;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
