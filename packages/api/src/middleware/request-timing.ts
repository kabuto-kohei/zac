import type { Context, Next } from "hono";

const defaultSlowThresholdMs = 750;

export async function requestTiming(context: Context, next: Next) {
  const startedAt = performance.now();
  const requestId = crypto.randomUUID();

  context.header("x-zac-request-id", requestId);

  await next();

  const durationMs = Math.max(0, performance.now() - startedAt);
  const roundedDuration = Math.round(durationMs);
  context.header("server-timing", `app;dur=${durationMs.toFixed(1)}`);
  context.header("x-zac-duration-ms", String(roundedDuration));

  if (shouldLogTiming(roundedDuration)) {
    console.log(
      JSON.stringify({
        event: "api_request_timing",
        requestId,
        method: context.req.method,
        path: context.req.path,
        status: context.res.status,
        durationMs: roundedDuration,
      }),
    );
  }
}

function shouldLogTiming(durationMs: number) {
  if (process.env.ZAC_API_TIMING_LOG === "1") {
    return true;
  }

  return durationMs >= getSlowThresholdMs();
}

function getSlowThresholdMs() {
  const value = Number.parseInt(process.env.ZAC_API_SLOW_REQUEST_MS ?? "", 10);
  return Number.isFinite(value) && value >= 0 ? value : defaultSlowThresholdMs;
}
