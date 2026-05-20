import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const root = process.cwd();
const paths = {
  packageJson: "package.json",
  runJson: "data/intake/source-automation-run.json",
  localRunJson: "data/intake/source-automation-local-run.json",
  monitorJson: "data/intake/source-monitor-run.json",
  inspectionJson: "data/intake/instagram-post-inspection.json",
  promotionJson: "data/intake/source-observation-promotions.json",
  readinessJson: "data/intake/source-automation-readiness.json",
  readinessMd: "data/intake/source-automation-readiness.md",
  historyJsonl: "data/intake/source-automation-history.jsonl",
  adminEventCandidatePage: "apps/admin/app/event-candidates/page.tsx",
  adminRoutes: "packages/api/src/routes/admin.ts",
  eventService: "packages/api/src/services/event-service.ts",
  launchAgentTemplate: "ops/launchd/com.zac.source-freshness.plist",
  installedLaunchAgent: path.join(os.homedir(), "Library/LaunchAgents/com.zac.source-freshness.plist"),
  codexAutomationToml:
    process.env.ZAC_CODEX_AUTOMATION_TOML ??
    path.join(os.homedir(), ".codex/automations/zac-official-source-freshness-monitor/automation.toml"),
  runbook: "docs/39_source_freshness_operations.md",
};

const expectedLaunchAgentIntervalSeconds = parsePositiveInt(process.env.ZAC_AUTOMATION_EXPECTED_INTERVAL_SECONDS, 10800);
const maxRunAgeMinutes = parsePositiveInt(process.env.ZAC_AUTOMATION_MAX_LATEST_RUN_AGE_MINUTES, 390);
const maxLocalRunAgeMinutes = parsePositiveInt(process.env.ZAC_AUTOMATION_MAX_LOCAL_RUN_AGE_MINUTES, 390);
const maxConsecutiveNonReady = parsePositiveInt(process.env.ZAC_AUTOMATION_MAX_CONSECUTIVE_NON_READY, 3);
const maxInstagramFailureRatio = parseRatio(process.env.ZAC_AUTOMATION_MAX_INSTAGRAM_FAILURE_RATIO, 0.25);
const label = process.env.ZAC_AUTOMATION_LAUNCH_AGENT_LABEL ?? "com.zac.source-freshness";
const officialFallbackRules = [
  {
    name: "PUMP climbing official network",
    domains: ["pump-climbing.com"],
    tokens: ["bpump", "b-pump", "pump"],
  },
  {
    name: "NOBOROCK official network",
    domains: ["noborock-climbing.com"],
    tokens: ["noborock"],
  },
  {
    name: "ROCKY official network",
    domains: ["rockyclimbing.com"],
    tokens: ["rocky"],
  },
  {
    name: "Base Camp official network",
    domains: ["b-camp.jp"],
    tokens: ["basecamp", "base-camp", "boulderingparkbasecamp", "urbanbasecamp"],
  },
  {
    name: "ao_roc official network",
    domains: ["aoroc.jp"],
    tokens: ["aoroc", "ao_roc"],
  },
];

const packageJson = await readJson(paths.packageJson);
const run = await readJson(paths.runJson);
const localRun = await readJson(paths.localRunJson);
const monitor = await readJson(paths.monitorJson);
const inspection = await readJson(paths.inspectionJson);
const promotion = await readJson(paths.promotionJson);
const history = await readJsonl(paths.historyJsonl);
const launchAgentTemplate = await readText(paths.launchAgentTemplate);
const installedLaunchAgent = await readText(paths.installedLaunchAgent);
const codexAutomationToml = await readText(paths.codexAutomationToml);
const runbook = await readText(paths.runbook);
const adminEventCandidatePage = await readText(paths.adminEventCandidatePage);
const adminRoutes = await readText(paths.adminRoutes);
const eventService = await readText(paths.eventService);
const launchAgent = await readLaunchAgentStatus(label);

