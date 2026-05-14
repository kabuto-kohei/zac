import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    prepare: false,
  });
  return drizzle(client);
}
