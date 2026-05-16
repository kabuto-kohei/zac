import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { withDatabaseClient } from "./db-runtime.mjs";

const requireFromDbPackage = createRequire(new URL("../packages/db/package.json", import.meta.url));
const postgres = requireFromDbPackage("postgres");

const databaseUrl = process.env.DATABASE_URL;
const outputJsonPath = process.env.ZAC_INSTAGRAM_LINK_DISCOVERY_JSON ?? "data/intake/official-instagram-link-discovery.json";
const outputSqlPath = process.env.ZAC_INSTAGRAM_LINK_DISCOVERY_SQL ?? "data/intake/official-instagram-link-discovery.sql";
const apply = process.argv.includes("--apply");
const STOP_TOKENS = new Set([
  "bouldering",
  "climbing",
  "climbinggym",
  "gym",
  "official",
  "rockgym",
  "tokyo",
]);

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const generatedAt = new Date();

const result = await withDatabaseClient(
  postgres,
  databaseUrl,
  async (sql) => {
    const [gyms, candidateSources] = await Promise.all([
      sql`
        select id, name, area, source_url, website_url, instagram_handle, instagram_url
        from gyms
        where deleted_at is null
          and status = 'published'
        order by name asc
      `,
      sql`
        select id, handle, source_url, status
        from event_sources
        where deleted_at is null
          and platform = 'instagram'
        order by handle asc
      `,
    ]);

    const sourcesByHandle = new Map(candidateSources.map((source) => [normalizeHandle(source.handle), source]));
    const discovered = [];
    const skipped = [];

    for (const gym of gyms) {
      const url = firstUsefulUrl(gym);
      if (!url) {
        skipped.push({ gymId: gym.id, gymName: gym.name, reason: "no official site url" });
        continue;
      }

      const page = await fetchPage(url);
      if (!page.ok) {
        skipped.push({ gymId: gym.id, gymName: gym.name, sourceUrl: url, reason: page.reason });
        continue;
      }

      const handles = extractInstagramHandles(page.html);
      if (handles.length === 0) {
        skipped.push({ gymId: gym.id, gymName: gym.name, sourceUrl: url, reason: "no instagram link on official site" });
        continue;
      }

      const existing = normalizeHandle(gym.instagram_handle);
      const scored = handles
        .map((handle) => ({
          handle,
          score: scoreHandleForGym(handle, gym),
          eventSource: sourcesByHandle.get(handle) ?? null,
        }))
        .sort((a, b) => b.score - a.score || Number(Boolean(b.eventSource)) - Number(Boolean(a.eventSource)) || a.handle.length - b.handle.length);
      const selected = existing
        ? scored.find((item) => item.handle === existing)
        : scored.find((item) => item.score >= 40 || item.eventSource);

      if (!selected) {
        skipped.push({
          gymId: gym.id,
          gymName: gym.name,
          sourceUrl: url,
          handles,
          reason: "instagram links found, but none confidently match this gym",
        });
        continue;
      }

      if (existing && existing !== selected.handle) {
        skipped.push({ gymId: gym.id, gymName: gym.name, sourceUrl: url, handle: selected.handle, reason: `gym already has different instagram: ${existing}` });
        continue;
      }

      discovered.push({
        gymId: gym.id,
        gymName: gym.name,
        area: gym.area,
        officialSiteUrl: url,
        instagramHandle: selected.handle,
        instagramUrl: `https://www.instagram.com/${selected.handle}/`,
        eventSourceId: selected.eventSource?.id ?? null,
        eventSourceStatus: selected.eventSource?.status ?? null,
        confidenceScore: selected.score,
        linkedHandles: scored.map((item) => ({ handle: item.handle, score: item.score, eventSourceStatus: item.eventSource?.status ?? null })),
      });
    }

    const unique = dedupeDiscoveries(discovered);

    if (apply && unique.length > 0) {
      for (const item of unique) {
        await sql`
          update gyms
          set instagram_handle = ${item.instagramHandle},
              instagram_url = ${item.instagramUrl},
              source_verified_at = ${generatedAt},
              updated_at = ${generatedAt}
          where id = ${item.gymId}
            and deleted_at is null
            and status = 'published'
            and (instagram_handle is null or lower(instagram_handle) = lower(${item.instagramHandle}))
        `;

        if (item.eventSourceId) {
          await sql`
            update event_sources
            set status = 'approved',
                source_verified_at = ${generatedAt},
                last_checked_at = ${generatedAt},
                discovery_note = trim(concat_ws(' ', discovery_note, ${`Official site links to Instagram profile on ${formatDate(generatedAt)}.`}::text)),
              updated_at = ${generatedAt}
            where id = ${item.eventSourceId}
          `;
        } else {
          await sql`
            insert into event_sources (
              platform,
              handle,
              display_name,
              source_url,
              source_type,
              discovery_source,
              discovery_note,
              status,
              source_verified_at,
              last_checked_at,
              updated_at
            )
            values (
              'instagram',
              ${item.instagramHandle},
              ${item.gymName},
              ${item.instagramUrl},
              'official_instagram',
              'official_site_link_discovery',
              ${`Official site links to Instagram profile on ${formatDate(generatedAt)}.`},
              'approved',
              ${generatedAt},
              ${generatedAt},
              ${generatedAt}
            )
            on conflict (platform, handle) do update
              set status = 'approved',
                  source_verified_at = excluded.source_verified_at,
                  last_checked_at = excluded.last_checked_at,
                  updated_at = excluded.updated_at
          `;
        }
      }
    }

    return {
      generatedAt: generatedAt.toISOString(),
      mode: apply ? "applied" : "dry_run",
      summary: {
        gymsScanned: gyms.length,
        discovered: unique.length,
        matchedExistingEventSources: unique.filter((item) => item.eventSourceId).length,
        skipped: skipped.length,
      },
      discovered: unique,
      skipped,
    };
  },
  { label: "official Instagram link discovery" },
);