const latestRunAgeMinutes = ageMinutes(run?.updatedAt ?? run?.generatedAt);
const localRunAgeMinutes = ageMinutes(localRun?.updatedAt ?? localRun?.generatedAt);
const consecutiveNonReady = countConsecutiveNonReady(history);
const failedRequiredLocalSteps = (localRun?.steps ?? []).filter((step) => step.required && step.status !== "passed");
const failedOptionalLocalSteps = (localRun?.steps ?? []).filter((step) => !step.required && step.status === "failed");
const instagramFailureRatio = ratio(inspection?.summary?.sourcesFailed ?? 0, inspection?.summary?.sourcesQueued ?? 0);
const failedInstagramInspections = (inspection?.inspections ?? []).filter((item) => !item.ok);
const failedInstagramWithoutFallback = failedInstagramInspections.filter((item) => !hasOfficialFallback(item, monitor));
const instagramFailuresCovered =
  instagramFailureRatio <= maxInstagramFailureRatio || failedInstagramWithoutFallback.length === 0;
const instagramBrowserSessionState = inspection?.browserSession?.state ?? "unknown";
const instagramBrowserSessionReady =
  instagramBrowserSessionState === "authenticated" ||
  instagramBrowserSessionState === "not_required" ||
  inspection?.mode === "browser_fixture";
const instagramBrowserRollerMadeProgress =
  (inspection?.summary?.sourcesQueued ?? 0) === 0 ||
  (inspection?.summary?.sourcesSucceeded ?? 0) > 0 ||
  (inspection?.summary?.observedPosts ?? 0) > 0 ||
  inspection?.mode === "browser_fixture";
const instagramBrowserPolicyText = [
  inspection?.policy?.collectionArchitecture ?? "",
  inspection?.policy?.excludedFields ?? "",
  inspection?.policy?.publication ?? "",
  inspection?.policy?.sourceEligibility ?? "",
].join(" ");

