import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./app.js";
import { isVisibilityAllowed } from "./services/visibility-service.js";

test("GET /v1/health returns ok", async () => {
  const response = await createApp().request("/v1/health");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.ok, true);
});

test("GET /v1/gyms returns fixtures", async () => {
  const response = await createApp().request("/v1/gyms");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.data.length > 0);
});

test("GET /v1/gyms/:gymId returns not_found for unknown gym", async () => {
  const response = await createApp().request("/v1/gyms/unknown");
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, "not_found");
});

test("POST and DELETE /v1/gyms/:gymId/save toggles save", async () => {
  const app = createApp();
  const saveResponse = await app.request("/v1/gyms/rocky-shinagawa/save", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const saveBody = await saveResponse.json();
  const unsaveResponse = await app.request("/v1/gyms/rocky-shinagawa/save", {
    method: "DELETE",
  });
  const unsaveBody = await unsaveResponse.json();

  assert.equal(saveResponse.status, 200);
  assert.equal(saveBody.data.saved, true);
  assert.equal(unsaveResponse.status, 200);
  assert.equal(unsaveBody.data.saved, false);
});

test("GET /v1/integrations returns non-secret status", async () => {
  const response = await createApp().request("/v1/integrations");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(typeof body.data.supabase, "boolean");
  assert.equal(typeof body.data.database, "boolean");
  assert.equal(typeof body.data.posthog, "boolean");
  assert.equal(typeof body.data.sentry, "boolean");
  assert.equal(body.data.storage.userMediaBucket, "user-media");
});

test("GET /v1/announcements returns paginated announcements", async () => {
  const response = await createApp().request("/v1/announcements");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.page.hasNext, false);
  assert.ok(body.data.length > 0);
});

test("GET /v1/announcements/:announcementId returns an announcement", async () => {
  const response = await createApp().request("/v1/announcements/beta-guideline");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.id, "beta-guideline");
});

test("GET /v1/announcements/:announcementId returns not_found for unknown announcement", async () => {
  const response = await createApp().request("/v1/announcements/unknown");
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, "not_found");
});

test("GET /v1/events returns paginated events", async () => {
  const response = await createApp().request("/v1/events");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.page.hasNext, false);
  assert.ok(body.data.length > 0);
});

test("GET /v1/events/:eventId returns an event", async () => {
  const response = await createApp().request("/v1/events/b-pump-beginner-session");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.id, "b-pump-beginner-session");
});

test("GET /v1/events/:eventId returns not_found for unknown event", async () => {
  const response = await createApp().request("/v1/events/unknown");
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, "not_found");
});

test("POST and DELETE /v1/events/:eventId/save toggles save", async () => {
  const app = createApp();
  const saveResponse = await app.request("/v1/events/b-pump-beginner-session/save", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const saveBody = await saveResponse.json();
  const unsaveResponse = await app.request("/v1/events/b-pump-beginner-session/save", {
    method: "DELETE",
  });
  const unsaveBody = await unsaveResponse.json();

  assert.equal(saveResponse.status, 200);
  assert.equal(saveBody.data.saved, true);
  assert.equal(unsaveResponse.status, 200);
  assert.equal(unsaveBody.data.saved, false);
});

test("GET /v1/session-plans returns paginated shape", async () => {
  const response = await createApp().request("/v1/session-plans");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.page.hasNext, false);
});

test("GET /v1/session-plans/:planId returns a plan", async () => {
  const response = await createApp().request("/v1/session-plans/tuesday-night");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.id, "tuesday-night");
});

