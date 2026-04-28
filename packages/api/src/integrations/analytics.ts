import { PostHog } from "posthog-node";
import { hasEnv } from "./env.js";

let analyticsClient: PostHog | null = null;

export function getAnalyticsClient() {
  if (!hasEnv("POSTHOG_KEY")) {
    return null;
  }

  analyticsClient ??= new PostHog(process.env.POSTHOG_KEY!, {
    host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
  });

  return analyticsClient;
}

export function captureServerEvent(event: string, properties: Record<string, unknown> = {}) {
  const client = getAnalyticsClient();

  if (!client) {
    return;
  }

  client.capture({
    distinctId: "server",
    event,
    properties,
  });
}
