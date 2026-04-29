import { Hono } from "hono";
import { createCommentSchema, createSessionPlanSchema } from "@zac/shared";
import { requireRequestActor, resolveRequestActor } from "../auth.js";
import { captureServerEvent } from "../integrations/analytics.js";
import { dataResponse, notFoundResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createComment, listComments } from "../services/comment-service.js";
import {
  cancelSessionPlanJoin,
  completeSessionPlan,
  convertSessionPlanToLog,
  createSessionPlan,
  getSessionPlan,
  joinSessionPlan,
  listSessionPlans,
} from "../services/session-plan-service.js";

export function createSessionPlanRoutes() {
  const app = new Hono();

  app.get("/", async (context) => {
    const actor = await resolveRequestActor(context.req.header("authorization"));
    return context.json(paginatedResponse(await listSessionPlans(actor?.userId)));
  });

  app.post("/", async (context) => {
    const result = createSessionPlanSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    const plan = await createSessionPlan(result.data, actor.userId);
    captureServerEvent("session_plan_created", { visibility: plan.visibility });
    return context.json(dataResponse(plan), 201);
  });

  app.post("/:planId/join", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const result = await joinSessionPlan(context.req.param("planId"), actor.userId);
    captureServerEvent("session_plan_joined", { planId: result.planId });
    return context.json(dataResponse(result));
  });

  app.delete("/:planId/join", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const result = await cancelSessionPlanJoin(context.req.param("planId"), actor.userId);
    return context.json(dataResponse(result));
  });

  app.post("/:planId/complete", async (context) => {
    await requireRequestActor(context.req.header("authorization"));
    const result = await completeSessionPlan(context.req.param("planId"));
    captureServerEvent("session_plan_completed", { planId: result.planId });
    return context.json(dataResponse(result));
  });

  app.post("/:planId/convert-to-log", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const log = await convertSessionPlanToLog(context.req.param("planId"), actor.userId);

    if (!log) {
      return context.json(notFoundResponse(), 404);
    }

    captureServerEvent("log_created", { source: "from_plan" });
    return context.json(dataResponse(log), 201);
  });

  app.get("/:planId/comments", async (context) => context.json(paginatedResponse(await listComments("session_plan", context.req.param("planId")))));

  app.post("/:planId/comments", async (context) => {
    const result = createCommentSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    const comment = await createComment("session_plan", context.req.param("planId"), result.data, actor.userId);
    return context.json(dataResponse(comment), 201);
  });

  app.get("/:planId", async (context) => {
    const actor = await resolveRequestActor(context.req.header("authorization"));
    const plan = await getSessionPlan(context.req.param("planId"), actor?.userId);

    if (!plan) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(plan));
  });

  return app;
}
