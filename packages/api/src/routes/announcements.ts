import { Hono } from "hono";
import { dataResponse, notFoundResponse, paginatedResponse } from "../responses.js";
import { getAnnouncement, listAnnouncements } from "../services/announcement-service.js";

export function createAnnouncementRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listAnnouncements())));

  app.get("/:announcementId", (context) => {
    const announcement = getAnnouncement(context.req.param("announcementId"));

    if (!announcement) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(announcement));
  });

  return app;
}
