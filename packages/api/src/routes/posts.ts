import { findPostFixture, postFixtures } from "@zac/shared";
import { Hono } from "hono";

export function createPostRoutes() {
  const app = new Hono();

  app.get("/", (context) =>
    context.json({
      data: postFixtures,
      page: {
        limit: 20,
        cursor: null,
        hasNext: false,
      },
    }),
  );

  app.get("/:postId", (context) => {
    const post = findPostFixture(context.req.param("postId"));

    if (!post) {
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

    return context.json({ data: post });
  });

  return app;
}

