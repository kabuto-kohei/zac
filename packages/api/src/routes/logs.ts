import { Hono } from "hono";
import { getClimbingLog, listClimbingLogs } from "../services/climbing-log-service.js";

export function createLogRoutes() {
  const app = new Hono();

  app.get("/", (context) =>
    context.json({
      data: listClimbingLogs(),
      page: {
        limit: 20,
        cursor: null,
        hasNext: false,
      },
    }),
  );

  app.get("/:logId", (context) => {
    const log = getClimbingLog(context.req.param("logId"));

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