const checks = [
  check("package exposes sources:automation-local", packageJson?.scripts?.["sources:automation-local"]),
  check("package exposes sources:automation-health", packageJson?.scripts?.["sources:automation-health"]),
  check("package exposes sources:automation-readiness", packageJson?.scripts?.["sources:automation-readiness"]),
  check("latest automation run exists", Boolean(run)),
  check("latest automation run is ready_for_review", run?.status === "ready_for_review", run?.blockedReason ?? run?.degradedReason),
  check("latest automation run is fresh", isFreshAge(latestRunAgeMinutes, maxRunAgeMinutes), `${latestRunAgeMinutes ?? "unknown"}m`),
  check("latest run public web was reachable", run?.summary?.publicNetworkReachable === true),
  check("latest run database was reachable", run?.summary?.databaseReachable === true),
  check("local runner packet exists", Boolean(localRun)),
  check("local runner is ready_for_review", localRun?.status === "ready_for_review"),
  check("local runner packet is fresh", isFreshAge(localRunAgeMinutes, maxLocalRunAgeMinutes), `${localRunAgeMinutes ?? "unknown"}m`),
  check("local runner required steps all passed", failedRequiredLocalSteps.length === 0, failedRequiredLocalSteps.map((step) => step.name).join(", ")),
  check(
    "local runner optional steps completed or were intentionally skipped",
    failedOptionalLocalSteps.length === 0,
    failedOptionalLocalSteps.length ? failedOptionalLocalSteps.map((step) => step.name).join(", ") : "none",
  ),
  check("launchd agent is loaded", launchAgent.loaded, launchAgent.message),
  check("launchd last exit is ok", launchAgent.lastExitCode === 0 || launchAgent.lastExitCode === null, String(launchAgent.lastExitCode)),
  check(
    "launchd interval matches configured cadence",
    typeof launchAgent.runIntervalSeconds === "number" && launchAgent.runIntervalSeconds === expectedLaunchAgentIntervalSeconds,
    String(launchAgent.runIntervalSeconds),
  ),
  check("installed LaunchAgent matches repo template", Boolean(launchAgentTemplate) && launchAgentTemplate === installedLaunchAgent),
  check("Codex supervisor automation is active", /status = "ACTIVE"/u.test(codexAutomationToml)),
  check("Codex supervisor uses readiness gate", /sources:automation-readiness/u.test(codexAutomationToml)),
  check("Codex supervisor keeps health gate", /sources:automation-health/u.test(codexAutomationToml)),
  check("history has no repeated non-ready streak", consecutiveNonReady < maxConsecutiveNonReady, String(consecutiveNonReady)),
  check("no active automation lock", !(await exists("data/intake/source-automation-run.lock.json")) || launchAgent.running),
  check("monitor has Instagram queue visibility", Array.isArray(monitor?.queues?.instagramPostInspection)),
  check("monitor has upcoming-event recheck queue", Array.isArray(monitor?.queues?.upcomingEventRecheck)),
  check("monitor has closure-verification queue", Array.isArray(monitor?.queues?.closureVerification)),
  check("Instagram inspection uses browser roller contract", inspection?.mode === "browser_roller" || inspection?.mode === "browser_fixture", inspection?.mode ?? "unknown"),
  check("Instagram browser session is ready", instagramBrowserSessionReady, instagramBrowserSessionState),
  check(
    "Instagram browser roller made source progress",
    instagramBrowserRollerMadeProgress,
    `queued=${inspection?.summary?.sourcesQueued ?? "unknown"} succeeded=${inspection?.summary?.sourcesSucceeded ?? "unknown"} observed=${inspection?.summary?.observedPosts ?? "unknown"}`,
  ),
  check(
    "Instagram browser roller limits source eligibility",
    /approved official Instagram/u.test(instagramBrowserPolicyText),
    truncate(instagramBrowserPolicyText, 120),
  ),
  check(
    "Instagram browser roller has bounded backfill architecture",
    /backfill lane/u.test(instagramBrowserPolicyText) &&
      /latest three/u.test(instagramBrowserPolicyText) &&
      Number.isFinite(inspection?.cadence?.lookbackDays) &&
      inspection.cadence.lookbackDays <= 60,
    `lookbackDays=${inspection?.cadence?.lookbackDays ?? "unknown"}`,
  ),
  check(
    "Instagram inspection policy excludes secrets/media/captions",
    /passwords/u.test(instagramBrowserPolicyText) &&
      /cookies/u.test(instagramBrowserPolicyText) &&
      /full captions/u.test(instagramBrowserPolicyText) &&
      /images/u.test(instagramBrowserPolicyText),
    truncate(instagramBrowserPolicyText, 120),
  ),
  check(
    "Instagram browser observations require Admin review before public publication",
    /Admin candidate review/u.test(instagramBrowserPolicyText) || /Never publish automatically/u.test(instagramBrowserPolicyText),
    truncate(instagramBrowserPolicyText, 120),
  ),
  check(
    "Instagram inspection failures are within budget or covered by official fallback",
    instagramFailuresCovered,
    failedInstagramWithoutFallback.length
      ? `${Math.round(instagramFailureRatio * 100)}% failed; uncovered=${failedInstagramWithoutFallback.map((item) => item.handle).join(", ")}`
      : `${Math.round(instagramFailureRatio * 100)}% failed; covered by official fallback`,
  ),
  check("observation promotion defaults to draft review", promotion?.mode === "draft_review"),
  check("promotion policy blocks copied media/captions", /full captions/u.test(promotion?.policy?.excludedFields ?? "") && /images/u.test(promotion?.policy?.excludedFields ?? "")),
  check("Admin candidate review page exists", /eventCandidates/u.test(adminEventCandidatePage)),
  check("Admin API exposes candidate list and review mutation", /event-candidates/u.test(adminRoutes) && /:eventId\/review/u.test(adminRoutes)),
  check("event review approval can publish approved candidates", /reviewEventCandidate/u.test(eventService) && /reviewStatus: nextReviewStatus/u.test(eventService)),
  check("runbook defines unattended health contract", /unattended/i.test(runbook) && /LaunchAgent/u.test(runbook) && /ready_for_review/u.test(runbook)),
];

const failed = checks.filter((item) => !item.ok);
const warnings = checks.filter((item) => item.ok && item.severity === "warning" && item.detail && item.detail !== "none");
const ok = failed.length === 0;

