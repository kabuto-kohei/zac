import { Hono } from "hono";
import { createPostSchema } from "@zac/shared";
import { captureServerEvent } from "../integrations/analytics.js";
import { dataResponse, notFoundResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createPost, getPost, listPosts } from "../services/post-service.js";

export function createPostRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listPosts())));

  app.post("/", async (context) => {
    const result = createPostSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const post = createPost(result.data);
    captureServerEvent("post_created", { visibility: post.visibility });
    return context.json(dataResponse(post), 201);
  });

  app.get("/:postId", (context) => {
    const post = getPost(context.req.param("postId"));

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(post));
  });

  return app;
}
