import { Hono } from "hono";
import { dataResponse } from "../responses.js";
import { getApiIntegrationStatus } from "../integrations/env.js";

export function createIntegrationRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(dataResponse(getApiIntegrationStatus())));

  return app;
}
