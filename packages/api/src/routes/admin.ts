import { moderatePostSchema, reviewAdminEventSchema, updateGymStatusSchema, updateReportStatusSchema, upsertAdminAnnouncementSchema, upsertAdminEventSchema } from "@zac/shared";
import { Hono } from "hono";
import { resolveRequestActor } from "../auth.js";
import { dataResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createAnnouncement, listAnnouncements, updateAnnouncement } from "../services/announcement-service.js";
import { listAdminUsers, listAuditLogs, moderatePost, recordAdminAudit, requireAdminActor, updateGymStatus, updateReportStatus } from "../services/admin-service.js";
import { createEvent, listEventCandidates, listEvents, reviewEventCandidate, updateEvent } from "../services/event-service.js";
import { listEventSources } from "../services/event-source-service.js";

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

  app.get("/event-candidates", async (context) => {
    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    void actor;
    return context.json(paginatedResponse(await listEventCandidates()));
  });

  app.get("/event-sources", async (context) => {
    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    void actor;
    return context.json(paginatedResponse(await listEventSources({ includeCandidates: true })));
  });

  app.post("/events", async (context) => {
    const result = upsertAdminEventSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    const event = await createEvent(result.data, actor);
    await recordAdminAudit(actor, { action: "event_create", targetType: "event", targetId: event.id, metadata: result.data });
    return context.json(dataResponse(event), 201);
  });

  app.patch("/events/:eventId", async (context) => {
    const result = upsertAdminEventSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    const event = await updateEvent(context.req.param("eventId"), result.data);
    await recordAdminAudit(actor, { action: "event_update", targetType: "event", targetId: event.id, metadata: result.data });
    return context.json(dataResponse(event));
  });

  app.patch("/events/:eventId/review", async (context) => {
    const result = reviewAdminEventSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    const event = await reviewEventCandidate(context.req.param("eventId"), result.data, actor);
    await recordAdminAudit(actor, { action: `event_candidate_${result.data.action}`, targetType: "event", targetId: event.id, metadata: result.data });
    return context.json(dataResponse(event));
  });

  app.get("/announcements", async (context) => {
    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    void actor;
    return context.json(paginatedResponse(await listAnnouncements({ includeDrafts: true })));
  });

  app.post("/announcements", async (context) => {
    const result = upsertAdminAnnouncementSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    const announcement = await createAnnouncement(result.data, actor);
    await recordAdminAudit(actor, { action: "announcement_create", targetType: "announcement", targetId: announcement.id, metadata: result.data });
    return context.json(dataResponse(announcement), 201);
  });

  app.patch("/announcements/:announcementId", async (context) => {
    const result = upsertAdminAnnouncementSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireAdminActor(await resolveRequestActor(context.req.header("authorization")));
    const announcement = await updateAnnouncement(context.req.param("announcementId"), result.data);
    await recordAdminAudit(actor, { action: "announcement_update", targetType: "announcement", targetId: announcement.id, metadata: result.data });
    return context.json(dataResponse(announcement));
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
