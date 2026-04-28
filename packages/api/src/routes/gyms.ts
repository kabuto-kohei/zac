import { Hono } from "hono";
import { dataResponse, notFoundResponse } from "../responses.js";
import { getGym, listGyms } from "../services/gym-service.js";

export function createGymRoutes() {
  const app = new Hono();

  app.get("/", async (context) => context.json(dataResponse(await listGyms())));

  app.get("/:gymId", async (context) => {
    const gym = await getGym(context.req.param("gymId"));

    if (!gym) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(gym));
  });

  return app;
}
