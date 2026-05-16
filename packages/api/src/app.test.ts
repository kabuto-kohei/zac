import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./app.js";
import { assertApiRuntimeConfig } from "./integrations/env.js";
import { buildMediaAttachmentRows, buildMediaDeletionJob } from "./services/media-service.js";
import { isVisibilityAllowed } from "./services/visibility-service.js";

const adminAuth = { authorization: "Bearer test-user:00000000-0000-4000-8000-0000000000ad:admin@example.test" };
const userAuth = { authorization: "Bearer test-user:00000000-0000-4000-8000-0000000000aa:user@example.test" };
const userJsonHeaders = { ...userAuth, "content-type": "application/json" };

test("GET /v1/health returns ok", async () => {
  const response = await createApp().request("/v1/health");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.ok, true);
});

test("CORS allows the production admin origin without env-only configuration", async () => {
  const response = await createApp().request("/v1/admin/event-candidates", {
    headers: {
      origin: "https://zac-admin.vercel.app",
    },
  });

  assert.equal(response.headers.get("access-control-allow-origin"), "https://zac-admin.vercel.app");
});

test("CORS preflight allows admin authorization headers", async () => {
  const response = await createApp().request("/v1/admin/event-candidates", {
    method: "OPTIONS",
    headers: {
      origin: "https://zac-admin.vercel.app",
      "access-control-request-method": "GET",
      "access-control-request-headers": "authorization,content-type",
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://zac-admin.vercel.app");
  assert.equal(response.headers.get("access-control-allow-headers"), "authorization,content-type");
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
    headers: userJsonHeaders,
  });
  const saveBody = await saveResponse.json();
  const unsaveResponse = await app.request("/v1/gyms/rocky-shinagawa/save", {
    method: "DELETE",
    headers: userAuth,
  });
  const unsaveBody = await unsaveResponse.json();

  assert.equal(saveResponse.status, 200);
  assert.equal(saveBody.data.saved, true);
  assert.equal(unsaveResponse.status, 200);
  assert.equal(unsaveBody.data.saved, false);
});

test("mutation routes reject missing auth", async () => {
  const response = await createApp().request("/v1/gyms/rocky-shinagawa/save", {
    method: "POST",
    body: JSON.stringify({}),
    headers: { "content-type": "application/json" },
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, "unauthorized");
});

test("mutation routes reject unknown targets", async () => {
  const app = createApp();
  const gymResponse = await app.request("/v1/gyms/unknown/save", {
    method: "POST",
    body: JSON.stringify({}),
    headers: userJsonHeaders,
  });
  const eventResponse = await app.request("/v1/events/unknown/save", {
    method: "POST",
    body: JSON.stringify({}),
    headers: userJsonHeaders,
  });
  const postResponse = await app.request("/v1/posts/unknown/save", {
    method: "POST",
    body: JSON.stringify({}),
    headers: userJsonHeaders,
  });
  const planResponse = await app.request("/v1/session-plans/unknown/join", {
    method: "POST",
    body: JSON.stringify({}),
    headers: userJsonHeaders,
  });

  assert.equal(gymResponse.status, 404);
  assert.equal(eventResponse.status, 404);
  assert.equal(postResponse.status, 404);
  assert.equal(planResponse.status, 404);
});

test("GET /v1/integrations returns non-secret status", async () => {
  const response = await createApp().request("/v1/integrations");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(typeof body.data.supabase, "boolean");
  assert.equal(typeof body.data.database, "boolean");
  assert.equal(typeof body.data.databaseReachable, "boolean");
  assert.equal(typeof body.data.posthog, "boolean");
  assert.equal(typeof body.data.sentry, "boolean");
  assert.equal(body.data.storage.userMediaBucket, "user-media");
});

test("PUT and GET /v1/me/profile persist onboarding profile for the actor", async () => {
  const app = createApp();
  const updateResponse = await app.request("/v1/me/profile", {
    method: "PUT",
    body: JSON.stringify({
      displayName: "Test Climber",
      discipline: "lead",
      experience: "intermediate",
      area: "東京",
      interest: "partner",
      defaultVisibility: "followers",
      locationEnabled: false,
    }),
    headers: userJsonHeaders,
  });
  const updateBody = await updateResponse.json();
  const getResponse = await app.request("/v1/me/profile", {
    headers: userAuth,
  });
  const getBody = await getResponse.json();

  assert.equal(updateResponse.status, 200);
  assert.equal(updateBody.data.displayName, "Test Climber");
  assert.equal(updateBody.data.defaultVisibility, "followers");
  assert.equal(getResponse.status, 200);
  assert.equal(getBody.data.displayName, "Test Climber");
});

test("PATCH /v1/me/settings updates persisted default visibility", async () => {
  const app = createApp();
  await app.request("/v1/me/profile", {
    method: "PUT",
    body: JSON.stringify({
      displayName: "Settings Climber",
      discipline: "boulder",
      experience: "beginner",
      area: "東京",
      interest: "partner",
      defaultVisibility: "followers",
      locationEnabled: false,
    }),
    headers: userJsonHeaders,
  });
  const settingsResponse = await app.request("/v1/me/settings", {
    method: "PATCH",
    body: JSON.stringify({
      defaultVisibility: "private",
      locationEnabled: false,
    }),
    headers: userJsonHeaders,
  });
  const settingsBody = await settingsResponse.json();
  const getResponse = await app.request("/v1/me/profile", {
    headers: userAuth,
  });
  const getBody = await getResponse.json();

  assert.equal(settingsResponse.status, 200);
  assert.equal(settingsBody.data.defaultVisibility, "private");
  assert.equal(getResponse.status, 200);
  assert.equal(getBody.data.defaultVisibility, "private");
});

test("GET /v1/me/profile rejects missing auth", async () => {
  const response = await createApp().request("/v1/me/profile");
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, "unauthorized");
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
    headers: userJsonHeaders,
  });
  const saveBody = await saveResponse.json();
  const unsaveResponse = await app.request("/v1/events/b-pump-beginner-session/save", {
    method: "DELETE",
    headers: userAuth,
  });
  const unsaveBody = await unsaveResponse.json();

  assert.equal(saveResponse.status, 200);
  assert.equal(saveBody.data.saved, true);
  assert.equal(unsaveResponse.status, 200);
  assert.equal(unsaveBody.data.saved, false);
});

