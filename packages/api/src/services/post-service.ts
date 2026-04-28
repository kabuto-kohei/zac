import { findPostFixture, postFixtures, type CreatePostInput, type PostSummary } from "@zac/shared";

const createdPosts: PostSummary[] = [];
let createdPostCount = 0;

export function listPosts() {
  return [...createdPosts, ...postFixtures];
}

export function getPost(postId: string) {
  return createdPosts.find((post) => post.id === postId) ?? findPostFixture(postId);
}

export function createPost(input: CreatePostInput) {
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
