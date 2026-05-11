import { Hono } from "hono";
import { isDatabaseReachable } from "../integrations/database.js";
import { dataResponse } from "../responses.js";
import { getApiIntegrationStatus } from "../integrations/env.js";

export function createIntegrationRoutes() {
  const app = new Hono();

  app.get("/", async (context) =>
    context.json(
      dataResponse({
        ...getApiIntegrationStatus(),
        databaseReachable: await isDatabaseReachable(),
      }),
    ),
  );

  return app;
}
