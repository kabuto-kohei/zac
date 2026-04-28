import { findGymFixture, gymFixtures } from "@zac/shared";
import { Hono } from "hono";

export function createGymRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json({ data: gymFixtures }));

  app.get("/:gymId", (context) => {
    const gym = findGymFixture(context.req.param("gymId"));

    if (!gym) {
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

    return context.json({ data: gym });
  });

  return app;
}

