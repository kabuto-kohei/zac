import { Hono } from "hono";
import { toErrorResponse } from "./errors.js";
import { createFeedRoutes } from "./routes/feed.js";
import { createGymRoutes } from "./routes/gyms.js";
import { createHealthRoutes } from "./routes/health.js";
import { createLogRoutes } from "./routes/logs.js";
import { createPostRoutes } from "./routes/posts.js";
import { createSessionPlanRoutes } from "./routes/session-plans.js";
import { notFoundResponse } from "./responses.js";

export function createApp() {
  const app = new Hono();

  app.route("/v1/health", createHealthRoutes());
  app.route("/v1/gyms", createGymRoutes());
  app.route("/v1/session-plans", createSessionPlanRoutes());
  app.route("/v1/logs", createLogRoutes());
  app.route("/v1/posts", createPostRoutes());
  app.route("/v1/feed", createFeedRoutes());

  app.onError((error, context) => {
    const response = toErrorResponse(error);
    return new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: {
        "content-type": "application/json",
      },
    });
  });

  app.notFound((context) => context.json(notFoundResponse(), 404));

  return app;
}

export type ZacApi = ReturnType<typeof createApp>;
