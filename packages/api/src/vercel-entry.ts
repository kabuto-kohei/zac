import { handle } from "@hono/node-server/vercel";
import { createApp } from "./app.js";
import { assertApiRuntimeConfig } from "./integrations/env.js";

assertApiRuntimeConfig();

export default handle(createApp());
