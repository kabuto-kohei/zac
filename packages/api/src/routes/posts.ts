import { Hono } from "hono";
import { createCommentSchema, createPostSchema } from "@zac/shared";
import { requireRequestActor } from "../auth.js";
import { captureServerEvent } from "../integrations/analytics.js";
import { dataResponse, notFoundResponse, paginatedResponse, validationErrorResponse } from "../responses.js";
import { createComment, listComments } from "../services/comment-service.js";
import { createPost, getPost, likePost, listPosts, savePost, unlikePost, unsavePost } from "../services/post-service.js";

export function createPostRoutes() {
  const app = new Hono();

  app.get("/", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    return context.json(paginatedResponse(await listPosts(actor.userId)));
  });

  app.post("/", async (context) => {
    const result = createPostSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await createPost(result.data, actor.userId);
    captureServerEvent("post_created", { visibility: post.visibility });
    return context.json(dataResponse(post), 201);
  });

  app.post("/:postId/like", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await getPost(context.req.param("postId"), actor.userId);

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    const result = await likePost(context.req.param("postId"), actor.userId);
    return context.json(dataResponse(result));
  });

  app.delete("/:postId/like", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await getPost(context.req.param("postId"), actor.userId);

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    const result = await unlikePost(context.req.param("postId"), actor.userId);
    return context.json(dataResponse(result));
  });

  app.post("/:postId/save", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await getPost(context.req.param("postId"), actor.userId);

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    const result = await savePost(context.req.param("postId"), actor.userId);
    return context.json(dataResponse(result));
  });

  app.delete("/:postId/save", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await getPost(context.req.param("postId"), actor.userId);

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    const result = await unsavePost(context.req.param("postId"), actor.userId);
    return context.json(dataResponse(result));
  });

  app.get("/:postId/comments", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await getPost(context.req.param("postId"), actor.userId);

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(paginatedResponse(await listComments("post", context.req.param("postId"))));
  });

  app.post("/:postId/comments", async (context) => {
    const result = createCommentSchema.safeParse(await context.req.json());

    if (!result.success) {
      return context.json(validationErrorResponse(result.error.flatten()), 422);
    }

    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await getPost(context.req.param("postId"), actor.userId);

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    const comment = await createComment("post", context.req.param("postId"), result.data, actor.userId);
    return context.json(dataResponse(comment), 201);
  });

  app.get("/:postId", async (context) => {
    const actor = await requireRequestActor(context.req.header("authorization"));
    const post = await getPost(context.req.param("postId"), actor.userId);

    if (!post) {
      return context.json(notFoundResponse(), 404);
    }

    return context.json(dataResponse(post));
  });

  return app;
}