test("POST /v1/session-plans creates a plan", async () => {
  const app = createApp();
  const response = await app.request("/v1/session-plans", {
    method: "POST",
    body: JSON.stringify({
      title: "金曜夜に登る",
      placeName: "B-PUMP Tokyo",
      startAt: "2026-05-08T19:00:00+09:00",
      endAt: "2026-05-08T21:00:00+09:00",
      visibility: "followers",
      joinPolicy: "open",
    }),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();
  const listResponse = await app.request("/v1/session-plans");
  const listBody = await listResponse.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.title, "金曜夜に登る");
  assert.ok(listBody.data.some((plan: { id: string }) => plan.id === body.data.id));
});

test("POST and DELETE /v1/session-plans/:planId/join toggles participation", async () => {
  const app = createApp();
  const joinResponse = await app.request("/v1/session-plans/tuesday-night/join", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const joinBody = await joinResponse.json();
  const cancelResponse = await app.request("/v1/session-plans/tuesday-night/join", {
    method: "DELETE",
  });
  const cancelBody = await cancelResponse.json();

  assert.equal(joinResponse.status, 200);
  assert.equal(joinBody.data.joined, true);
  assert.equal(cancelResponse.status, 200);
  assert.equal(cancelBody.data.joined, false);
});

test("POST /v1/session-plans/:planId/complete completes a plan", async () => {
  const response = await createApp().request("/v1/session-plans/tuesday-night/complete", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.completed, true);
});

test("POST /v1/session-plans/:planId/comments creates a comment", async () => {
  const app = createApp();
  const response = await app.request("/v1/session-plans/tuesday-night/comments", {
    method: "POST",
    body: JSON.stringify({ body: "参加予定です。" }),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();
  const listResponse = await app.request("/v1/session-plans/tuesday-night/comments");
  const listBody = await listResponse.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.body, "参加予定です。");
  assert.ok(listBody.data.some((comment: { id: string }) => comment.id === body.data.id));
});

test("POST /v1/session-plans/:planId/convert-to-log creates a log", async () => {
  const response = await createApp().request("/v1/session-plans/tuesday-night/convert-to-log", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.title, "火曜夜に軽く登る");
});

test("GET /v1/logs/:logId returns a log", async () => {
  const response = await createApp().request("/v1/logs/yellow-wall");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.id, "yellow-wall");
});

test("POST /v1/logs creates a log", async () => {
  const response = await createApp().request("/v1/logs", {
    method: "POST",
    body: JSON.stringify({
      placeName: "Noborock Shibuya",
      climbedOn: "2026-05-08",
      gradeText: "4級",
      summary: "垂壁を完登",
      visibility: "private",
    }),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.title, "垂壁を完登");
});

test("POST /v1/logs/:logId/convert-to-post creates a post", async () => {
  const response = await createApp().request("/v1/logs/yellow-wall/convert-to-post", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.match(body.data.body, /垂壁の黄色を完登/);
});

test("GET /v1/posts/:postId returns a post", async () => {
  const response = await createApp().request("/v1/posts/yellow-wall-post");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.id, "yellow-wall-post");
});

test("POST /v1/posts creates a post", async () => {
  const response = await createApp().request("/v1/posts", {
    method: "POST",
    body: JSON.stringify({
      body: "週末に一緒に登れる人を探しています。",
      visibility: "public",
    }),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.body, "週末に一緒に登れる人を探しています。");
});

test("POST and DELETE /v1/posts/:postId/like toggles like", async () => {
  const app = createApp();
  const likeResponse = await app.request("/v1/posts/yellow-wall-post/like", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const likeBody = await likeResponse.json();
  const unlikeResponse = await app.request("/v1/posts/yellow-wall-post/like", {
    method: "DELETE",
  });
  const unlikeBody = await unlikeResponse.json();

  assert.equal(likeResponse.status, 200);
  assert.equal(likeBody.data.liked, true);
  assert.equal(unlikeResponse.status, 200);
  assert.equal(unlikeBody.data.liked, false);
});

test("POST and DELETE /v1/posts/:postId/save toggles save", async () => {
  const app = createApp();
  const saveResponse = await app.request("/v1/posts/yellow-wall-post/save", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const saveBody = await saveResponse.json();
  const unsaveResponse = await app.request("/v1/posts/yellow-wall-post/save", {
    method: "DELETE",
  });
  const unsaveBody = await unsaveResponse.json();

  assert.equal(saveResponse.status, 200);
  assert.equal(saveBody.data.saved, true);
  assert.equal(unsaveResponse.status, 200);
  assert.equal(unsaveBody.data.saved, false);
});

test("POST /v1/posts/:postId/comments creates a comment", async () => {
  const app = createApp();
  const response = await app.request("/v1/posts/yellow-wall-post/comments", {
    method: "POST",
    body: JSON.stringify({ body: "参考になりました。" }),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();
  const listResponse = await app.request("/v1/posts/yellow-wall-post/comments");
  const listBody = await listResponse.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.body, "参考になりました。");
  assert.ok(listBody.data.some((comment: { id: string }) => comment.id === body.data.id));
});

test("POST /v1/reports creates a report", async () => {
  const app = createApp();
  const response = await app.request("/v1/reports", {
    method: "POST",
    body: JSON.stringify({
      targetType: "post",
      targetId: "yellow-wall-post",
      category: "spam",
      note: "同じ内容の投稿が繰り返されています。",
    }),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();
  const listResponse = await app.request("/v1/reports");
  const listBody = await listResponse.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.category, "spam");
  assert.ok(listBody.data.some((report: { id: string }) => report.id === body.data.id));
});

test("POST /v1/media/upload-urls rejects unauthenticated requests", async () => {
  const response = await createApp().request("/v1/media/upload-urls", {
    method: "POST",
    body: JSON.stringify({
      targetType: "post",
      targetId: "00000000-0000-4000-8000-000000000001",
      files: [{ fileName: "wall.jpg", contentType: "image/jpeg", size: 1024 }],
    }),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, "unauthorized");
});

test("POST /v1/media/upload-urls validates image requests", async () => {
  const response = await createApp().request("/v1/media/upload-urls", {
    method: "POST",
    body: JSON.stringify({
      targetType: "post",
      targetId: "00000000-0000-4000-8000-000000000001",
      files: [{ fileName: "movie.mp4", contentType: "video/mp4", size: 1024 }],
    }),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "validation_error");
});

test("visibility rules protect private and follower content", () => {
  assert.equal(isVisibilityAllowed("public", "owner"), true);
  assert.equal(isVisibilityAllowed("private", "owner", "viewer"), false);
  assert.equal(isVisibilityAllowed("private", "owner", "owner"), true);
  assert.equal(isVisibilityAllowed("followers", "owner", "viewer", false), false);
  assert.equal(isVisibilityAllowed("followers", "owner", "viewer", true), true);
  assert.equal(isVisibilityAllowed("participants", "owner", "viewer", false, false), false);
  assert.equal(isVisibilityAllowed("participants", "owner", "viewer", false, true), true);
});

test("GET /v1/feed returns mixed feed", async () => {
  const response = await createApp().request("/v1/feed");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.data.some((entry: { type: string }) => entry.type === "post"));
});
