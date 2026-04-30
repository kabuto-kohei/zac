import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { assertApiRuntimeConfig, getApiIntegrationStatus } from "./integrations/env.js";

const port = Number(process.env.PORT ?? 8787);
assertApiRuntimeConfig();
const integrations = getApiIntegrationStatus();

serve({
  fetch: createApp().fetch,
  port,
});

console.log(`Zac API listening on http://localhost:${port}`);
console.log(
  `Integrations: supabase=${integrations.supabase ? "on" : "off"} database=${integrations.database ? "on" : "off"} posthog=${integrations.posthog ? "on" : "off"} sentry=${integrations.sentry ? "on" : "off"}`,
);
