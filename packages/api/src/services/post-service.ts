import { desc, eq, isNull, posts } from "@zac/db";
import { findPostFixture, postFixtures, type CreatePostInput, type PostSummary } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";
import { isUuid } from "./ids.js";

const createdPosts: PostSummary[] = [];
let createdPostCount = 0;

export async function listPosts() {
  const persisted = await listPersistentPosts();
  return [...createdPosts, ...persisted, ...postFixtures];
}

export async function getPost(postId: string) {
  if (isUuid(postId)) {
    const persisted = await getPersistentPost(postId);

    if (persisted) {
      return persisted;
    }
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
    return null;
  }
}

async function listPersistentPosts() {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db.select().from(posts).where(isNull(posts.deletedAt)).orderBy(desc(posts.createdAt)).limit(50);
    return rows.map(toPostSummary);
  } catch {
    return [];
  }
}

async function getPersistentPost(postId: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    return row && !row.deletedAt ? toPostSummary(row) : null;
  } catch {
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
