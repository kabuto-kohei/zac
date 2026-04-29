import { readFile } from "node:fs/promises";

const requiredExampleKeys = [
  "APP_ENV",
  "APP_URL",
  "API_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "POSTHOG_KEY",
  "POSTHOG_HOST",
  "SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST",
  "NEXT_PUBLIC_SENTRY_DSN",
  "PORT",
  "JWT_AUDIENCE",
  "STORAGE_USER_MEDIA_BUCKET",
  "STORAGE_GYM_PUBLIC_BUCKET",
];

const privateNames = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "SENTRY_AUTH_TOKEN",
];

const envExample = await readText(".env.example");
const packageJson = JSON.parse(await readText("package.json"));
const findings = [];

for (const key of requiredExampleKeys) {
  if (!new RegExp(`^${key}=`, "m").test(envExample)) {
    findings.push(`.env.example is missing ${key}`);
  }
}

for (const privateName of privateNames) {
  if (privateName.startsWith("NEXT_PUBLIC_")) {
    findings.push(`${privateName} must not be public`);
  }
}

if (!packageJson.scripts?.["secret:scan"]) {
  findings.push("package.json is missing secret:scan");
}

if (!packageJson.scripts?.["openapi:check"]) {
  findings.push("package.json is missing openapi:check");
}

if (!packageJson.scripts?.check?.includes("secret:scan")) {
  findings.push("pnpm check must include secret:scan");
}

if (!packageJson.scripts?.check?.includes("openapi:check")) {
  findings.push("pnpm check must include openapi:check");
}

if (!packageJson.scripts?.check?.includes("config:audit")) {
  findings.push("pnpm check must include config:audit");
}

if (findings.length > 0) {
  console.error("config audit failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("config audit ok");

async function readText(path) {
  return readFile(path, "utf8");
}

