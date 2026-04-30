import { createReportSchema } from "@zac/shared";
import { Hono } from "hono";
import { requireRequestActor } from "../auth.js";
import { captureServerEvent } from "../integrations/analytics.js";
import { dataResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createReport, listReports } from "../services/report-service.js";

export function createReportRoutes() {
  const app = new Hono();

  app.get("/", async (context) => context.json(paginatedResponse(await listReports())));

  app.post("/", async (context) => {
    const result = createReportSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    const report = await createReport(result.data, actor.userId);
    captureServerEvent("report_created", {
      targetType: report.targetType,
      category: report.category,
    });
    return context.json(dataResponse(report), 201);
  });

  return app;
}