test("GET /v1/session-plans returns paginated shape", async () => {
  const response = await createApp().request("/v1/session-plans", {
    headers: userAuth,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.page.hasNext, false);
});

test("GET /v1/session-plans/:planId returns a plan", async () => {
  const response = await createApp().request("/v1/session-plans/tuesday-night", {
    headers: userAuth,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.id, "tuesday-night");
});

test("activity read routes reject missing auth", async () => {
  const app = createApp();
  const responses = await Promise.all([
    app.request("/v1/session-plans"),
    app.request("/v1/session-plans/tuesday-night"),
    app.request("/v1/logs"),
    app.request("/v1/logs/yellow-wall"),
    app.request("/v1/posts"),
    app.request("/v1/posts/yellow-wall-post"),
    app.request("/v1/feed"),
  ]);

  for (const response of responses) {
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.error.code, "unauthorized");
  }
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
    headers: userJsonHeaders,
  });
  const body = await response.json();
  const listResponse = await app.request("/v1/session-plans", {
    headers: userAuth,
  });
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
    headers: userJsonHeaders,
  });
  const joinBody = await joinResponse.json();
  const cancelResponse = await app.request("/v1/session-plans/tuesday-night/join", {
    method: "DELETE",
    headers: userAuth,
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
    headers: userJsonHeaders,
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
    headers: userJsonHeaders,
  });
  const body = await response.json();
  const listResponse = await app.request("/v1/session-plans/tuesday-night/comments", {
    headers: userAuth,
  });
  const listBody = await listResponse.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.body, "参加予定です。");
  assert.ok(listBody.data.some((comment: { id: string }) => comment.id === body.data.id));
});

test("POST /v1/session-plans/:planId/convert-to-log creates a log", async () => {
  const response = await createApp().request("/v1/session-plans/tuesday-night/convert-to-log", {
    method: "POST",
    body: JSON.stringify({}),
    headers: userJsonHeaders,
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.title, "火曜夜に軽く登る");
});

test("GET /v1/logs/:logId returns a log", async () => {
  const response = await createApp().request("/v1/logs/yellow-wall", {
    headers: userAuth,
  });
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
    headers: userJsonHeaders,
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.title, "垂壁を完登");
});

