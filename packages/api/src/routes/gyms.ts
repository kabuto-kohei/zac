import { Hono } from "hono";
import { getGym, listGyms } from "../services/gym-service.js";

export function createGymRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json({ data: listGyms() }));

  app.get("/:gymId", (context) => {
    const gym = getGym(context.req.param("gymId"));

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
