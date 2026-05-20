import { spawn } from "node:child_process";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const outputPath = process.argv[2] ?? "data/intake/source-automation-run.json";
const markdownPath = outputPath.replace(/\.json$/u, ".md");
const attempts = parsePositiveInt(process.env.ZAC_AUTOMATION_COMMAND_ATTEMPTS, 5);
const baseDelayMs = parsePositiveInt(process.env.ZAC_AUTOMATION_RETRY_BASE_MS, 10000);
const staleHours = parsePositiveInt(process.env.ZAC_AUTOMATION_STALE_HOURS, 24);
const allowNoPublicNetwork = process.env.ZAC_AUTOMATION_ALLOW_NO_PUBLIC_NETWORK === "1";
const commandTimeoutMs = parsePositiveInt(process.env.ZAC_AUTOMATION_COMMAND_TIMEOUT_MS, 120000);
const lockStaleMinutes = parsePositiveInt(process.env.ZAC_AUTOMATION_LOCK_STALE_MINUTES, 45);
const lockPath = process.env.ZAC_AUTOMATION_LOCK_PATH ?? "data/intake/source-automation-run.lock.json";
const historyPath = process.env.ZAC_AUTOMATION_HISTORY_PATH ?? "data/intake/source-automation-history.jsonl";
const degradedExitCode = process.env.ZAC_AUTOMATION_DEGRADED_EXIT_ZERO === "1" ? 0 : 2;

const commandPlan = [
  {
    name: "verifyRemoteDb",
    command: ["pnpm", "db:verify:remote"],
    output: null,
  },
  {
    name: "planRefresh",
    command: ["pnpm", "sources:plan-refresh"],
    output: "data/intake/source-refresh-plan.json",
  },
  {
    name: "matchInstagram",
    command: ["pnpm", "sources:match-instagram"],
    output: "data/intake/instagram-source-match-report.json",
  },
  {
    name: "monitorSources",
    command: ["pnpm", "sources:monitor"],
    output: "data/intake/source-monitor-run.json",
  },
];

const run = {
  generatedAt: new Date().toISOString(),
  policy: {
    officialSourceOnly: true,
    publicOutput: ["title", "summary", "category", "startsAt", "endsAt", "sourceUrl", "sourceLabel", "shortQuote"],
    neverPublish: ["full captions", "copied images/videos", "comments", "DMs", "stories", "passwords", "cookies", "unreviewed raw source text"],
    noBillingActions: true,
  },
  status: "running",
  commands: [],
  summary: {},
  nextActions: [],
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const lock = await acquireAutomationLock();

if (!lock.acquired) {
  run.status = "blocked";
  run.blockedReason = "concurrent source automation run";
  run.lock = lock.currentLock ?? null;
  run.summary = await buildSummary();
  run.nextActions = [
    "Do not start another freshness pass while a previous run is still active.",
    `If the lock is stale, remove ${lockPath} only after confirming no source automation process is running.`,
    "Rerun pnpm sources:automation-run after the active run finishes.",
  ];
  await writeRun(run);
  process.exitCode = 1;
  process.exit();
}

run.lock = lock.record;
registerLockCleanup(lock);

const preflight = await runCommand(
  {
    name: "publicNetworkPreflight",
    command: ["curl", "-I", "--max-time", "10", "https://example.com"],
    output: null,
  },
  1,
);
preflight.publicNetworkReachable = preflight.exitCode === 0;
run.commands.push(preflight);

if (preflight.status !== "passed" && !allowNoPublicNetwork) {
  run.status = "blocked";
  run.blockedReason = "publicNetworkPreflight failed";
  run.summary = await buildSummary();
  run.summary.publicNetworkReachable = preflight.publicNetworkReachable;
  run.nextActions = [
    "Do not treat this run as a completed freshness pass.",
    "Restore public web access before running official-source or Instagram inspection.",
    "Rerun pnpm sources:automation-run after network recovery; do not mark queue items complete from stale packets.",
  ];
  await writeRun(run);
  await releaseAutomationLock(lock);
  process.exitCode = 1;
  process.exit();
}

for (const step of commandPlan) {
  const result = await runWithRetries(step);
  run.commands.push(result);

  if (result.status !== "passed") {
    const recentMonitor = await getRecentMonitorArtifact(staleHours);
    const failedTransiently = isTransientFailure(result);
    run.blockedReason = `${step.name} failed`;
    run.summary = await buildSummary();
    run.summary.currentDatabaseReachable = false;
    run.summary.lastKnownDatabaseReachable = run.summary.databaseReachable;
    run.summary.databaseReachable = false;
    run.summary.publicNetworkReachable = preflight.publicNetworkReachable;

    if (failedTransiently && recentMonitor && preflight.publicNetworkReachable) {
      run.status = "degraded_review_ready";
      run.degradedReason = "Remote DB was not reachable, but a recent source monitor artifact is available.";
      run.lastKnownMonitor = recentMonitor;
      run.nextActions = buildDegradedNextActions(run.summary, recentMonitor);
      await writeRun(run);
      console.log(`wrote ${outputPath}`);
      console.log(`wrote ${markdownPath}`);
      console.log(
        JSON.stringify(
          {
            status: run.status,
            blockedReason: run.blockedReason,
            lastKnownMonitor: run.lastKnownMonitor,
            nextActions: run.nextActions.slice(0, 5),
          },
          null,
          2,
        ),
      );
      await releaseAutomationLock(lock);
      process.exit(degradedExitCode);
    }

    run.status = "blocked";
    run.nextActions = [
      "Do not treat this run as a completed freshness pass.",
      "Retry pnpm sources:automation-run after DB/network recovery.",
      "If the failure is not transient, inspect the command stderr in data/intake/source-automation-run.json.",
    ];
    await writeRun(run);
    await releaseAutomationLock(lock);
    process.exitCode = 1;
    process.exit();
  }
}

run.status = "ready_for_review";
run.summary = await buildSummary();
run.summary.publicNetworkReachable = preflight.publicNetworkReachable;
run.nextActions = buildNextActions(run.summary);
await writeRun(run);
await releaseAutomationLock(lock);

console.log(`wrote ${outputPath}`);
console.log(`wrote ${markdownPath}`);
console.log(JSON.stringify({ status: run.status, summary: run.summary, nextActions: run.nextActions.slice(0, 5) }, null, 2));

async function runWithRetries(step) {
  let lastResult;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await runCommand(step, attempt);
    if (result.exitCode === 0) {
      return { ...result, status: "passed" };
    }

    lastResult = result;
    if (attempt >= attempts || !isTransientFailure(result)) {
      return { ...result, status: "failed" };
    }

    const delayMs = baseDelayMs * attempt * attempt;
    console.warn(`${step.name} failed with a transient error; retrying in ${delayMs}ms (${attempt}/${attempts})`);
    await sleep(delayMs);
  }

  return { ...lastResult, status: "failed" };
}

