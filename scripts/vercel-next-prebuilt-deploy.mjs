import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const appName = process.argv[2];
const allowedApps = new Set(["web", "admin"]);

if (!allowedApps.has(appName)) {
  console.error("Usage: node scripts/vercel-next-prebuilt-deploy.mjs <web|admin>");
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceAppDir = join(root, "apps", appName);
const deployRoot = join("/tmp", `zac-${appName}-deploy-root`);
const deployAppDir = join(deployRoot, "apps", appName);

await rm(deployRoot, { force: true, recursive: true });
run("pnpm", ["--config.node-linker=hoisted", "--filter", `@zac/${appName}`, "deploy", "--legacy", deployAppDir], root);
await mkdir(deployRoot, { recursive: true });
await cp(join(root, "tsconfig.base.json"), join(deployRoot, "tsconfig.base.json"));
await cp(join(sourceAppDir, ".vercel"), join(deployAppDir, ".vercel"), { recursive: true });
await writeFile(
  join(deployAppDir, "vercel.json"),
  `${JSON.stringify(
    {
      installCommand: "echo dependencies already prepared",
      buildCommand: "pnpm build",
    },
    null,
    2,
  )}\n`,
);

run("pnpm", ["dlx", "vercel", "build", "--prod", "--yes", "--standalone"], deployAppDir);
run("pnpm", ["dlx", "vercel", "deploy", "--prebuilt", "--prod", "--yes"], deployAppDir);

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
