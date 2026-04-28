import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./app.js";

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

test("GET /v1/feed returns mixed feed", async () => {
  const response = await createApp().request("/v1/feed");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.data.some((entry: { type: string }) => entry.type === "post"));
});
