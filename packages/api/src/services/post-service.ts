import { posts } from "@zac/db";
import { findPostFixture, postFixtures, type CreatePostInput, type PostSummary } from "@zac/shared";
import { getDatabase } from "../integrations/database.js";

const createdPosts: PostSummary[] = [];
let createdPostCount = 0;

export function listPosts() {
  return [...createdPosts, ...postFixtures];
}

export function getPost(postId: string) {
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