await fs.mkdir(path.dirname(outputJsonPath), { recursive: true });
await fs.writeFile(outputJsonPath, `${JSON.stringify(result, null, 2)}\n`);
await fs.writeFile(outputSqlPath, renderSql(result));

console.log(JSON.stringify(result.summary, null, 2));

function firstUsefulUrl(gym) {
  const candidates = [gym.website_url, gym.source_url].filter(Boolean);
  return candidates.find((url) => {
    try {
      const parsed = new URL(url);
      return !parsed.hostname.endsWith("rockgym.jp") && !parsed.hostname.includes("instagram.com");
    } catch {
      return false;
    }
  });
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Zac official source verifier (+https://zac.app)",
      },
    });
    if (!response.ok) {
      return { ok: false, reason: `http ${response.status}` };
    }
    const html = await response.text();
    return { ok: true, html };
  } catch (error) {
    return { ok: false, reason: error?.name === "AbortError" ? "timeout" : error?.message ?? "fetch failed" };
  } finally {
    clearTimeout(timeout);
  }
}

function extractInstagramHandles(html) {
  const handles = new Set();
  const pattern = /https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._]+)\/?/giu;
  let match;
  while ((match = pattern.exec(html))) {
    const handle = normalizeHandle(match[1]);
    if (isUsefulInstagramHandle(handle)) {
      handles.add(handle);
    }
  }
  return [...handles].sort();
}

function isUsefulInstagramHandle(handle) {
  return Boolean(handle) && !handle.includes("http") && !["about", "accounts", "explore", "p", "reel", "reels", "stories", "wix"].includes(handle);
}

function dedupeDiscoveries(items) {
  const byGymHandle = new Map();
  for (const item of items) {
    const key = `${item.gymId}:${item.instagramHandle}`;
    if (!byGymHandle.has(key)) {
      byGymHandle.set(key, item);
    }
  }
  return [...byGymHandle.values()].sort((a, b) => a.gymName.localeCompare(b.gymName, "ja") || a.instagramHandle.localeCompare(b.instagramHandle));
}

function normalizeHandle(value) {
  return String(value ?? "")
    .trim()
    .replace(/^@/u, "")
    .replace(/\/$/u, "")
    .toLowerCase();
}