const result = {
  generatedAt: new Date().toISOString(),
  ok,
  scope: "unattended official-source collection, staging, and safety supervision",
  notInScope: [
    "billing, purchases, subscription changes, or payment settings",
    "publishing copied Instagram captions/images/videos",
    "guessing closure or gym discipline without primary-source evidence",
    "auto-publishing uncertain event candidates",
  ],
  summary: {
    failedChecks: failed.length,
    warnings: warnings.length,
    latestRunAgeMinutes,
    localRunAgeMinutes,
    consecutiveNonReady,
    instagramFailureRatio,
    failedInstagramSources: failedInstagramInspections.map((item) => ({
      handle: item.handle,
      error: item.error ?? null,
      failureCategory: item.failureCategory ?? null,
      hasOfficialFallback: hasOfficialFallback(item, monitor),
    })),
    instagramBrowserSessionState,
    instagramBrowserRoller: inspection?.summary
      ? {
          sourcesVisited: inspection.summary.sourcesVisited ?? null,
          sourcesSucceeded: inspection.summary.sourcesSucceeded ?? null,
          sourcesFailed: inspection.summary.sourcesFailed ?? null,
          sourcesDeferred: inspection.summary.sourcesDeferred ?? null,
          postsSeen: inspection.summary.postsSeen ?? null,
          newPostsOpened: inspection.summary.newPostsOpened ?? null,
          lookbackPostsSkipped: inspection.summary.lookbackPostsSkipped ?? null,
          observedPosts: inspection.summary.observedPosts ?? null,
          calendarCandidates: inspection.summary.calendarCandidates ?? null,
        }
      : null,
    launchAgent,
    queues: {
      instagramPostInspection: monitor?.queues?.instagramPostInspection?.length ?? null,
      inspectNow: monitor?.queues?.inspectNow?.length ?? null,
      operatorBatch: monitor?.queues?.operatorBatch?.length ?? null,
      approvedSourceRotation: monitor?.queues?.approvedSourceRotation?.length ?? null,
      upcomingEventRecheck: monitor?.queues?.upcomingEventRecheck?.length ?? null,
      candidateVerification: monitor?.queues?.candidateVerification?.length ?? null,
      gymDisciplineVerification: monitor?.queues?.gymDisciplineVerification?.length ?? null,
      closureVerification: monitor?.queues?.closureVerification?.length ?? null,
    },
  },
  checks,
  nextActions: ok
    ? ["Automation is ready for unattended official-source collection and candidate staging under the documented guardrails."]
    : failed.map((item) => `Fix: ${item.name}${item.detail ? ` (${item.detail})` : ""}`),
};

