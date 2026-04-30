import { Hono } from "hono";
import { requireRequestActor } from "../auth.js";
import { dataResponse, notFoundResponse, paginatedResponse } from "../responses.js";
import { getEvent, listEvents, saveEvent, unsaveEvent } from "../services/event-service.js";

export function createEventRoutes() {
  const app = new Hono();

  app.get("/", async (context) => context.json(paginatedResponse(await listEvents())));

  app.post("/:eventId/save", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const event = await getEvent(context.req.param("eventId"));

    if (!event) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(await saveEvent(context.req.param("eventId"), actor.userId)));
  });

  app.delete("/:eventId/save", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const event = await getEvent(context.req.param("eventId"));

    if (!event) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(await unsaveEvent(context.req.param("eventId"), actor.userId)));
  });

  app.get("/:eventId", async (context) => {
    const event = await getEvent(context.req.param("eventId"));

    if (!event) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(event));
  });

  return app;
}
