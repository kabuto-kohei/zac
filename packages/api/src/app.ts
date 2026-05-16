import { Hono } from "hono";
import { cors } from "hono/cors";
import { toErrorResponse } from "./errors.js";
import { captureException, initMonitoring } from "./integrations/monitoring.js";
import { requestTiming } from "./middleware/request-timing.js";
import { createAdminRoutes } from "./routes/admin.js";
import { createAnnouncementRoutes } from "./routes/announcements.js";
import { createEventRoutes } from "./routes/events.js";
import { createFeedRoutes } from "./routes/feed.js";
import { createGymRoutes } from "./routes/gyms.js";
import { createHealthRoutes } from "./routes/health.js";
import { createIntegrationRoutes } from "./routes/integrations.js";
import { createLogRoutes } from "./routes/logs.js";
import { createMediaRoutes } from "./routes/media.js";
import { createMeRoutes } from "./routes/me.js";
import { createNotificationRoutes } from "./routes/notifications.js";
import { createPostRoutes } from "./routes/posts.js";
import { createReportRoutes } from "./routes/reports.js";
import { createSessionPlanRoutes } from "./routes/session-plans.js";
import { notFoundResponse } from "./responses.js";

export function createApp() {
  initMonitoring();
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: getAllowedOrigins(),
      allowHeaders: ["authorization", "content-type"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: false,
    }),
  );
  app.use("*", requestTiming);

  app.route("/v1/health", createHealthRoutes());
  app.route("/v1/integrations", createIntegrationRoutes());
  app.route("/v1/announcements", createAnnouncementRoutes());
  app.route("/v1/gyms", createGymRoutes());
  app.route("/v1/events", createEventRoutes());
  app.route("/v1/session-plans", createSessionPlanRoutes());
  app.route("/v1/logs", createLogRoutes());
  app.route("/v1/posts", createPostRoutes());
  app.route("/v1/media", createMediaRoutes());
  app.route("/v1/me", createMeRoutes());
  app.route("/v1/notifications", createNotificationRoutes());
  app.route("/v1/feed", createFeedRoutes());
  app.route("/v1/reports", createReportRoutes());
  app.route("/v1/admin", createAdminRoutes());

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

const defaultAllowedOrigins = ["https://zac-web.vercel.app", "https://zac-admin.vercel.app", "http://localhost:3000", "http://localhost:3001"];

function getAllowedOrigins() {
  return Array.from(new Set([
    process.env.APP_URL,
    process.env.WEB_URL,
    process.env.ADMIN_URL,
    ...defaultAllowedOrigins,
  ].filter((origin): origin is string => Boolean(origin))));
}