async function runCommand(step, attempt) {
  const startedAt = new Date();
  let timedOut = false;
  const child = spawn(step.command[0], step.command.slice(1), {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdoutChunks = [];
  const stderrChunks = [];
  child.stdout.on("data", (chunk) => stdoutChunks.push(chunk));
  child.stderr.on("data", (chunk) => stderrChunks.push(chunk));

  const exitCode = await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill("SIGKILL");
        }
      }, 5000).unref();
    }, commandTimeoutMs);
    timeout.unref();
    child.on("close", resolve);
    child.on("close", () => clearTimeout(timeout));
  });

  const finishedAt = new Date();
  const stderr = Buffer.concat(stderrChunks).toString("utf8");
  return {
    name: step.name,
    command: step.command.join(" "),
    attempt,
    status: exitCode === 0 && !timedOut ? "passed" : "failed",
    exitCode: timedOut ? 124 : exitCode,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    outputPath: step.output,
    stdout: truncate(Buffer.concat(stdoutChunks).toString("utf8")),
    stderr: truncate(timedOut ? `${stderr}\nCommand timed out after ${commandTimeoutMs}ms.` : stderr),
    timedOut,
  };
}

async function buildSummary() {
  const monitor = await readJson("data/intake/source-monitor-run.json");
  const plan = await readJson("data/intake/source-refresh-plan.json");
  const matches = await readJson("data/intake/instagram-source-match-report.json");

  return {
    databaseReachable: monitor?.summary?.databaseReachable ?? true,
    gyms: monitor?.summary?.gyms ?? {},
    eventsByReviewStatus: monitor?.summary?.eventsByReviewStatus ?? {},
    scheduledEventsByCategory: monitor?.summary?.scheduledEventsByCategory ?? {},
    sourceStatus: plan?.summary?.sourceStatus ?? {},
    sourceType: plan?.summary?.sourceType ?? {},
    dueApprovedSources: monitor?.summary?.dueApprovedSources ?? 0,
    instagramPostSources: monitor?.summary?.instagramPostSources ?? monitor?.queues?.instagramPostInspection?.length ?? 0,
    approvedSourceRotation: monitor?.summary?.approvedSourceRotation ?? 0,
    operatorBatch: monitor?.queues?.operatorBatch?.length ?? 0,
    candidateSources: monitor?.summary?.candidateSources ?? 0,
    candidateMatches: matches?.summary ?? {},
    upcomingEvents: monitor?.summary?.upcomingEvents ?? 0,
    gymDisciplineCandidates: monitor?.summary?.gymDisciplineCandidates ?? 0,
    closureVerificationCandidates: monitor?.summary?.closureVerificationCandidates ?? 0,
  };
}

