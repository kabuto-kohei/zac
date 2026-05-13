import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const outputPath = process.env.ZAC_AUTOMATION_LOCAL_RUN_PATH ?? "data/intake/source-automation-local-run.json";
const markdownPath = outputPath.replace(/\.json$/u, ".md");
const commandTimeoutMs = parsePositiveInt(process.env.ZAC_AUTOMATION_LOCAL_COMMAND_TIMEOUT_MS, 240000);
const pnpmBin = process.env.PNPM_BIN ?? "pnpm";

const run = {
  generatedAt: new Date().toISOString(),
  updatedAt: null,
  status: "running",
  policy: {
    noBillingActions: true,
    noSecretOutput: true,
    officialSourceOnly: true,
  },
  steps: [],
  summary: {},
  nextActions: [],
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });

const stepPlan = [
  {
    name: "automationRunInitial",
    command: [pnpmBin, "sources:automation-run"],
    required: true,
  },
  {
    name: "inspectInstagram",
    command: [pnpmBin, "sources:inspect-instagram"],
    required: false,
    skipUnlessPassed: ["automationRunInitial"],
  },
  {
    name: "applyInstagramObservations",
    command: [pnpmBin, "exec", "node", "--env-file=.env.local", "scripts/apply-sql-files.mjs", "data/intake/instagram-post-observations.sql"],
    required: false,
    skipUnlessPassed: ["inspectInstagram"],
    requiredFile: "data/intake/instagram-post-observations.sql",
  },
  {
    name: "promoteObservations",
    command: [pnpmBin, "sources:promote-observations"],
    required: false,
    skipUnlessPassed: ["automationRunInitial"],
  },
  {
    name: "applyObservationPromotions",
    command: [pnpmBin, "exec", "node", "--env-file=.env.local", "scripts/apply-sql-files.mjs", "data/intake/source-observation-promotions.sql"],
    required: false,
    skipUnlessPassed: ["promoteObservations"],
    requiredFile: "data/intake/source-observation-promotions.sql",
  },
  {
    name: "automationRunFinal",
    command: [pnpmBin, "sources:automation-run"],
    required: true,
  },
  {
    name: "automationHealth",
    command: [pnpmBin, "sources:automation-health"],
    required: true,
  },
];

for (const step of stepPlan) {
  const skipped = await shouldSkip(step, run.steps);
  if (skipped) {
    run.steps.push({
      name: step.name,
      command: step.command.join(" "),
      status: "skipped",
      reason: skipped,
      required: step.required,
    });
    await writeRun(run);
    continue;
  }

  const result = await runCommand(step);
  run.steps.push(result);
  await writeRun(run);
}

const requiredFailures = run.steps.filter((step) => step.required && step.status !== "passed");
const optionalFailures = run.steps.filter((step) => !step.required && step.status === "failed");
run.status = requiredFailures.length === 0 ? "ready_for_review" : "blocked";
run.summary = {
  requiredFailures: requiredFailures.length,
  optionalFailures: optionalFailures.length,
  passed: run.steps.filter((step) => step.status === "passed").length,
  skipped: run.steps.filter((step) => step.status === "skipped").length,
};
run.nextActions = buildNextActions(requiredFailures, optionalFailures);
await writeRun(run);

console.log(JSON.stringify({ status: run.status, summary: run.summary, nextActions: run.nextActions }, null, 2));

if (run.status !== "ready_for_review") {
  process.exitCode = 1;
}

async function shouldSkip(step, completedSteps) {
  if (step.requiredFile && !(await exists(step.requiredFile))) {
    return `required file missing: ${step.requiredFile}`;
  }

  for (const dependency of step.skipUnlessPassed ?? []) {
    const dependencyStep = completedSteps.find((item) => item.name === dependency);
    if (dependencyStep?.status !== "passed") {
      return `dependency did not pass: ${dependency}`;
    }
  }

  return null;
}

async function runCommand(step) {
  const startedAt = new Date();
  let timedOut = false;
  const child = spawn(step.command[0], step.command.slice(1), {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdoutChunks = [];
  const stderrChunks = [];
  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
    stdoutChunks.push(chunk);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
    stderrChunks.push(chunk);
  });

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
  return {
    name: step.name,
    command: step.command.join(" "),
    required: step.required,
    status: exitCode === 0 && !timedOut ? "passed" : "failed",
    exitCode: timedOut ? 124 : exitCode,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    timedOut,
    stdout: truncate(Buffer.concat(stdoutChunks).toString("utf8")),
    stderr: truncate(Buffer.concat(stderrChunks).toString("utf8")),
  };
}

async function writeRun(value) {
  value.updatedAt = new Date().toISOString();
  await fs.writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`);
  await fs.writeFile(markdownPath, renderMarkdown(value));
}

function renderMarkdown(value) {
  const stepRows = value.steps
    .map((step) => {
      const suffix = step.reason ? ` (${step.reason})` : ` (${step.durationMs ?? 0}ms)`;
      return `- ${step.required ? "required" : "optional"} ${step.status}: \`${step.command}\`${suffix}`;
    })
    .join("\n");
  const nextRows = value.nextActions.map((action) => `- ${action}`).join("\n");

  return `# Source Automation Local Run

- Generated: ${value.generatedAt}
- Updated: ${value.updatedAt ?? value.generatedAt}
- Status: ${value.status}

## Steps

${stepRows || "No steps recorded."}

## Summary

- Required failures: ${value.summary?.requiredFailures ?? 0}
- Optional failures: ${value.summary?.optionalFailures ?? 0}
- Passed: ${value.summary?.passed ?? 0}
- Skipped: ${value.summary?.skipped ?? 0}

## Next Actions

${nextRows || "- No follow-up required."}
`;
}

function buildNextActions(requiredFailures, optionalFailures) {
  if (requiredFailures.length > 0) {
    return [
      `Fix required failed step(s): ${requiredFailures.map((step) => step.name).join(", ")}.`,
      "Check data/intake/source-automation-run.json and source-automation-local-run.json before trusting queue freshness.",
      "Rerun the local runner after DB/public-web reachability recovers.",
    ];
  }

  if (optionalFailures.length > 0) {
    return [
      `Review optional failed step(s): ${optionalFailures.map((step) => step.name).join(", ")}.`,
      "The core freshness packet is healthy, but Instagram observation intake or promotion may be incomplete.",
    ];
  }

  return ["No local runner action required."];
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function truncate(value) {
  const limit = 8000;
  return value.length > limit ? `${value.slice(0, limit)}\n...[truncated]` : value;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
