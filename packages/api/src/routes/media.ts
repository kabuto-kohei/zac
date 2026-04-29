import { attachMediaSchema, createMediaUploadUrlsSchema } from "@zac/shared";
import { Hono } from "hono";
import { requireRequestActor, resolveRequestActor } from "../auth.js";
import { dataResponse, validationErrorResponse } from "../responses.js";
import { attachUploadedMedia, createMediaUploadUrls } from "../services/media-service.js";

export function createMediaRoutes() {
  const app = new Hono();

  app.post("/upload-urls", async (context) => {
    const result = createMediaUploadUrlsSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await resolveRequestActor(context.req.header("authorization"));
    const urls = await createMediaUploadUrls(result.data, actor?.userId);
    return context.json(dataResponse(urls), 201);
  });

  app.post("/attachments", async (context) => {
    const result = attachMediaSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    const attached = await attachUploadedMedia(result.data, actor.userId);
    return context.json(dataResponse(attached), 201);
  });

  return app;
}
