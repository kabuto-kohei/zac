#!/usr/bin/env node

const defaults = {
  apiUrl: process.env.ZAC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://zac-api.vercel.app",
  webUrl: process.env.ZAC_WEB_URL ?? process.env.APP_URL ?? "https://zac-web.vercel.app",
  adminUrl: process.env.ZAC_ADMIN_URL ?? process.env.ADMIN_URL ?? "https://zac-admin.vercel.app",
};

const checks = [
  {
    name: "api.health",
    url: `${defaults.apiUrl}/v1/health`,
    expectJson: true,
    validate: (payload) => payload?.status === "ok" || payload?.data?.status === "ok" || payload?.data?.ok === true,
  },
  {
    name: "api.events",
    url: `${defaults.apiUrl}/v1/events`,
    expectJson: true,
    validate: (payload) => Array.isArray(payload?.data),
  },
  {
    name: "api.gyms",
    url: `${defaults.apiUrl}/v1/gyms`,
    expectJson: true,
    validate: (payload) => Array.isArray(payload?.data),
  },
  {
    name: "web.home",
    url: defaults.webUrl,
    expectText: ["Zac"],
  },
  {
    name: "web.update-request",
    url: `${defaults.webUrl}/reports/new?targetType=gym`,
    expectText: ["Zac"],
  },
  {
    name: "web.v1-hidden-route",
    url: `${defaults.webUrl}/plans/new`,
    expectText: ["Zac"],
    forbidText: ["V2", "予定作成"],
  },
  {
    name: "admin.reports",
    url: `${defaults.adminUrl}/reports`,
    expectText: ["Zac Admin"],
  },
];

const results = [];

for (const check of checks) {
  const startedAt = performance.now();
  try {
    const response = await fetch(check.url, {
      headers: {
        accept: check.expectJson ? "application/json" : "text/html",
      },
    });
    const durationMs = Math.round(performance.now() - startedAt);
    const statusOk = response.status >= 200 && response.status < 400;

    let contentOk = true;
    let detail = "";
    if (check.expectJson) {
      const payload = await response.json().catch(() => null);
      contentOk = Boolean(check.validate?.(payload));
      detail = contentOk ? "json ok" : "json shape mismatch";
    } else {
      const text = await response.text();
      const missing = check.expectText.filter((fragment) => !text.includes(fragment));
      const forbidden = (check.forbidText ?? []).filter((fragment) => text.includes(fragment));
      contentOk = missing.length === 0 && forbidden.length === 0;
      detail = contentOk ? "text ok" : `missing text: ${missing.join(", ")} forbidden text: ${forbidden.join(", ")}`;
    }

    results.push({
      name: check.name,
      ok: statusOk && contentOk,
      status: response.status,
      durationMs,
      detail,
    });
  } catch (error) {
    results.push({
      name: check.name,
      ok: false,
      status: 0,
      durationMs: Math.round(performance.now() - startedAt),
      detail: error instanceof Error ? error.message : "request failed",
    });
  }
}

const ok = results.every((result) => result.ok);
const output = {
  generatedAt: new Date().toISOString(),
  ok,
  scope: "Zac V1 controlled launch smoke",
  urls: defaults,
  results,
};

console.log(JSON.stringify(output, null, 2));
process.exit(ok ? 0 : 1);
