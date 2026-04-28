import { Hono } from "hono";
import { createClimbingLogSchema } from "@zac/shared";
import { resolveRequestActor } from "../auth.js";
import { captureServerEvent } from "../integrations/analytics.js";
import { dataResponse, notFoundResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createClimbingLog, getClimbingLog, listClimbingLogs } from "../services/climbing-log-service.js";

export function createLogRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listClimbingLogs())));

  app.post("/", async (context) => {
    const result = createClimbingLogSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await resolveRequestActor(context.req.header("authorization"));
    const log = await createClimbingLog(result.data, actor?.userId);
    captureServerEvent("climbing_log_created");
    return context.json(dataResponse(log), 201);
  });

  app.get("/:logId", (context) => {
    const log = getClimbingLog(context.req.param("logId"));

    if (!log) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(log));
  });

  return app;
}
