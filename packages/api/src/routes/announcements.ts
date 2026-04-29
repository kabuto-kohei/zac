import { Hono } from "hono";
import { dataResponse, notFoundResponse, paginatedResponse } from "../responses.js";
import { getAnnouncement, listAnnouncements } from "../services/announcement-service.js";

export function createAnnouncementRoutes() {
  const app = new Hono();

  app.get("/", async (context) => context.json(paginatedResponse(await listAnnouncements())));

  app.get("/:announcementId", async (context) => {
    const announcement = await getAnnouncement(context.req.param("announcementId"));

    if (!announcement) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(announcement));
  });

  return app;
}