test("POST /v1/logs/:logId/convert-to-post creates a post", async () => {
  const response = await createApp().request("/v1/logs/yellow-wall/convert-to-post", {
    method: "POST",
    body: JSON.stringify({}),
    headers: userJsonHeaders,
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.match(body.data.body, /垂壁の黄色を完登/);
});

test("GET /v1/posts/:postId returns a post", async () => {
  const response = await createApp().request("/v1/posts/yellow-wall-post", {
    headers: userAuth,
  });
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
    headers: userJsonHeaders,
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
    headers: userJsonHeaders,
  });
  const likeBody = await likeResponse.json();
  const unlikeResponse = await app.request("/v1/posts/yellow-wall-post/like", {
    method: "DELETE",
    headers: userAuth,
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
    headers: userJsonHeaders,
  });
  const saveBody = await saveResponse.json();
  const unsaveResponse = await app.request("/v1/posts/yellow-wall-post/save", {
    method: "DELETE",
    headers: userAuth,
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
    headers: userJsonHeaders,
  });
  const body = await response.json();
  const listResponse = await app.request("/v1/posts/yellow-wall-post/comments", {
    headers: userAuth,
  });
  const listBody = await listResponse.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.body, "参考になりました。");
  assert.ok(listBody.data.some((comment: { id: string }) => comment.id === body.data.id));
});

