import { Hono } from "hono";
import { toErrorResponse } from "./errors.js";
import { captureException, initMonitoring } from "./integrations/monitoring.js";
import { createAnnouncementRoutes } from "./routes/announcements.js";
import { createEventRoutes } from "./routes/events.js";
import { createFeedRoutes } from "./routes/feed.js";
import { createGymRoutes } from "./routes/gyms.js";
import { createHealthRoutes } from "./routes/health.js";
import { createIntegrationRoutes } from "./routes/integrations.js";
import { createLogRoutes } from "./routes/logs.js";
import { createPostRoutes } from "./routes/posts.js";
import { createSessionPlanRoutes } from "./routes/session-plans.js";
import { notFoundResponse } from "./responses.js";

export function createApp() {
  initMonitoring();
  const app = new Hono();

  app.route("/v1/health", createHealthRoutes());
  app.route("/v1/integrations", createIntegrationRoutes());
  app.route("/v1/announcements", createAnnouncementRoutes());
  app.route("/v1/gyms", createGymRoutes());
  app.route("/v1/events", createEventRoutes());
  app.route("/v1/session-plans", createSessionPlanRoutes());
  app.route("/v1/logs", createLogRoutes());
  app.route("/v1/posts", createPostRoutes());
  app.route("/v1/feed", createFeedRoutes());

  app.onError((error, context) => {
    captureException(error);
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
