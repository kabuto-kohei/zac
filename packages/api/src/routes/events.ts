import { Hono } from "hono";
import { resolveRequestActor } from "../auth.js";
import { dataResponse, notFoundResponse, paginatedResponse } from "../responses.js";
import { getEvent, listEvents, saveEvent, unsaveEvent } from "../services/event-service.js";

export function createEventRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listEvents())));

  app.post("/:eventId/save", async (context) => {
    const actor = await resolveRequestActor(context.req.header("authorization"));
    return context.json(dataResponse(await saveEvent(context.req.param("eventId"), actor?.userId)));
  });

  app.delete("/:eventId/save", async (context) => {
    const actor = await resolveRequestActor(context.req.header("authorization"));
    return context.json(dataResponse(await unsaveEvent(context.req.param("eventId"), actor?.userId)));
  });

  app.get("/:eventId", (context) => {
    const event = getEvent(context.req.param("eventId"));

    if (!event) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(event));
  });

  return app;
}
