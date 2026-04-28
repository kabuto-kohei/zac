import { findPostFixture, postFixtures } from "@zac/shared";

export function listPosts() {
  return postFixtures;
}

export function getPost(postId: string) {
  return findPostFixture(postId);
}

