import { Hono } from "hono";
import { createSessionPlanSchema } from "@zac/shared";
import { dataResponse, notFoundResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createSessionPlan, getSessionPlan, listSessionPlans } from "../services/session-plan-service.js";

export function createSessionPlanRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listSessionPlans())));

  app.post("/", async (context) => {
    const result = createSessionPlanSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    return context.json(dataResponse(createSessionPlan(result.data)), 201);
  });

  app.get("/:planId", (context) => {
    const plan = getSessionPlan(context.req.param("planId"));

    if (!plan) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(plan));
  });

  return app;
}
