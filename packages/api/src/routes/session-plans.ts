import { planFixtures } from "@zac/shared";
import { Hono } from "hono";

export function createSessionPlanRoutes() {
  const app = new Hono();

  app.get("/", (context) =>
    context.json({
      data: planFixtures,
      page: {
        limit: 20,
        cursor: null,
        hasNext: false,
      },
    }),
  );

  return app;
}

