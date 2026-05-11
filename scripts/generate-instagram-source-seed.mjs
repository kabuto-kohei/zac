import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];
const relationshipSourceHandle = process.argv[3] ?? "comp_bible";

if (!inputPath) {
  console.error("Usage: node scripts/generate-instagram-source-seed.mjs <handles.txt> [relationship_source_handle]");
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf8");
const handles = [...new Set(raw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.replace(/^https?:\/\/(?:www\.)?instagram\.com\//, ""))
  .map((line) => line.replace(/^@/, ""))
  .map((line) => line.split(/[/?#\s]/)[0])
  .map((line) => line.toLowerCase())
  .filter((line) => /^[a-z0-9._]{1,30}$/.test(line)))];

const values = handles
  .map((handle) => {
    const sourceUrl = `https://www.instagram.com/${handle}/`;
    return `  ('instagram', '${sql(handle)}', NULL, '${sql(sourceUrl)}', 'official_instagram', '${sql(relationshipSourceHandle)}', 'comp_bible_following_import', 'Imported from a user-provided Comp Bible following list. Verify official status before publishing derived events.', 'summary_with_link', now(), NULL, 'candidate')`;
  })
  .join(",\n");

if (handles.length === 0) {
  console.log("No valid Instagram handles found. Nothing generated.");
  process.exit(0);
}

const sqlText = `INSERT INTO "event_sources" (
  "platform",
  "handle",
  "display_name",
  "source_url",
  "source_type",
  "relationship_source_handle",
  "discovery_source",
  "discovery_note",
  "ingestion_policy",
  "last_checked_at",
  "source_verified_at",
  "status"
)
VALUES
${values}
ON CONFLICT ("platform", "handle") DO UPDATE SET
  "source_url" = EXCLUDED."source_url",
  "source_type" = EXCLUDED."source_type",
  "relationship_source_handle" = EXCLUDED."relationship_source_handle",
  "discovery_source" = EXCLUDED."discovery_source",
  "discovery_note" = EXCLUDED."discovery_note",
  "ingestion_policy" = EXCLUDED."ingestion_policy",
  "last_checked_at" = EXCLUDED."last_checked_at",
  "status" = EXCLUDED."status",
  "updated_at" = now(),
  "deleted_at" = NULL;
`;

const outputPath = path.join("infra", "seeds", `generated_${relationshipSourceHandle}_instagram_sources.sql`);
fs.writeFileSync(outputPath, sqlText);
console.log(`Generated ${handles.length} source rows at ${outputPath}`);

function sql(value) {
  return value.replaceAll("'", "''");
}
