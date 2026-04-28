import { findLogFixture, logFixtures } from "@zac/shared";
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

  app.get("/:logId", (context) => {
    const log = findLogFixture(context.req.param("logId"));

    if (!log) {
      return context.json(
        {
          error: {
            code: "not_found",
            message: "Not found.",
            details: {},
          },
        },
        404,
      );
    }

    return context.json({ data: log });
  });

  return app;
}
