import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { formatDatabaseError, waitForDatabaseDns } from "./db-runtime.mjs";

const requireFromDbPackage = createRequire(new URL("../packages/db/package.json", import.meta.url));
const postgres = requireFromDbPackage("postgres");

const databaseUrl = process.env.DATABASE_URL;
const outputPath = process.argv[2] ?? "data/intake/instagram-source-match-report.json";
const STOP_TOKENS = new Set([
  "bouldering",
  "boulcom",
  "climbing",
  "climbinggym",
  "noborock",
  "official",
  "rocky",
  "rockgym",
  "tokyo",
]);

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

let sql;

try {
  await waitForDatabaseDns(databaseUrl, { label: "sources:match-instagram" });
  sql = postgres(databaseUrl, { max: 1, prepare: false });
  const [candidates, gyms] = await Promise.all([
    sql`
      select id, handle, source_url, relationship_source_handle, discovery_source
      from event_sources
      where deleted_at is null
        and platform = 'instagram'
        and status = 'candidate'
      order by handle asc
    `,
    sql`
      select id, name, area, source_external_id, source_url, source_type, source_attribution, instagram_handle, instagram_url
      from gyms
      where deleted_at is null
        and status = 'published'
      order by name asc
    `,
  ]);

  const matches = candidates
    .map((candidate) => {
      const scored = gyms
        .map((gym) => scoreCandidate(candidate, gym))
        .filter((match) => match.score >= 55)
        .sort((a, b) => b.score - a.score || a.gym.name.localeCompare(b.gym.name, "ja"));
      return {
        handle: candidate.handle,
        sourceUrl: candidate.source_url,
        relationshipSourceHandle: candidate.relationship_source_handle,
        discoverySource: candidate.discovery_source,
        bestMatch: scored[0] ?? null,
        alternatives: scored.slice(1, 4),
      };
    })
    .filter((item) => item.bestMatch);

  const highConfidence = matches.filter((item) => item.bestMatch.score >= 88);
  const needsReview = matches.filter((item) => item.bestMatch.score < 88);
  const unmatched = candidates
    .filter((candidate) => !matches.some((match) => match.handle === candidate.handle))
    .map((candidate) => ({
      handle: candidate.handle,
      sourceUrl: candidate.source_url,
      relationshipSourceHandle: candidate.relationship_source_handle,
      discoverySource: candidate.discovery_source,
    }));

  const report = {
    generatedAt: new Date().toISOString(),
    policy: {
      purpose: "Prioritize Instagram candidate verification without scraping captions or images.",
      safeToAutoApply: false,
      nextStep: "Use Computer Use or official sites to confirm ownership before promoting candidates to approved.",
    },
    summary: {
      candidates: candidates.length,
      gyms: gyms.length,
      matched: matches.length,
      highConfidence: highConfidence.length,
      needsReview: needsReview.length,
      unmatched: unmatched.length,
    },
    highConfidence,
    needsReview,
    unmatched,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`wrote ${outputPath}`);
  console.log(JSON.stringify(report.summary, null, 2));
} catch (error) {
  console.error(JSON.stringify(formatDatabaseError(error), null, 2));
  process.exitCode = 1;
} finally {
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}

function scoreCandidate(candidate, gym) {
  const handle = normalize(candidate.handle);
  const gymName = normalize(gym.name);
  const area = normalize(gym.area ?? "");
  const sourceExternalId = normalize(gym.source_external_id ?? "");
  const knownHandle = normalize(gym.instagram_handle ?? "");
  const sourceUrl = normalize(gym.source_url ?? "");
  const attribution = normalize(gym.source_attribution ?? "");

  const reasons = [];
  let score = 0;

  if (knownHandle && handle === knownHandle) {
    score += 100;
    reasons.push("handle_matches_existing_gym_instagram");
  }

  const tokens = uniqueTokens([gymName, area, sourceExternalId, attribution].join(" "));
  const usefulTokens = tokens.filter((token) => token.length >= 4 && !STOP_TOKENS.has(token));
  const matchedTokens = usefulTokens.filter((token) => handle.includes(token));

  if (matchedTokens.length > 0) {
    score += Math.min(70, matchedTokens.length * 22);
    reasons.push(`handle_contains_tokens:${matchedTokens.join(",")}`);
  }

  const brand = inferBrand(gymName);
  if (brand && handle.includes(brand)) {
    score += 35;
    reasons.push(`brand_match:${brand}`);
  }

  if (area && handle.includes(area)) {
    score += 20;
    reasons.push(`area_match:${area}`);
  }

  if (sourceUrl && sourceUrl.includes(handle)) {
    score += 45;
    reasons.push("source_url_contains_handle");
  }

  return {
    score: Math.min(score, 100),
    reasons,
    gym: {
      id: gym.id,
      name: gym.name,
      area: gym.area ?? "",
      sourceExternalId: gym.source_external_id ?? "",
      sourceType: gym.source_type,
      sourceUrl: gym.source_url ?? "",
      sourceAttribution: gym.source_attribution ?? "",
      instagramHandle: gym.instagram_handle ?? null,
    },
  };
}

function inferBrand(value) {
  const normalized = normalize(value);
  const knownBrands = [
    "basecamp",
    "bpump",
    "boulcom",
    "dbouldering",
    "fishandbird",
    "noborock",
    "rocklands",
    "rocky",
    "westrock",
    "zeromito",
  ];
  return knownBrands.find((brand) => normalized.includes(brand)) ?? null;
}

function uniqueTokens(value) {
  return [...new Set(normalize(value).split(" ").filter(Boolean))];
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/&/g, " and ")
    .replace(/（.*?）|\(.*?\)/g, " ")
    .replace(/[^a-z0-9一-龠ぁ-んァ-ヶー]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
