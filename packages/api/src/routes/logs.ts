import { Hono } from "hono";
import { dataResponse, notFoundResponse, paginatedResponse } from "../responses.js";
import { getClimbingLog, listClimbingLogs } from "../services/climbing-log-service.js";

export function createLogRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listClimbingLogs())));

  app.get("/:logId", (context) => {
    const log = getClimbingLog(context.req.param("logId"));

    if (!log) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(log));
  });

  return app;
}
