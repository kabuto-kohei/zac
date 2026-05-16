#!/usr/bin/env node

const defaultBaseUrl = "https://zac-api.vercel.app";
const defaultIterations = 5;
const defaultWarmup = 1;
const timeoutMs = 15_000;

const args = parseArgs(process.argv.slice(2));
const baseUrl = normalizeBaseUrl(args.baseUrl ?? process.env.ZAC_API_PERF_BASE_URL ?? defaultBaseUrl);
const iterations = parsePositiveInteger(args.iterations ?? process.env.ZAC_API_PERF_ITERATIONS, defaultIterations);
const warmup = parsePositiveInteger(args.warmup ?? process.env.ZAC_API_PERF_WARMUP, defaultWarmup);
const authToken = process.env.ZAC_API_PERF_AUTH_TOKEN;

const publicRoutes = [
  { label: "health", path: "/v1/health" },
  { label: "integrations", path: "/v1/integrations" },
  { label: "gyms.list", path: "/v1/gyms" },
  { label: "events.list", path: "/v1/events" },
  { label: "announcements.list", path: "/v1/announcements" },
];

const protectedRoutes = [
  { label: "feed.list", path: "/v1/feed" },
  { label: "posts.list", path: "/v1/posts" },
  { label: "sessionPlans.list", path: "/v1/session-plans" },
  { label: "logs.list", path: "/v1/logs" },
  { label: "notifications.list", path: "/v1/notifications" },
];

const routeResults = [];

for (const route of publicRoutes) {
  routeResults.push(await measureRoute(route, { authToken: null }));
}

if (authToken) {
  for (const route of protectedRoutes) {
    routeResults.push(await measureRoute(route, { authToken }));
  }
}

const derivedRoutes = await deriveDetailRoutes(routeResults, { authToken });
for (const route of derivedRoutes) {
  routeResults.push(await measureRoute(route, { authToken: route.requiresAuth ? authToken : null }));
}

printSummary(routeResults);

async function measureRoute(route, options) {
  const runs = [];

  for (let index = 0; index < warmup + iterations; index += 1) {
    const run = await requestRoute(route, options);

    if (index >= warmup) {
      runs.push(run);
    }
  }

  return {
    ...route,
    runs,
    sample: runs.find((run) => run.ok)?.body ?? null,
  };
}

async function requestRoute(route, options) {
  const url = `${baseUrl}${route.path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = options.authToken ? { authorization: `Bearer ${options.authToken}` } : {};
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    const text = await response.text();
    const durationMs = Math.max(0, performance.now() - startedAt);

    return {
      ok: response.ok,
      status: response.status,
      durationMs,
      serverDurationMs: parseDurationHeader(response.headers.get("x-zac-duration-ms")),
      requestId: response.headers.get("x-zac-request-id"),
      serverTiming: response.headers.get("server-timing"),
      body: parseJson(text),
    };
  } catch (error) {
    const durationMs = Math.max(0, performance.now() - startedAt);

    return {
      ok: false,
      status: "error",
      durationMs,
      serverDurationMs: null,
      requestId: null,
      serverTiming: null,
      body: null,
      error: error instanceof Error ? error.name : "unknown_error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function deriveDetailRoutes(results, options) {
  const routes = [];
  const gymId = firstId(results.find((result) => result.label === "gyms.list")?.sample);
  const eventId = firstId(results.find((result) => result.label === "events.list")?.sample);
  const announcementId = firstId(results.find((result) => result.label === "announcements.list")?.sample);
  const postId = firstId(results.find((result) => result.label === "posts.list")?.sample);

  if (gymId) {
    routes.push({ label: "gyms.detail", path: `/v1/gyms/${encodeURIComponent(gymId)}` });
  }

  if (eventId) {
    routes.push({ label: "events.detail", path: `/v1/events/${encodeURIComponent(eventId)}` });
  }

  if (announcementId) {
    routes.push({ label: "announcements.detail", path: `/v1/announcements/${encodeURIComponent(announcementId)}` });
  }

  if (options.authToken && postId) {
    routes.push({ label: "posts.detail", path: `/v1/posts/${encodeURIComponent(postId)}`, requiresAuth: true });
  }

  return routes;
}

function firstId(payload) {
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const first = data[0];

  return typeof first?.id === "string" ? first.id : null;
}

function printSummary(results) {
  const summary = results.map((result) => summarizeRoute(result));
  const sorted = [...summary].sort((left, right) => right.p95Ms - left.p95Ms);

  console.log(JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      baseUrl,
      iterations,
      warmup,
      authProtectedRoutesMeasured: Boolean(authToken),
      routes: sorted,
      note: "durationMs is client-side request time; serverDurationMs uses x-zac-duration-ms when the target API exposes it.",
    },
    null,
    2,
  ));
}

function summarizeRoute(result) {
  const durations = result.runs.map((run) => run.durationMs);
  const serverDurations = result.runs
    .map((run) => run.serverDurationMs)
    .filter((value) => typeof value === "number");
  const statuses = [...new Set(result.runs.map((run) => String(run.status)))];
  const failures = result.runs.filter((run) => !run.ok).length;

  return {
    label: result.label,
    path: result.path,
    statuses,
    failures,
    minMs: round(Math.min(...durations)),
    medianMs: round(percentile(durations, 0.5)),
    p95Ms: round(percentile(durations, 0.95)),
    maxMs: round(Math.max(...durations)),
    serverMedianMs: serverDurations.length > 0 ? round(percentile(serverDurations, 0.5)) : null,
    serverP95Ms: serverDurations.length > 0 ? round(percentile(serverDurations, 0.95)) : null,
    timingHeadersPresent: result.runs.some((run) => run.serverDurationMs !== null),
  };
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--base-url") {
      parsed.baseUrl = argv[index + 1];
      index += 1;
    } else if (arg === "--iterations") {
      parsed.iterations = argv[index + 1];
      index += 1;
    } else if (arg === "--warmup") {
      parsed.warmup = argv[index + 1];
      index += 1;
    }
  }

  return parsed;
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/u, "");
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseDurationHeader(value) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function percentile(values, ratio) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return sorted[index];
}

function round(value) {
  return Math.round(value * 10) / 10;
}
