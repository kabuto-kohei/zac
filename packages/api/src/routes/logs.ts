import { logFixtures } from "@zac/shared";
import { Hono } from "hono";

export function createLogRoutes() {
  const app = new Hono();

  app.get("/", (context) =>
    context.json({
      data: logFixtures,
      page: {
        limit: 20,
        cursor: null,
        hasNext: false,
      },
    }),
  );

  return app;
}

