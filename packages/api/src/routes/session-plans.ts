import { Hono } from "hono";
import { getSessionPlan, listSessionPlans } from "../services/session-plan-service.js";

export function createSessionPlanRoutes() {
  const app = new Hono();

  app.get("/", (context) =>
    context.json({
      data: listSessionPlans(),
      page: {
        limit: 20,
        cursor: null,
        hasNext: false,
      },
    }),
  );

  app.get("/:planId", (context) => {
    const plan = getSessionPlan(context.req.param("planId"));

    if (!plan) {
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

    return context.json({ data: plan });
  });

  return app;
}
