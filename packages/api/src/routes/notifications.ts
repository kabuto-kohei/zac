import { Hono } from "hono";
import { resolveRequestActor } from "../auth.js";
import { dataResponse, paginatedResponse } from "../responses.js";
import { listNotifications, markNotificationRead } from "../services/notification-service.js";

export function createNotificationRoutes() {
  const app = new Hono();

  app.get("/", async (context) => {
    const actor = await resolveRequestActor(context.req.header("authorization"));
    return context.json(paginatedResponse(await listNotifications(actor?.userId)));
  });

  app.patch("/:notificationId/read", async (context) => {
    const actor = await resolveRequestActor(context.req.header("authorization"));
    const notification = await markNotificationRead(context.req.param("notificationId"), actor?.userId);
    return context.json(dataResponse(notification));
  });

  return app;
}
