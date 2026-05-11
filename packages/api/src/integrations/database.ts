import { createDb, sql } from "@zac/db";
import { hasEnv } from "./env.js";

let cachedDb: ReturnType<typeof createDb> | null = null;

export function getDatabase() {
  if (!hasEnv("DATABASE_URL")) {
    return null;
  }

  cachedDb ??= createDb(process.env.DATABASE_URL!);
  return cachedDb;
}

export async function isDatabaseReachable() {
  const db = getDatabase();

  if (!db) {
    return false;
  }

  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}
