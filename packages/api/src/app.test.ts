import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./app.js";
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
    headers: userJsonHeaders,
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
    headers: userJsonHeaders,
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
  const announcementsResponse = await createApp().request("/v1/admin/announcements", {
    headers: adminAuth,
  });

  assert.equal(eventsResponse.status, 200);
  assert.equal(announcementsResponse.status, 200);
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
  const response = await createApp().request("/v1/feed");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.data.some((entry: { type: string }) => entry.type === "post"));
});
