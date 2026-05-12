import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const apiDir = join(root, "packages", "api");
const configPath = join(apiDir, ".vercel", "output", "functions", "index.func", ".vc-config.json");

run("pnpm", ["dlx", "vercel", "build", "--prod", "--yes"], apiDir);
run(
  "pnpm",
  [
    "exec",
    "esbuild",
    "packages/api/src/vercel-entry.ts",
    "--bundle",
    "--platform=node",
    "--target=node22",
    "--format=cjs",
    "--sourcemap",
    "--outfile=packages/api/.vercel/output/functions/index.func/src/app.cjs",
  ],
  root,
);

const config = JSON.parse(await readFile(configPath, "utf8"));
config.handler = "src/app.cjs";
config.runtime = "nodejs22.x";
config.architecture = config.architecture || "arm64";
config.framework = { slug: "hono" };
config.launcherType = "Nodejs";
config.shouldAddHelpers = false;
config.shouldAddSourcemapSupport = true;
config.filePathMap = {};
await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

if (process.argv.includes("--deploy")) {
  run("pnpm", ["dlx", "vercel", "deploy", "--prebuilt", "--prod", "--yes"], apiDir);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
