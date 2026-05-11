import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const outputPath = process.argv[2] ?? "data/intake/source-automation-run.json";
const markdownPath = outputPath.replace(/\.json$/u, ".md");
const attempts = parsePositiveInt(process.env.ZAC_AUTOMATION_COMMAND_ATTEMPTS, 5);
const baseDelayMs = parsePositiveInt(process.env.ZAC_AUTOMATION_RETRY_BASE_MS, 10000);
const staleHours = parsePositiveInt(process.env.ZAC_AUTOMATION_STALE_HOURS, 24);

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
    neverPublish: ["full captions", "copied images/videos", "unreviewed raw source text"],
    noBillingActions: true,
  },
  status: "running",
  commands: [],
  summary: {},
  nextActions: [],
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });

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

    if (failedTransiently && recentMonitor) {
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
      process.exit(0);
    }

    run.status = "blocked";
    run.nextActions = [
      "Do not treat this run as a completed freshness pass.",
      "Retry pnpm sources:automation-run after DB/network recovery.",
      "If the failure is not transient, inspect the command stderr in data/intake/source-automation-run.json.",
    ];
    await writeRun(run);
    process.exitCode = 1;
    process.exit();
  }
}

run.status = "ready_for_review";
run.summary = await buildSummary();
run.nextActions = buildNextActions(run.summary);
await writeRun(run);

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
    child.on("close", resolve);
  });

  const finishedAt = new Date();
  return {
    name: step.name,
    command: step.command.join(" "),
    attempt,
    status: exitCode === 0 ? "passed" : "failed",
    exitCode,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    outputPath: step.output,
    stdout: truncate(Buffer.concat(stdoutChunks).toString("utf8")),
    stderr: truncate(Buffer.concat(stderrChunks).toString("utf8")),
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
    actions.push(`Inspect official Instagram recent-post queue first (${summary.instagramPostSources} source(s)); record post URLs in source_post_observations or reproducible SQL patches.`);
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
    actions.push(`Inspect last-known Instagram post queue read-only first (${summary.instagramPostSources} source(s)); prepare observations but wait for DB reachability before marking them complete.`);
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
  return /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|57P03|53300|08006/u.test(text);
}

function truncate(value) {
  const limit = 8000;
  return value.length > limit ? `${value.slice(0, limit)}\n...[truncated]` : value;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
