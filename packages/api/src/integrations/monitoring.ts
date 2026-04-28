import * as Sentry from "@sentry/node";
import { hasEnv } from "./env.js";

let initialized = false;

export function initMonitoring() {
  if (initialized || !hasEnv("SENTRY_DSN")) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENV || process.env.NODE_ENV || "local",
    tracesSampleRate: process.env.APP_ENV === "production" ? 0.1 : 0,
    sendDefaultPii: false,
  });
  initialized = true;
}

export function captureException(error: unknown) {
  if (!initialized) {
    return;
  }

  Sentry.captureException(error);
}
