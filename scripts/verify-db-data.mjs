import { createRequire } from "node:module";
import { formatDatabaseError, withDatabaseClient } from "./db-runtime.mjs";

const requireFromDbPackage = createRequire(new URL("../packages/db/package.json", import.meta.url));
const postgres = requireFromDbPackage("postgres");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

try {
  const result = await withDatabaseClient(
    postgres,
    databaseUrl,
    async (sql) => {
      const [gyms, events, eventSources] = await Promise.all([
        sql.unsafe('select count(*)::int as count from "gyms"'),
        sql.unsafe('select count(*)::int as count from "events"'),
        sql.unsafe('select count(*)::int as count from "event_sources"'),
      ]);

      return {
        databaseReachable: true,
        gyms: gyms[0]?.count ?? 0,
        events: events[0]?.count ?? 0,
        eventSources: eventSources[0]?.count ?? 0,
      };
    },
    { label: "db:verify:remote" },
  );

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify(formatDatabaseError(error), null, 2));
  process.exitCode = 1;
}
