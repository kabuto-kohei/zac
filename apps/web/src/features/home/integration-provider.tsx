"use client";

import posthog from "posthog-js";
import { createClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { useEffect } from "react";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function IntegrationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void initBrowserMonitoring();
    initBrowserAnalytics();
    initBrowserSupabase();
  }, []);

  return children;
}

async function initBrowserMonitoring() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  const Sentry = await import("@sentry/browser");
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APP_ENV || "local",
    tracesSampleRate: process.env.NEXT_PUBLIC_APP_ENV === "production" ? 0.1 : 0,
    sendDefaultPii: false,
  });
}

function initBrowserAnalytics() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
  });
}

function initBrowserSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return;
  }

  supabaseClient ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
