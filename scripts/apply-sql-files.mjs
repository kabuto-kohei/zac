import fs from "node:fs";
import { createRequire } from "node:module";
import { withDatabaseClient } from "./db-runtime.mjs";

const requireFromDbPackage = createRequire(new URL("../packages/db/package.json", import.meta.url));
const postgres = requireFromDbPackage("postgres");

const databaseUrl = process.env.DATABASE_URL;
const files = process.argv.slice(2);

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

if (files.length === 0) {
  console.error("Usage: node scripts/apply-sql-files.mjs <file.sql> [...]");
  process.exit(1);
}

for (const file of files) {
  const text = fs.readFileSync(file, "utf8").replaceAll("--> statement-breakpoint", "");
  await withDatabaseClient(
    postgres,
    databaseUrl,
    async (sql) => {
      await sql.begin(async (tx) => {
        await tx.unsafe(text);
      });
    },
    { label: `apply ${file}` },
  );

  console.log(`applied ${file}`);
}
