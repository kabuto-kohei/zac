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

test("GET /v1/logs/:logId returns a log", async () => {
  const response = await createApp().request("/v1/logs/yellow-wall");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.id, "yellow-wall");
});

test("GET /v1/posts/:postId returns a post", async () => {
  const response = await createApp().request("/v1/posts/yellow-wall-post");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.id, "yellow-wall-post");
});

test("GET /v1/feed returns mixed feed", async () => {
  const response = await createApp().request("/v1/feed");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.data.some((entry: { type: string }) => entry.type === "post"));
});
