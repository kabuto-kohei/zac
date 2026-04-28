import { Hono } from "hono";
import { dataResponse, notFoundResponse, paginatedResponse } from "../responses.js";
import { getPost, listPosts } from "../services/post-service.js";

export function createPostRoutes() {
  const app = new Hono();

  app.get("/", (context) => context.json(paginatedResponse(listPosts())));

  app.get("/:postId", (context) => {
    const post = getPost(context.req.param("postId"));

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(post));
  });

  return app;
}
