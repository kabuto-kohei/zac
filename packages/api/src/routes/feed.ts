import { feedFixtures } from "@zac/shared";
import { Hono } from "hono";

export function createFeedRoutes() {
  const app = new Hono();

  app.get("/", (context) =>
    context.json({
      data: feedFixtures,
      page: {
        limit: 20,
        cursor: null,
        hasNext: false,
      },
    }),
  );

  return app;
}

