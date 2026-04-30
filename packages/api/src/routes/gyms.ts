import { Hono } from "hono";
import { requireRequestActor } from "../auth.js";
import { dataResponse, notFoundResponse } from "../responses.js";
import { getGym, listGyms, saveGym, unsaveGym } from "../services/gym-service.js";

export function createGymRoutes() {
  const app = new Hono();

  app.get("/", async (context) => context.json(dataResponse(await listGyms())));

  app.post("/:gymId/save", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const gym = await getGym(context.req.param("gymId"));

    if (!gym) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(await saveGym(context.req.param("gymId"), actor.userId)));
  });

  app.delete("/:gymId/save", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const gym = await getGym(context.req.param("gymId"));

    if (!gym) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(await unsaveGym(context.req.param("gymId"), actor.userId)));
  });

  app.get("/:gymId", async (context) => {
    const gym = await getGym(context.req.param("gymId"));

    if (!gym) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(gym));
  });

  return app;
}
