import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const ignoredFiles = new Set(["scripts/secret-scan.mjs"]);

const suspiciousPatterns = [
  { label: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { label: "Supabase JWT", pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/ },
  { label: "non-empty service role key", pattern: /SUPABASE_SERVICE_ROLE_KEY=(?!\s*$).+/ },
  { label: "non-empty database url", pattern: /DATABASE_URL=(?!\s*$).+/ },
  { label: "non-empty sentry token", pattern: /SENTRY_AUTH_TOKEN=(?!\s*$).+/ },
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await listFiles(path)));
      }
      continue;
    }

    if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

const findings = [];

for (const file of await listFiles(root)) {
  const relativePath = relative(root, file);
  if (ignoredFiles.has(relativePath)) {
    continue;
  }

  const content = await readFile(file, "utf8").catch(() => "");

  for (const { label, pattern } of suspiciousPatterns) {
    if (pattern.test(content)) {
      findings.push(`${relativePath}: ${label}`);
    }
  }
}

if (findings.length > 0) {
  console.error("Potential secrets found:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("secret scan ok");
