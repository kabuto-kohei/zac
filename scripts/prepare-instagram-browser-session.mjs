import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const userDataDir = process.env.ZAC_INSTAGRAM_BROWSER_USER_DATA_DIR ?? ".zac-browser/instagram";
const outputPath = process.env.ZAC_INSTAGRAM_BROWSER_SESSION_JSON ?? "data/intake/instagram-browser-session.json";
const timeoutMs = parsePositiveInt(process.env.ZAC_INSTAGRAM_BROWSER_LOGIN_TIMEOUT_MS, 10 * 60 * 1000);
const pollMs = parsePositiveInt(process.env.ZAC_INSTAGRAM_BROWSER_LOGIN_POLL_MS, 3000);

await fs.mkdir(userDataDir, { recursive: true });
await fs.mkdir(path.dirname(outputPath), { recursive: true });

const context = await chromium.launchPersistentContext(userDataDir, {
  channel: process.env.ZAC_INSTAGRAM_BROWSER_CHANNEL || undefined,
  headless: false,
  locale: "ja-JP",
  timezoneId: "Asia/Tokyo",
  viewport: { width: 1280, height: 900 },
});

const page = await context.newPage();
const startedAt = new Date();
let state = {
  generatedAt: startedAt.toISOString(),
  status: "waiting_for_manual_login",
  userDataDir,
  timeoutMs,
  message: "Log in to Instagram in the opened browser window. No password, cookie, or token is read or stored by this script.",
};
await writeState(state);

try {
  await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const current = await classifyPage(page);
    state = {
      ...state,
      checkedAt: new Date().toISOString(),
      status: current.authenticated ? "authenticated" : current.status,
      detail: current.detail,
    };
    await writeState(state);
    if (current.authenticated) {
      console.log(JSON.stringify(state, null, 2));
      await context.close();
      process.exit(0);
    }
    await page.waitForTimeout(pollMs);
  }

  state = {
    ...state,
    checkedAt: new Date().toISOString(),
    status: "login_timeout",
    detail: "Manual login was not detected before timeout.",
  };
  await writeState(state);
  console.error(JSON.stringify(state, null, 2));
  process.exitCode = 2;
} finally {
  await context.close();
}

async function classifyPage(page) {
  const url = page.url();
  const text = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
  if (/checkpoint|本人確認|認証コード|suspicious|challenge/i.test(`${url}\n${text}`)) {
    return { authenticated: false, status: "checkpoint_required", detail: "Instagram checkpoint or 2FA UI detected." };
  }
  if (/\/accounts\/login|ログイン|Log in|Sign up|Create an account/i.test(`${url}\n${text}`)) {
    return { authenticated: false, status: "login_required", detail: "Instagram login UI is still visible." };
  }
  return { authenticated: true, status: "authenticated", detail: "Instagram home/profile UI is visible without login prompt." };
}

async function writeState(value) {
  await fs.writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`);
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
