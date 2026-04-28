import { Hono } from "hono";
import { dataResponse, notFoundResponse } from "../responses.js";
import { getGym, listGyms } from "../services/gym-service.js";

export function createGymRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(dataResponse(listGyms())));

  app.get("/:gymId", (context) => {
    const gym = getGym(context.req.param("gymId"));

    if (!gym) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(gym));
  });

  return app;
}
