import { Hono } from "hono";
import { getMixedFeed } from "../services/feed-service.js";

export function createFeedRoutes() {
  const app = new Hono();

  app.get("/", (context) =>
    context.json({
      data: getMixedFeed(),
      page: {
        limit: 20,
        cursor: null,
        hasNext: false,
      },
    }),
  );

  return app;
}