test("comment routes require a visible target", async () => {
  const app = createApp();
  const postCommentsResponse = await app.request("/v1/posts/unknown/comments", {
    headers: userAuth,
  });
  const planCommentsResponse = await app.request("/v1/session-plans/unknown/comments", {
    headers: userAuth,
  });
  const createPostCommentResponse = await app.request("/v1/posts/unknown/comments", {
    method: "POST",
    body: JSON.stringify({ body: "見えない対象へのコメント" }),
    headers: userJsonHeaders,
  });

  assert.equal(postCommentsResponse.status, 404);
  assert.equal(planCommentsResponse.status, 404);
  assert.equal(createPostCommentResponse.status, 404);
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
    headers: userJsonHeaders,
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

test("POST /v1/media/attachments validates uploaded paths", async () => {
  const response = await createApp().request("/v1/media/attachments", {
    method: "POST",
    body: JSON.stringify({
      targetType: "post",
      targetId: "not-a-uuid",
      paths: [],
    }),
    headers: userJsonHeaders,
  });
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "validation_error");
});

test("media attachment rows preserve image order", () => {
  const rows = buildMediaAttachmentRows({
    targetType: "post",
    targetId: "00000000-0000-4000-8000-000000000001",
    paths: [
      "posts/00000000-0000-4000-8000-000000000001/a.jpg",
      "posts/00000000-0000-4000-8000-000000000001/b.jpg",
    ],
  });

  assert.deepEqual(
    rows.map((row) => ({ imageUrl: row.imageUrl, sortOrder: row.sortOrder })),
    [
      { imageUrl: "posts/00000000-0000-4000-8000-000000000001/a.jpg", sortOrder: 0 },
      { imageUrl: "posts/00000000-0000-4000-8000-000000000001/b.jpg", sortOrder: 1 },
    ],
  );
});

test("media deletion jobs are scheduled for unclaimed uploads", () => {
  const job = buildMediaDeletionJob({
    bucket: "user-media",
    objectPath: "logs/00000000-0000-4000-8000-000000000001/a.jpg",
    targetType: "climbing_log",
    targetId: "00000000-0000-4000-8000-000000000001",
  });

  assert.equal(job.bucket, "user-media");
  assert.equal(job.objectPath, "logs/00000000-0000-4000-8000-000000000001/a.jpg");
  assert.equal(job.status, "pending");
  assert.ok(job.runAfter > new Date());
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

test("admin routes reject unauthenticated requests", async () => {
  const response = await createApp().request("/v1/admin/audit-logs");
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, "unauthorized");
});

test("admin routes reject non-admin users", async () => {
  const response = await createApp().request("/v1/admin/audit-logs", {
    headers: userAuth,
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.code, "forbidden");
});

test("admin users route requires admin and returns a paginated list", async () => {
  const response = await createApp().request("/v1/admin/users", {
    headers: adminAuth,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(body.data), true);
  assert.equal(body.page.hasNext, false);
});

test("admin content list routes require admin", async () => {
  const eventsResponse = await createApp().request("/v1/admin/events", {
    headers: adminAuth,
  });
  const eventSourcesResponse = await createApp().request("/v1/admin/event-sources", {
    headers: adminAuth,
  });
  const eventCandidatesResponse = await createApp().request("/v1/admin/event-candidates", {
    headers: adminAuth,
  });
  const announcementsResponse = await createApp().request("/v1/admin/announcements", {
    headers: adminAuth,
  });
  const eventSourcesBody = await eventSourcesResponse.json();

  assert.equal(eventsResponse.status, 200);
  assert.equal(eventSourcesResponse.status, 200);
  assert.equal(eventCandidatesResponse.status, 200);
  assert.equal(eventSourcesBody.data.some((source: { handle: string }) => source.handle === "comp_bible"), true);
  assert.equal(announcementsResponse.status, 200);
});

test("admin content mutations create and update events and announcements", async () => {
  const app = createApp();
  const eventResponse = await app.request("/v1/admin/events", {
    method: "POST",
    body: JSON.stringify({
      title: "公開前イベント",
      description: "公開前の説明です。",
      startsAt: "2026-05-10T10:00:00+09:00",
      endsAt: "2026-05-10T12:00:00+09:00",
      status: "draft",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const eventBody = await eventResponse.json();
  const draftEventPublicResponse = await app.request(`/v1/events/${eventBody.data.id}`);
  const publishEventResponse = await app.request(`/v1/admin/events/${eventBody.data.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: "公開イベント",
      description: "公開済みの説明です。",
      startsAt: "2026-05-10T10:00:00+09:00",
      endsAt: "2026-05-10T12:00:00+09:00",
      status: "scheduled",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const publishEventBody = await publishEventResponse.json();
  const publicEventResponse = await app.request(`/v1/events/${eventBody.data.id}`);
  const publicEventBody = await publicEventResponse.json();
  const announcementResponse = await app.request("/v1/admin/announcements", {
    method: "POST",
    body: JSON.stringify({
      title: "公開前のお知らせ",
      body: "公開前の本文です。",
      status: "draft",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const announcementBody = await announcementResponse.json();
  const draftAnnouncementPublicResponse = await app.request(`/v1/announcements/${announcementBody.data.id}`);
  const publishAnnouncementResponse = await app.request(`/v1/admin/announcements/${announcementBody.data.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: "公開お知らせ",
      body: "公開済みの本文です。",
      status: "published",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const publishAnnouncementBody = await publishAnnouncementResponse.json();
  const publicAnnouncementResponse = await app.request(`/v1/announcements/${announcementBody.data.id}`);
  const publicAnnouncementBody = await publicAnnouncementResponse.json();

  assert.equal(eventResponse.status, 201);
  assert.equal(eventBody.data.status, "draft");
  assert.equal(draftEventPublicResponse.status, 404);
  assert.equal(publishEventResponse.status, 200);
  assert.equal(publishEventBody.data.status, "scheduled");
  assert.equal(publishEventBody.data.description, "公開済みの説明です。");
  assert.equal(publicEventResponse.status, 200);
  assert.equal(publicEventBody.data.description, "公開済みの説明です。");
  assert.equal(announcementResponse.status, 201);
  assert.equal(announcementBody.data.status, "draft");
  assert.equal(draftAnnouncementPublicResponse.status, 404);
  assert.equal(publishAnnouncementResponse.status, 200);
  assert.equal(publishAnnouncementBody.data.status, "published");
  assert.equal(publicAnnouncementResponse.status, 200);
  assert.equal(publicAnnouncementBody.data.body, "公開済みの本文です。");
});

test("admin event candidate review approves draft event for public listing", async () => {
  const app = createApp();
  const eventResponse = await app.request("/v1/admin/events", {
    method: "POST",
    body: JSON.stringify({
      title: "候補イベント",
      description: "自動収集候補です。",
      startsAt: "2026-06-01T10:00:00+09:00",
      endsAt: "2026-06-01T12:00:00+09:00",
      status: "draft",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const eventBody = await eventResponse.json();
  const reviewResponse = await app.request(`/v1/admin/events/${eventBody.data.id}/review`, {
    method: "PATCH",
    body: JSON.stringify({
      action: "approve",
      reason: "公式情報を確認済み",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const reviewBody = await reviewResponse.json();
  const publicEventResponse = await app.request(`/v1/events/${eventBody.data.id}`);

  assert.equal(eventResponse.status, 201);
  assert.equal(reviewResponse.status, 200);
  assert.equal(reviewBody.data.status, "scheduled");
  assert.equal(reviewBody.data.reviewStatus, "approved");
  assert.equal(publicEventResponse.status, 200);
});

test("admin report status mutation writes audit log", async () => {
  const app = createApp();
  const response = await app.request("/v1/admin/reports/report-001/status", {
    method: "PATCH",
    body: JSON.stringify({
      status: "reviewing",
      action: "mark_review_pending",
      reason: "確認中",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const body = await response.json();
  const auditResponse = await app.request("/v1/admin/audit-logs", {
    headers: adminAuth,
  });
  const auditBody = await auditResponse.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.status, "reviewing");
  assert.equal(auditResponse.status, 200);
  assert.ok(auditBody.data.some((log: { action: string; targetType: string }) => log.action === "report_status_update" && log.targetType === "report"));
});

test("admin post moderation and gym status mutations require admin", async () => {
  const app = createApp();
  const postResponse = await app.request("/v1/admin/posts/yellow-wall-post/moderation", {
    method: "POST",
    body: JSON.stringify({
      action: "hide_post",
      reason: "通報対応",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const gymResponse = await app.request("/v1/admin/gyms/b-pump-tokyo/status", {
    method: "PATCH",
    body: JSON.stringify({
      status: "published",
      reason: "確認済み",
    }),
    headers: {
      ...adminAuth,
      "content-type": "application/json",
    },
  });
  const postBody = await postResponse.json();
  const gymBody = await gymResponse.json();

  assert.equal(postResponse.status, 200);
  assert.equal(postBody.data.action, "hide_post");
  assert.equal(gymResponse.status, 200);
  assert.equal(gymBody.data.status, "published");
});

test("production-like API config requires database and Supabase admin auth", () => {
  const previousAppEnv = process.env.APP_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousSupabaseUrl = process.env.SUPABASE_URL;
  const previousServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    process.env.APP_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    assert.throws(() => assertApiRuntimeConfig(), /DATABASE_URL/);
  } finally {
    restoreEnv("APP_ENV", previousAppEnv);
    restoreEnv("DATABASE_URL", previousDatabaseUrl);
    restoreEnv("SUPABASE_URL", previousSupabaseUrl);
    restoreEnv("SUPABASE_SERVICE_ROLE_KEY", previousServiceRoleKey);
  }
});

test("production-like runtime does not serve fixture fallback data", async () => {
  const previousAppEnv = process.env.APP_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;

  try {
    process.env.APP_ENV = "production";
    delete process.env.DATABASE_URL;

    const response = await createApp().request("/v1/gyms");
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body.data, []);
  } finally {
    restoreEnv("APP_ENV", previousAppEnv);
    restoreEnv("DATABASE_URL", previousDatabaseUrl);
  }
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

test("notifications require authenticated users and can be marked read", async () => {
  const app = createApp();
  const unauthenticatedResponse = await app.request("/v1/notifications");
  const unauthenticatedBody = await unauthenticatedResponse.json();
  const listResponse = await app.request("/v1/notifications", {
    headers: userAuth,
  });
  const listBody = await listResponse.json();
  const unread = listBody.data.find((notification: { readAt: string | null }) => notification.readAt === null);
  const readResponse = await app.request(`/v1/notifications/${unread.id}/read`, {
    method: "PATCH",
    headers: userAuth,
  });
  const readBody = await readResponse.json();

  assert.equal(unauthenticatedResponse.status, 401);
  assert.equal(unauthenticatedBody.error.code, "unauthorized");
  assert.equal(listResponse.status, 200);
  assert.ok(listBody.data.length > 0);
  assert.equal(readResponse.status, 200);
  assert.equal(readBody.data.id, unread.id);
  assert.equal(typeof readBody.data.readAt, "string");
});

test("GET /v1/feed returns mixed feed", async () => {
  const response = await createApp().request("/v1/feed", {
    headers: userAuth,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.data.some((entry: { type: string }) => entry.type === "post"));
});
