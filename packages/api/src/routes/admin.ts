import { moderatePostSchema, updateGymStatusSchema, updateReportStatusSchema } from "@zac/shared";
import { Hono } from "hono";
import { resolveRequestActor } from "../auth.js";
import { dataResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { listAnnouncements } from "../services/announcement-service.js";
import { listAdminUsers, listAuditLogs, moderatePost, requireAdminActor, updateGymStatus, updateReportStatus } from "../services/admin-service.js";
import { listEvents } from "../services/event-service.js";

export function createAdminRoutes() {
  const app = new Hono();

  app.get("/audit-logs", async (context) => {
    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    void actor;
    return context.json(paginatedResponse(await listAuditLogs()));
  });

  app.get("/users", async (context) => {
    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    void actor;
    return context.json(paginatedResponse(await listAdminUsers()));
  });

  app.get("/events", async (context) => {
    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    void actor;
    return context.json(paginatedResponse(await listEvents({ includeDrafts: true })));
  });

  app.get("/announcements", async (context) => {
    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    void actor;
    return context.json(paginatedResponse(await listAnnouncements({ includeDrafts: true })));
  });

  app.patch("/reports/:reportId/status", async (context) => {
    const result = updateReportStatusSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    const report = await updateReportStatus(context.req.param("reportId"), result.data, actor);
    return context.json(dataResponse(report));
  });

  app.post("/posts/:postId/moderation", async (context) => {
    const result = moderatePostSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    const post = await moderatePost(context.req.param("postId"), result.data, actor);
    return context.json(dataResponse(post));
  });

  app.patch("/gyms/:gymId/status", async (context) => {
    const result = updateGymStatusSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    const gym = await updateGymStatus(context.req.param("gymId"), result.data, actor);
    return context.json(dataResponse(gym));
  });

  return app;
}
