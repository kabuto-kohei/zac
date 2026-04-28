import { Hono } from "hono";
import { createSessionPlanSchema } from "@zac/shared";
import { resolveRequestActor } from "../auth.js";
import { captureServerEvent } from "../integrations/analytics.js";
import { dataResponse, notFoundResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createSessionPlan, getSessionPlan, listSessionPlans } from "../services/session-plan-service.js";

export function createSessionPlanRoutes() {
  const app = new Hono();

  app.get("/", async (context) => context.json(paginatedResponse(await listSessionPlans())));

  app.post("/", async (context) => {
    const result = createSessionPlanSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await resolveRequestActor(context.req.header("authorization"));
    const plan = await createSessionPlan(result.data, actor?.userId);
    captureServerEvent("session_plan_created", { visibility: plan.visibility });
    return context.json(dataResponse(plan), 201);
  });

  app.get("/:planId", async (context) => {
    const plan = await getSessionPlan(context.req.param("planId"));

    if (!plan) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(plan));
  });

  return app;
}
