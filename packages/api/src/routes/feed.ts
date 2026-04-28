import { Hono } from "hono";
import { paginatedResponse } from "../responses.js";
import { getMixedFeed } from "../services/feed-service.js";

export function createFeedRoutes() {
  const app = new Hono();

  app.get("/", async (context) => context.json(paginatedResponse(await getMixedFeed())));

  return app;
}
