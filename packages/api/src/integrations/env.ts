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

export function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}
