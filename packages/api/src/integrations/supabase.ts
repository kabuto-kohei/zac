import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasEnv } from "./env.js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (!hasEnv("SUPABASE_URL") || !hasEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    return null;
  }

  cachedClient ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
