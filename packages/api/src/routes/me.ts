import { onboardingProfileSchema, updateProfileSettingsSchema } from "@zac/shared";
import { Hono } from "hono";
import { requireRequestActor } from "../auth.js";
import { dataResponse, validationErrorResponse } from "../responses.js";
import { getCurrentProfile, updateCurrentSettings, upsertCurrentProfile } from "../services/profile-service.js";

export function createMeRoutes() {
  const app = new Hono();

  app.get("/profile", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    return context.json(dataResponse(await getCurrentProfile(actor)));
  });

  app.put("/profile", async (context) => {
    const result = onboardingProfileSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    return context.json(dataResponse(await upsertCurrentProfile(actor, result.data)));
  });

  app.patch("/settings", async (context) => {
    const result = updateProfileSettingsSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    return context.json(dataResponse(await updateCurrentSettings(actor, result.data)));
  });

  return app;
}
