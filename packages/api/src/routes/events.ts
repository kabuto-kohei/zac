import { Hono } from "hono";
import { dataResponse, notFoundResponse, paginatedResponse } from "../responses.js";
import { getEvent, listEvents } from "../services/event-service.js";

export function createEventRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listEvents())));

  app.get("/:eventId", (context) => {
    const event = getEvent(context.req.param("eventId"));

    if (!event) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(event));
  });

  return app;
}
