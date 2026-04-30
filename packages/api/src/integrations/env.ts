export type ApiIntegrationStatus = {
  supabase: boolean;
  database: boolean;
  posthog: boolean;
  sentry: boolean;
  storage: {
    userMediaBucket: string;
    gymPublicBucket: string;
  };
};

export function getApiIntegrationStatus(): ApiIntegrationStatus {
  return {
    supabase: hasEnv("SUPABASE_URL") && hasEnv("SUPABASE_SERVICE_ROLE_KEY"),
    database: hasEnv("DATABASE_URL"),
    posthog: hasEnv("POSTHOG_KEY"),
    sentry: hasEnv("SENTRY_DSN"),
    storage: {
      userMediaBucket: process.env.STORAGE_USER_MEDIA_BUCKET || "user-media",
      gymPublicBucket: process.env.STORAGE_GYM_PUBLIC_BUCKET || "gym-public",
    },
  };
}

export function assertApiRuntimeConfig() {
  if (!isProductionLike()) {
    return;
  }

  const missing = ["DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((name) => !hasEnv(name));

  if (missing.length > 0) {
    throw new Error(`Production API requires configured persistence and auth: missing ${missing.join(", ")}`);
  }
}

export function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

export function isRuntimeFallbackAllowed() {
  return !isProductionLike();
}

export function isProductionLike() {
  return process.env.APP_ENV === "production" || process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}
