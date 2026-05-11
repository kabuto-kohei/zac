import fs from "node:fs/promises";

const runPath = process.env.ZAC_AUTOMATION_RUN_PATH ?? "data/intake/source-automation-run.json";
const historyPath = process.env.ZAC_AUTOMATION_HISTORY_PATH ?? "data/intake/source-automation-history.jsonl";
const lockPath = process.env.ZAC_AUTOMATION_LOCK_PATH ?? "data/intake/source-automation-run.lock.json";
const lockStaleMinutes = parsePositiveInt(process.env.ZAC_AUTOMATION_LOCK_STALE_MINUTES, 45);
const maxConsecutiveNonReady = parsePositiveInt(process.env.ZAC_AUTOMATION_MAX_CONSECUTIVE_NON_READY, 3);

const run = await readJson(runPath);
const history = await readJsonl(historyPath);
const lock = await readJson(lockPath);
const lockActive = lock ? !isStaleLock(lock) : false;
const consecutiveNonReady = countConsecutiveNonReady(history);
const latestHistory = history.at(-1) ?? null;

const checks = {
  hasLatestRun: Boolean(run),
  latestRunReady: run?.status === "ready_for_review",
  noActiveLock: !lockActive,
  consecutiveNonReadyWithinLimit: consecutiveNonReady < maxConsecutiveNonReady,
};

const ok = Object.values(checks).every(Boolean);
const result = {
  ok,
  checks,
  latestRun: run
    ? {
        generatedAt: run.generatedAt,
        updatedAt: run.updatedAt,
        status: run.status,
        blockedReason: run.blockedReason ?? null,
        degradedReason: run.degradedReason ?? null,
        publicNetworkReachable: run.summary?.publicNetworkReachable ?? null,
        databaseReachable: run.summary?.databaseReachable ?? null,
        instagramPostSources: run.summary?.instagramPostSources ?? null,
        dueApprovedSources: run.summary?.dueApprovedSources ?? null,
        upcomingEvents: run.summary?.upcomingEvents ?? null,
      }
    : null,
  latestHistory,
  historyCount: history.length,
  consecutiveNonReady,
  lock: lockActive ? lock : null,
};

console.log(JSON.stringify(result, null, 2));

if (!ok) {
  process.exitCode = 1;
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function readJsonl(file) {
  try {
    const text = await fs.readFile(file, "utf8");
    return text
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function countConsecutiveNonReady(history) {
  let count = 0;
  for (const record of history.slice().reverse()) {
    if (record.status === "ready_for_review") {
      break;
    }
    count += 1;
  }
  return count;
}

function isStaleLock(value) {
  const startedAtMs = Date.parse(value?.startedAt ?? "");
  if (!Number.isFinite(startedAtMs)) {
    return true;
  }

  return Date.now() - startedAtMs > lockStaleMinutes * 60 * 1000;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
