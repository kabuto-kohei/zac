import { spawnSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const transactionPoolerUrl = new URL(databaseUrl);
transactionPoolerUrl.port = "6543";

const projectCwd = new URL("../packages/api/", import.meta.url);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectCwd,
    encoding: "utf8",
    stdio: options.input ? ["pipe", "inherit", "inherit"] : "inherit",
    input: options.input,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("pnpm", ["dlx", "vercel", "env", "rm", "DATABASE_URL", "production", "--yes"]);
run("pnpm", ["dlx", "vercel", "env", "add", "DATABASE_URL", "production"], {
  input: transactionPoolerUrl.toString(),
});

console.log("Updated zac-api production DATABASE_URL to Supabase transaction pooler.");
