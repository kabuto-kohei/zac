import { Hono } from "hono";

export function createHealthRoutes() {
  const app = new Hono();

  app.get("/", (context) =>
    context.json({
      data: {
        ok: true,
        service: "zac-api",
      },
    }),
  );

  return app;
}

