import { createDb } from "@zac/db";
import { hasEnv } from "./env.js";

let cachedDb: ReturnType<typeof createDb> | null = null;

export function getDatabase() {
  if (!hasEnv("DATABASE_URL")) {
    return null;
  }

  cachedDb ??= createDb(process.env.DATABASE_URL!);
  return cachedDb;
}