await fs.mkdir(path.dirname(paths.readinessJson), { recursive: true });
await fs.writeFile(paths.readinessJson, `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(paths.readinessMd, renderMarkdown(result));

console.log(JSON.stringify(result, null, 2));

if (!ok) {
  process.exitCode = 1;
}

function check(name, ok, detail = "", severity = "error") {
  return { name, ok: Boolean(ok), detail: detail ?? "", severity };
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

async function readText(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return "";
  }
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readLaunchAgentStatus(agentLabel) {
  if (process.platform !== "darwin") {
    return {
      checked: false,
      loaded: true,
      running: false,
      lastExitCode: null,
      runIntervalSeconds: null,
      runs: null,
      reason: "launchd is only checked on macOS",
    };
  }

  try {
    const { stdout } = await execFileAsync("/bin/launchctl", ["print", `gui/${process.getuid()}/${agentLabel}`], {
      timeout: 10000,
      maxBuffer: 512 * 1024,
    });
    const lastExitMatch = stdout.match(/last exit code = (-?\d+)/u);

    return {
      checked: true,
      label: agentLabel,
      loaded: true,
      running: /\n\s*state = running/u.test(stdout),
      lastExitCode: lastExitMatch ? Number.parseInt(lastExitMatch[1], 10) : null,
      runIntervalSeconds: parseLaunchctlNumber(stdout, "run interval"),
      runs: parseLaunchctlNumber(stdout, "runs"),
    };
  } catch (error) {
    return {
      checked: true,
      label: agentLabel,
      loaded: false,
      running: false,
      lastExitCode: null,
      runIntervalSeconds: null,
      runs: null,
      message: String(error.message ?? ""),
    };
  }
}

function parseLaunchctlNumber(text, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = text.match(new RegExp(`${escapedKey} = (-?\\d+)`, "u"));
  return match ? Number.parseInt(match[1], 10) : null;
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

function ratio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : 0;
}

function hasOfficialFallback(inspectionItem, monitorValue) {
  const baseName = normalizeSourceBaseName(inspectionItem.displayName ?? inspectionItem.handle ?? "");
  const inspectionFingerprint = sourceFingerprint(inspectionItem);
  const queues = monitorValue?.queues ?? {};
  const candidates = Object.values(queues).flatMap((queue) => (Array.isArray(queue) ? queue.filter((item) => item && typeof item === "object") : []));

  return candidates.some((source) => {
    const sourceUrl = fallbackSourceUrl(source);
    if (!sourceUrl || /instagram\.com/u.test(sourceUrl)) {
      return false;
    }

    if (sameInstagramSource(inspectionItem, source)) {
      return true;
    }

    const candidateName = normalizeSourceBaseName(source.displayName ?? source.handle ?? "");
    if (candidateName.length > 0 && baseName.length > 0 && candidateName === baseName) {
      return true;
    }

    const candidateFingerprint = sourceFingerprint(source);
    if (sharedStableHandle(inspectionFingerprint.handleKey, candidateFingerprint.handleKey)) {
      return true;
    }

    const candidateDomain = domainFromUrl(sourceUrl);
    return officialFallbackRules.some((rule) => {
      const domainMatches = rule.domains.some((domain) => candidateDomain === domain || candidateDomain.endsWith(`.${domain}`));
      if (!domainMatches) {
        return false;
      }

      return rule.tokens.some((token) => {
        const normalizedToken = normalizeCompact(token);
        return (
          inspectionFingerprint.compact.includes(normalizedToken) ||
          inspectionFingerprint.handleKey.includes(normalizedToken) ||
          inspectionFingerprint.urlKey.includes(normalizedToken) ||
          candidateFingerprint.compact.includes(normalizedToken) ||
          candidateFingerprint.handleKey.includes(normalizedToken)
        );
      });
    });
  });
}

function fallbackSourceUrl(source) {
  const fallbackUrl = String(source.fallbackUrl ?? "");
  if (/^https?:\/\//u.test(fallbackUrl)) {
    return fallbackUrl;
  }

  const websiteUrl = String(source.websiteUrl ?? "");
  if (/^https?:\/\//u.test(websiteUrl)) {
    return websiteUrl;
  }

  const sourceUrl = String(source.sourceUrl ?? "");
  return /^https?:\/\//u.test(sourceUrl) ? sourceUrl : "";
}

function sameInstagramSource(inspectionItem, source) {
  const leftUrl = normalizeInstagramUrl(inspectionItem.sourceUrl);
  const rightUrl = normalizeInstagramUrl(source.instagramUrl ?? source.gymInstagramUrl);
  if (leftUrl && rightUrl && leftUrl === rightUrl) {
    return true;
  }

  const leftHandle = normalizeCompact(inspectionItem.handle ?? "");
  const rightHandle = normalizeCompact(source.instagramHandle ?? source.gymInstagramHandle ?? "");
  return Boolean(leftHandle && rightHandle && leftHandle === rightHandle);
}

function normalizeInstagramUrl(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//u, "")
    .replace(/[/?#].*$/u, "")
    .trim();
}

function normalizeSourceBaseName(value) {
  return String(value)
    .replace(/\s*公式Instagram\s*/gu, "")
    .replace(/\s*公式サイト\s*/gu, "")
    .replace(/\s*公式ページ\s*/gu, "")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

function sourceFingerprint(source) {
  return {
    compact: normalizeCompact(`${source.displayName ?? ""} ${source.handle ?? ""}`),
    handleKey: normalizeCompact(source.handle ?? ""),
    urlKey: normalizeCompact(source.sourceUrl ?? ""),
  };
}

function normalizeCompact(value) {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ン一-龥]/gu, "");
}

function sharedStableHandle(left, right) {
  if (!left || !right) {
    return false;
  }

  if (left === right) {
    return true;
  }

  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left];
  return shorter.length >= 8 && longer.includes(shorter);
}

function domainFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./u, "").toLowerCase();
  } catch {
    return "";
  }
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseRatio(value, fallback) {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

function truncate(value, max) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function renderMarkdown(resultValue) {
  const failedChecks = resultValue.checks.filter((item) => !item.ok);
  const failedSection = failedChecks.length
    ? failedChecks.map((item) => `- ${item.name}${item.detail ? `: ${item.detail}` : ""}`).join("\n")
    : "- none";
  const failedInstagram = resultValue.summary.failedInstagramSources.length
    ? resultValue.summary.failedInstagramSources
        .map((item) => `- ${item.handle}: ${item.error ?? "unknown"}; officialFallback=${item.hasOfficialFallback}`)
        .join("\n")
    : "- none";

  return `# Source Automation Readiness

- generatedAt: ${resultValue.generatedAt}
- ok: ${resultValue.ok}
- scope: ${resultValue.scope}
- failedChecks: ${resultValue.summary.failedChecks}
- warnings: ${resultValue.summary.warnings}
- latestRunAgeMinutes: ${resultValue.summary.latestRunAgeMinutes}
- localRunAgeMinutes: ${resultValue.summary.localRunAgeMinutes}
- consecutiveNonReady: ${resultValue.summary.consecutiveNonReady}
- instagramFailureRatio: ${resultValue.summary.instagramFailureRatio}
- instagramBrowserSessionState: ${resultValue.summary.instagramBrowserSessionState}

## Instagram Browser Roller

- sourcesVisited: ${resultValue.summary.instagramBrowserRoller?.sourcesVisited ?? "unknown"}
- sourcesSucceeded: ${resultValue.summary.instagramBrowserRoller?.sourcesSucceeded ?? "unknown"}
- sourcesFailed: ${resultValue.summary.instagramBrowserRoller?.sourcesFailed ?? "unknown"}
- sourcesDeferred: ${resultValue.summary.instagramBrowserRoller?.sourcesDeferred ?? "unknown"}
- postsSeen: ${resultValue.summary.instagramBrowserRoller?.postsSeen ?? "unknown"}
- newPostsOpened: ${resultValue.summary.instagramBrowserRoller?.newPostsOpened ?? "unknown"}
- observedPosts: ${resultValue.summary.instagramBrowserRoller?.observedPosts ?? "unknown"}
- calendarCandidates: ${resultValue.summary.instagramBrowserRoller?.calendarCandidates ?? "unknown"}

## Queues

- instagramPostInspection: ${resultValue.summary.queues.instagramPostInspection}
- inspectNow: ${resultValue.summary.queues.inspectNow}
- operatorBatch: ${resultValue.summary.queues.operatorBatch}
- approvedSourceRotation: ${resultValue.summary.queues.approvedSourceRotation}
- upcomingEventRecheck: ${resultValue.summary.queues.upcomingEventRecheck}
- candidateVerification: ${resultValue.summary.queues.candidateVerification}
- gymDisciplineVerification: ${resultValue.summary.queues.gymDisciplineVerification}
- closureVerification: ${resultValue.summary.queues.closureVerification}

## LaunchAgent

- loaded: ${resultValue.summary.launchAgent.loaded}
- running: ${resultValue.summary.launchAgent.running}
- lastExitCode: ${resultValue.summary.launchAgent.lastExitCode}
- runIntervalSeconds: ${resultValue.summary.launchAgent.runIntervalSeconds}
- runs: ${resultValue.summary.launchAgent.runs}

## Failed Checks

${failedSection}

## Failed Instagram Sources

${failedInstagram}

## Next Actions

${resultValue.nextActions.map((item) => `- ${item}`).join("\n")}
`;
}
