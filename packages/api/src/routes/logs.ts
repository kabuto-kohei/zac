import { Hono } from "hono";
import { createClimbingLogSchema } from "@zac/shared";
import { requireRequestActor, resolveRequestActor } from "../auth.js";
import { captureServerEvent } from "../integrations/analytics.js";
import { dataResponse, notFoundResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createClimbingLog, getClimbingLog, listClimbingLogs } from "../services/climbing-log-service.js";
import { convertLogToPost } from "../services/post-service.js";

export function createLogRoutes() {
  const app = new Hono();

  app.get("/", async (context) => {
    const actor = await resolveRequestActor(context.req.header("authorization"));
    return context.json(paginatedResponse(await listClimbingLogs(actor?.userId)));
  });

  app.post("/", async (context) => {
    const result = createClimbingLogSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    const log = await createClimbingLog(result.data, actor.userId);
    captureServerEvent("climbing_log_created");
    return context.json(dataResponse(log), 201);
  });

  app.post("/:logId/convert-to-post", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await convertLogToPost(context.req.param("logId"), actor.userId);

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    captureServerEvent("log_converted_to_post", { logId: context.req.param("logId") });
    return context.json(dataResponse(post), 201);
  });

  app.get("/:logId", async (context) => {
    const actor = await resolveRequestActor(context.req.header("authorization"));
    const log = await getClimbingLog(context.req.param("logId"), actor?.userId);

    if (!log) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(log));
  });

  return app;
}
