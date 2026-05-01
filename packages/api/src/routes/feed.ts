import { Hono } from "hono";
import { requireRequestActor } from "../auth.js";
import { paginatedResponse } from "../responses.js";
import { getMixedFeed } from "../services/feed-service.js";

export function createFeedRoutes() {
  const app = new Hono();

  app.get("/", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    return context.json(paginatedResponse(await getMixedFeed(actor.userId)));
  });

  return app;
}