function scoreHandleForGym(handle, gym) {
  const normalizedHandle = normalizeCompact(handle);
  const sourceSlug = String(gym.source_external_id ?? "").split(":").at(-1) ?? "";
  const sourceTokens = tokenParts(sourceSlug);
  const nameTokens = tokenParts(gym.name);
  const areaTokens = tokenParts(gym.area ?? "");
  const allTokens = [...new Set([...sourceTokens, ...nameTokens, ...areaTokens])].filter((token) => token.length >= 3 && !STOP_TOKENS.has(token));
  let score = 0;

  for (const token of allTokens) {
    if (normalizedHandle.includes(token)) {
      score += sourceTokens.includes(token) ? 26 : 14;
    }
  }

  const compactSlug = normalizeCompact(sourceSlug);
  if (compactSlug && normalizedHandle.includes(compactSlug)) {
    score += 45;
  }

  const brand = inferBrand(gym.name);
  if (brand && normalizedHandle.includes(brand)) {
    score += 24;
  }

  return Math.min(score, 100);
}

function inferBrand(value) {
  const normalized = normalizeCompact(value);
  const knownBrands = [
    "basecamp",
    "beta",
    "bpump",
    "boulcom",
    "dbouldering",
    "dogwood",
    "energy",
    "fishandbird",
    "noborock",
    "pump",
    "rocky",
    "westrock",
  ];
  return knownBrands.find((brand) => normalized.includes(brand)) ?? null;
}

function tokenParts(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/（.*?）|\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/u)
    .filter(Boolean)
    .flatMap((token) => token.split(/[-_]+/u))
    .filter(Boolean);
}

function normalizeCompact(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function sqlString(value) {
  if (value == null) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function formatDate(value) {
  return value.toISOString().slice(0, 10);
}

function renderSql(run) {
  const lines = [
    "-- Generated by scripts/discover-official-instagram-links.mjs",
    "-- Updates only Instagram links found on official gym sites.",
    "BEGIN;",
  ];

  for (const item of run.discovered) {
    lines.push(
      `UPDATE gyms SET instagram_handle = ${sqlString(item.instagramHandle)}, instagram_url = ${sqlString(item.instagramUrl)}, source_verified_at = ${sqlString(run.generatedAt)}::timestamptz, updated_at = ${sqlString(run.generatedAt)}::timestamptz WHERE id = ${sqlString(item.gymId)}::uuid AND deleted_at IS NULL AND status = 'published' AND (instagram_handle IS NULL OR lower(instagram_handle) = lower(${sqlString(item.instagramHandle)}));`,
    );
    if (item.eventSourceId) {
      lines.push(
        `UPDATE event_sources SET status = 'approved', source_verified_at = ${sqlString(run.generatedAt)}::timestamptz, last_checked_at = ${sqlString(run.generatedAt)}::timestamptz, discovery_note = trim(concat_ws(' ', discovery_note, ${sqlString(`Official site links to Instagram profile on ${run.generatedAt.slice(0, 10)}.`)})), updated_at = ${sqlString(run.generatedAt)}::timestamptz WHERE id = ${sqlString(item.eventSourceId)}::uuid;`,
      );
    } else {
      lines.push(
        `INSERT INTO event_sources (platform, handle, display_name, source_url, source_type, discovery_source, discovery_note, status, source_verified_at, last_checked_at, updated_at) VALUES ('instagram', ${sqlString(item.instagramHandle)}, ${sqlString(item.gymName)}, ${sqlString(item.instagramUrl)}, 'official_instagram', 'official_site_link_discovery', ${sqlString(`Official site links to Instagram profile on ${run.generatedAt.slice(0, 10)}.`)}, 'approved', ${sqlString(run.generatedAt)}::timestamptz, ${sqlString(run.generatedAt)}::timestamptz, ${sqlString(run.generatedAt)}::timestamptz) ON CONFLICT (platform, handle) DO UPDATE SET status = 'approved', source_verified_at = excluded.source_verified_at, last_checked_at = excluded.last_checked_at, updated_at = excluded.updated_at;`,
      );
    }
  }

  lines.push("COMMIT;", "");
  return lines.join("\n");
}