function buildNextActions(summary) {
  const actions = [];
  if (summary.instagramPostSources > 0) {
    actions.push(
      `Run the Instagram browser roller first (${summary.instagramPostSources} approved source(s)); it must use a logged-in browser session, check the latest three posts/reels for freshness, use bounded backfill for next unknown posts when needed, and stage candidates for Admin review.`,
    );
  }
  if (summary.dueApprovedSources > 0) {
    actions.push(`Inspect ${summary.dueApprovedSources} due approved source(s) from inspectNow first.`);
  }
  if (summary.operatorBatch > 0) {
    actions.push(`Inspect operatorBatch next; it currently has ${summary.operatorBatch} approved source(s).`);
  }
  if (summary.upcomingEvents > 0) {
    actions.push(`Recheck upcomingEventRecheck for items starting within the next 30 days (${summary.upcomingEvents} queued).`);
  }
  if (summary.candidateSources > 0) {
    actions.push(`Promote candidateVerification only with official-site/profile evidence (${summary.candidateSources} queued).`);
  }
  if (summary.gymDisciplineCandidates > 0) {
    actions.push(`Classify gym disciplines only from official site/SNS evidence; leave directory-only rows as クライミング (${summary.gymDisciplineCandidates} queued).`);
  }
  if (summary.closureVerificationCandidates > 0) {
    actions.push(`Verify closure, relocation, and rename risk with official evidence first; require two independent current sources if the official source is unavailable (${summary.closureVerificationCandidates} queued).`);
  }

  return actions.length > 0 ? actions : ["No source action is currently queued; rerun on the next cadence."];
}

function buildDegradedNextActions(summary, monitor) {
  const actions = [
    `Use last-known source monitor only for read-only official-source inspection; it was generated ${monitor.generatedAt}.`,
    "Prepare reproducible seed/SQL patches from confirmed official sources, but do not run remote DB writes until pnpm db:verify:remote passes.",
    "Rerun pnpm sources:automation-run before marking any source queue item complete.",
  ];

  if (summary.operatorBatch > 0) {
    actions.push(`Inspect last-known operatorBatch first; it currently has ${summary.operatorBatch} approved source(s).`);
  }
  if (summary.instagramPostSources > 0) {
    actions.push(`Inspect last-known Instagram browser-roller queue read-only first (${summary.instagramPostSources} approved source(s)); prepare observations but wait for DB reachability before marking them complete.`);
  }
  if (summary.upcomingEvents > 0) {
    actions.push(`Recheck last-known upcomingEventRecheck items carefully (${summary.upcomingEvents} queued).`);
  }
  if (summary.candidateSources > 0) {
    actions.push(`Promote candidateVerification only after official-site/profile evidence (${summary.candidateSources} queued).`);
  }
  if (summary.gymDisciplineCandidates > 0) {
    actions.push(`Classify gym disciplines only from official site/SNS evidence (${summary.gymDisciplineCandidates} queued).`);
  }
  if (summary.closureVerificationCandidates > 0) {
    actions.push(`Verify closure/relocation/rename risk read-only; do not change gym status until DB reachability returns (${summary.closureVerificationCandidates} queued).`);
  }

  return actions;
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function getRecentMonitorArtifact(maxAgeHours) {
  const monitor = await readJson("data/intake/source-monitor-run.json");
  const generatedAt = monitor?.generatedAt ?? monitor?.run?.generatedAt;
  if (!generatedAt) {
    return null;
  }

  const generatedAtMs = Date.parse(generatedAt);
  if (!Number.isFinite(generatedAtMs)) {
    return null;
  }

  const ageMs = Date.now() - generatedAtMs;
  if (ageMs < 0 || ageMs > maxAgeHours * 60 * 60 * 1000) {
    return null;
  }

  return {
    path: "data/intake/source-monitor-run.json",
    generatedAt,
    maxAgeHours,
    ageMinutes: Math.round(ageMs / 60000),
  };
}

async function writeRun(value) {
  value.updatedAt = new Date().toISOString();
  await fs.writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`);
  await fs.writeFile(markdownPath, renderMarkdown(value));
  await appendRunHistory(value);
}

function renderMarkdown(value) {
  const commandRows = value.commands
    .map((command) => `- ${command.status}: \`${command.command}\` (${command.durationMs}ms, attempt ${command.attempt})`)
    .join("\n");
  const nextRows = value.nextActions.map((action) => `- ${action}`).join("\n");
  const summaryRows = Object.entries(flattenSummary(value.summary ?? {}))
    .map(([key, item]) => `- ${key}: ${item}`)
    .join("\n");

  return `# Source Automation Run

- Generated: ${value.generatedAt}
- Updated: ${value.updatedAt ?? value.generatedAt}
- Status: ${value.status}
${value.blockedReason ? `- Blocked reason: ${value.blockedReason}\n` : ""}
${value.degradedReason ? `- Degraded reason: ${value.degradedReason}\n` : ""}
${value.lastKnownMonitor ? `- Last-known monitor: ${value.lastKnownMonitor.path} (${value.lastKnownMonitor.ageMinutes} minutes old)\n` : ""}
## Commands

${commandRows || "No commands completed."}

## Summary

${summaryRows || "No summary available."}

## Next Actions

${nextRows || "No next actions."}
`;
}

