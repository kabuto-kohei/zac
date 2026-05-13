import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const runPath = process.env.ZAC_AUTOMATION_RUN_PATH ?? "data/intake/source-automation-run.json";
const historyPath = process.env.ZAC_AUTOMATION_HISTORY_PATH ?? "data/intake/source-automation-history.jsonl";
const lockPath = process.env.ZAC_AUTOMATION_LOCK_PATH ?? "data/intake/source-automation-run.lock.json";
const localRunPath = process.env.ZAC_AUTOMATION_LOCAL_RUN_PATH ?? "data/intake/source-automation-local-run.json";
const launchAgentLabel = process.env.ZAC_AUTOMATION_LAUNCH_AGENT_LABEL ?? "com.zac.source-freshness";
const lockStaleMinutes = parsePositiveInt(process.env.ZAC_AUTOMATION_LOCK_STALE_MINUTES, 45);
const maxConsecutiveNonReady = parsePositiveInt(process.env.ZAC_AUTOMATION_MAX_CONSECUTIVE_NON_READY, 3);
const maxLatestRunAgeMinutes = parsePositiveInt(process.env.ZAC_AUTOMATION_MAX_LATEST_RUN_AGE_MINUTES, 150);
const maxLocalRunAgeMinutes = parsePositiveInt(process.env.ZAC_AUTOMATION_MAX_LOCAL_RUN_AGE_MINUTES, 150);
const requireLocalRunner = parseBoolean(process.env.ZAC_AUTOMATION_REQUIRE_LOCAL_RUN, process.platform === "darwin");

const execFileAsync = promisify(execFile);

const run = await readJson(runPath);
const history = await readJsonl(historyPath);
const lock = await readJson(lockPath);
const localRun = await readJson(localRunPath);
const launchAgent = requireLocalRunner ? await readLaunchAgentStatus(launchAgentLabel) : { checked: false };
const lockActive = lock ? !isStaleLock(lock) : false;
const consecutiveNonReady = countConsecutiveNonReady(history);
const latestHistory = history.at(-1) ?? null;
const latestRunAgeMinutes = ageMinutes(run?.updatedAt ?? run?.generatedAt);
const localRunAgeMinutes = ageMinutes(localRun?.updatedAt ?? localRun?.generatedAt);
const localRunnerFresh = !requireLocalRunner || isFreshAge(localRunAgeMinutes, maxLocalRunAgeMinutes);
const launchAgentLoaded = !requireLocalRunner || launchAgent.loaded;
const launchAgentLastExitOk = !requireLocalRunner || launchAgent.lastExitCode === 0 || launchAgent.lastExitCode === null;
const lockExpectedInProgress = Boolean(requireLocalRunner && lockActive && launchAgent.running);
const localRunnerInProgress = Boolean(
  requireLocalRunner && localRunnerFresh && launchAgent.running,
);
const localRunnerReady = !requireLocalRunner || localRun?.status === "ready_for_review" || localRunnerInProgress;

const checks = {
  hasLatestRun: Boolean(run),
  latestRunReady: run?.status === "ready_for_review",
  latestRunFresh: isFreshAge(latestRunAgeMinutes, maxLatestRunAgeMinutes),
  noActiveLock: !lockActive || lockExpectedInProgress,
  consecutiveNonReadyWithinLimit: consecutiveNonReady < maxConsecutiveNonReady,
  localRunnerReady,
  localRunnerFresh,
  launchAgentLoaded,
  launchAgentLastExitOk,
};

const ok = Object.values(checks).every(Boolean);
const result = {
  ok,
  checks,
  latestRun: run
    ? {
        generatedAt: run.generatedAt,
        updatedAt: run.updatedAt,
        ageMinutes: latestRunAgeMinutes,
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
  localRun: localRun
    ? {
        generatedAt: localRun.generatedAt,
        updatedAt: localRun.updatedAt,
        ageMinutes: localRunAgeMinutes,
        status: localRun.status,
        summary: localRun.summary ?? {},
      }
    : null,
  launchAgent,
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

function ageMinutes(value) {
  const timestampMs = Date.parse(value ?? "");
  if (!Number.isFinite(timestampMs)) {
    return null;
  }

  return Math.max(0, Math.round((Date.now() - timestampMs) / 60000));
}

function isFreshAge(value, maxAgeMinutes) {
  return typeof value === "number" && value <= maxAgeMinutes;
}

async function readLaunchAgentStatus(label) {
  if (process.platform !== "darwin") {
    return {
      checked: false,
      reason: "launchd is only checked on macOS",
      loaded: true,
      lastExitCode: null,
    };
  }

  try {
    const { stdout } = await execFileAsync("/bin/launchctl", ["print", `gui/${process.getuid()}/${label}`], {
      timeout: 10000,
      maxBuffer: 512 * 1024,
    });
    const lastExitMatch = stdout.match(/last exit code = (-?\d+)/u);

    return {
      checked: true,
      label,
      loaded: true,
      running: /\n\s*state = running/u.test(stdout),
      lastExitCode: lastExitMatch ? Number.parseInt(lastExitMatch[1], 10) : null,
      runIntervalSeconds: parseLaunchctlNumber(stdout, "run interval"),
      runs: parseLaunchctlNumber(stdout, "runs"),
    };
  } catch (error) {
    return {
      checked: true,
      label,
      loaded: false,
      lastExitCode: null,
      error: error.code ?? error.name,
      message: String(error.message ?? ""),
    };
  }
}

function parseLaunchctlNumber(text, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = text.match(new RegExp(`${escapedKey} = (-?\\d+)`, "u"));
  return match ? Number.parseInt(match[1], 10) : null;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value === "1" || value === "true";
}
