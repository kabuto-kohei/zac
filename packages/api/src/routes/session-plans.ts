import { Hono } from "hono";
import { dataResponse, notFoundResponse, paginatedResponse } from "../responses.js";
import { getSessionPlan, listSessionPlans } from "../services/session-plan-service.js";

export function createSessionPlanRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listSessionPlans())));

  app.get("/:planId", (context) => {
    const plan = getSessionPlan(context.req.param("planId"));

    if (!plan) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(plan));
  });

  return app;
}