function flattenSummary(summary, prefix = "") {
  return Object.fromEntries(
    Object.entries(summary).flatMap(([key, value]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.entries(flattenSummary(value, nextKey));
      }

      return [[nextKey, value]];
    }),
  );
}

function isTransientFailure(result) {
  const text = `${result.stdout}\n${result.stderr}`;
  return /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|57P03|53300|08006|EMAXCONNSESSION|max clients reached|pool_size/u.test(text);
}

function truncate(value) {
  const limit = 8000;
  return value.length > limit ? `${value.slice(0, limit)}\n...[truncated]` : value;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function acquireAutomationLock() {
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  const record = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
    lockPath,
  };

  try {
    const existing = JSON.parse(await fs.readFile(lockPath, "utf8"));
    if (!isStaleLock(existing)) {
      return { acquired: false, currentLock: existing };
    }

    await fs.rm(lockPath, { force: true });
  } catch (error) {
    if (error.code !== "ENOENT") {
      return { acquired: false, currentLock: { error: error.code ?? error.name, message: String(error.message ?? "") } };
    }
  }

  try {
    await fs.writeFile(lockPath, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
    return { acquired: true, record };
  } catch (error) {
    const currentLock = await readJson(lockPath);
    return { acquired: false, currentLock: currentLock ?? { error: error.code ?? error.name, message: String(error.message ?? "") } };
  }
}

async function releaseAutomationLock(lock) {
  if (!lock?.acquired) {
    return;
  }

  const current = await readJson(lockPath);
  if (current?.pid === process.pid && current?.startedAt === lock.record.startedAt) {
    await fs.rm(lockPath, { force: true });
  }
}

function registerLockCleanup(lock) {
  if (!lock?.acquired) {
    return;
  }

  const cleanup = () => {
    try {
      const current = JSON.parse(fsSync.readFileSync(lockPath, "utf8"));
      if (current?.pid === process.pid && current?.startedAt === lock.record.startedAt) {
        fsSync.rmSync(lockPath, { force: true });
      }
    } catch {
      // Best-effort cleanup only; stale-lock handling covers abnormal exits.
    }
  };

  process.once("exit", cleanup);
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      cleanup();
      process.exit(128 + (signal === "SIGINT" ? 2 : 15));
    });
  }
}

function isStaleLock(lock) {
  const startedAtMs = Date.parse(lock?.startedAt ?? "");
  if (!Number.isFinite(startedAtMs)) {
    return true;
  }

  return Date.now() - startedAtMs > lockStaleMinutes * 60 * 1000;
}

async function appendRunHistory(value) {
  await fs.mkdir(path.dirname(historyPath), { recursive: true });
  const summary = value.summary ?? {};
  const historyRecord = {
    generatedAt: value.generatedAt,
    updatedAt: value.updatedAt,
    status: value.status,
    blockedReason: value.blockedReason ?? null,
    degradedReason: value.degradedReason ?? null,
    publicNetworkReachable: summary.publicNetworkReachable ?? null,
    databaseReachable: summary.databaseReachable ?? null,
    instagramPostSources: summary.instagramPostSources ?? null,
    dueApprovedSources: summary.dueApprovedSources ?? null,
    upcomingEvents: summary.upcomingEvents ?? null,
    commandCount: value.commands?.length ?? 0,
  };

  await fs.appendFile(historyPath, `${JSON.stringify(historyRecord)}\n`);
}
