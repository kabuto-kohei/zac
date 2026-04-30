import { and, desc, eq, isNull, postLikes, postSaves, posts } from "@zac/db";
import { findLogFixture, findPostFixture, postFixtures, type CreatePostInput, type PostSummary } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";
import { canViewResource, filterVisibleResources } from "./visibility-service.js";

const createdPosts: PostSummary[] = [];
const likedPosts = new Set<string>();
const savedPosts = new Set<string>();
let createdPostCount = 0;

export async function listPosts(viewerId?: string) {
  const persisted = await listPersistentPosts(viewerId);
  if (!isRuntimeFallbackAllowed()) {
    return persisted;
  }

  return [...createdPosts, ...persisted, ...postFixtures];
}

export async function getPost(postId: string, viewerId?: string) {
  if (isUuid(postId)) {
    const persisted = await getPersistentPost(postId, viewerId);

    if (persisted) {
      return persisted;
    }
  }

  if (!isRuntimeFallbackAllowed()) {
    return undefined;
  }

  return createdPosts.find((post) => post.id === postId) ?? findPostFixture(postId);
}

export async function createPost(input: CreatePostInput, actorId?: string) {
  const persisted = await createPersistentPost(input, actorId);

  if (persisted) {
    return persisted;
  }

  return createMemoryPost(input);
}

export async function convertLogToPost(logId: string, actorId?: string) {
  const log = findLogFixture(logId);

  if (!log) {
    return null;
  }

  return createPost(
    {
      body: `${log.title}。${log.note}`,
      visibility: "followers",
    },
    actorId,
  );
}

export async function likePost(postId: string, actorId?: string) {
  const persisted = await setPersistentPostLike(postId, actorId, true);

  if (!persisted) {
    likedPosts.add(postId);
  }

  return { postId, liked: true };
}

export async function unlikePost(postId: string, actorId?: string) {
  const persisted = await setPersistentPostLike(postId, actorId, false);

  if (!persisted) {
    likedPosts.delete(postId);
  }

  return { postId, liked: false };
}

export async function savePost(postId: string, actorId?: string) {
  const persisted = await setPersistentPostSave(postId, actorId, true);

  if (!persisted) {
    savedPosts.add(postId);
  }

  return { postId, saved: true };
}

export async function unsavePost(postId: string, actorId?: string) {
  const persisted = await setPersistentPostSave(postId, actorId, false);

  if (!persisted) {
    savedPosts.delete(postId);
  }

  return { postId, saved: false };
}

function createMemoryPost(input: CreatePostInput) {
  createdPostCount += 1;
  const post: PostSummary = {
    id: `local-post-${createdPostCount}`,
    body: input.body,
    authorName: "Climber",
    sourceType: "standalone",
    sourceLabel: input.body.slice(0, 32),
    visibility: input.visibility,
  };

  createdPosts.unshift(post);
  return post;
}

async function createPersistentPost(input: CreatePostInput, actorId?: string) {
  const db = getDatabase();

  if (!db || !actorId) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for posts.", 503);
    }
    return null;
  }

  try {
    const [row] = await db
      .insert(posts)
      .values({
        createdBy: actorId,
        sourceType: "standalone",
        body: input.body,
        visibility: input.visibility,
      })
      .returning();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      body: row.body,
      authorName: "Climber",
      sourceType: "standalone",
      sourceLabel: row.body.slice(0, 32),
      visibility: row.visibility,
    } satisfies PostSummary;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not create post.", 503);
    }
    return null;
  }
}

async function setPersistentPostLike(postId: string, actorId: string | undefined, liked: boolean) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(postId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("not_found", "Post not found.", 404);
    }
    return false;
  }

  try {
    if (liked) {
      await db.insert(postLikes).values({ postId, userId: actorId }).onConflictDoNothing();
    } else {
      await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, actorId)));
    }
    return true;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not update post like.", 503);
    }
    return false;
  }
}

async function setPersistentPostSave(postId: string, actorId: string | undefined, saved: boolean) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(postId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("not_found", "Post not found.", 404);
    }
    return false;
  }

  try {
    if (saved) {
      await db.insert(postSaves).values({ postId, userId: actorId }).onConflictDoNothing();
    } else {
      await db.delete(postSaves).where(and(eq(postSaves.postId, postId), eq(postSaves.userId, actorId)));
    }
    return true;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not update post save.", 503);
    }
    return false;
  }
}

async function listPersistentPosts(viewerId?: string) {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db.select().from(posts).where(isNull(posts.deletedAt)).orderBy(desc(posts.createdAt)).limit(50);
    const visibleRows = await filterVisibleResources(
      rows.map((row) => ({
        ...row,
        ownerId: row.createdBy,
        participantPlanId: row.sourceType === "session_plan" ? row.sourceId : null,
      })),
      viewerId,
    );
    return visibleRows.map(toPostSummary);
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list posts.", 503);
    }
    return [];
  }
}

async function getPersistentPost(postId: string, viewerId?: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);

    if (!row || row.deletedAt) {
      return null;
    }

    const canView = await canViewResource(
      {
        id: row.id,
        ownerId: row.createdBy,
        visibility: row.visibility,
        participantPlanId: row.sourceType === "session_plan" ? row.sourceId : null,
      },
      viewerId,
    );
    return canView ? toPostSummary(row) : null;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not load post.", 503);
    }
    return null;
  }
}

function toPostSummary(row: typeof posts.$inferSelect) {
  return {
    id: row.id,
    body: row.body,
    authorName: "Climber",
    sourceType: row.sourceType === "climbing_log" || row.sourceType === "session_plan" || row.sourceType === "gym" ? row.sourceType : "standalone",
    sourceLabel: row.body.slice(0, 32),
    visibility: row.visibility,
  } satisfies PostSummary;
}
