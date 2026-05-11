-- Promote each gym's official Instagram account into the event source registry.
-- This makes gym-owned accounts first-class calendar inputs, separate from
-- aggregator accounts such as Comp Bible.
INSERT INTO "event_sources" (
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
SELECT
  'instagram',
  "instagram_handle",
  "name",
  COALESCE("instagram_url", 'https://www.instagram.com/' || "instagram_handle" || '/'),
  'official_instagram',
  NULL,
  'gym_instagram_profile',
  'Official Instagram account attached to a Zac gym record. Use for event, competition, route-set, construction, and opening-change discovery. Publish summaries and source links only.',
  'summary_with_link',
  now(),
  "source_verified_at",
  CASE
    WHEN "source_type" IN ('official_site', 'official_instagram') THEN 'approved'
    ELSE 'candidate'
  END
FROM "gyms"
WHERE "instagram_handle" IS NOT NULL
  AND trim("instagram_handle") <> ''
  AND "deleted_at" IS NULL
ON CONFLICT ("platform", "handle") DO UPDATE SET
  "display_name" = EXCLUDED."display_name",
  "source_url" = EXCLUDED."source_url",
  "source_type" = 'official_instagram',
  "discovery_source" = EXCLUDED."discovery_source",
  "discovery_note" = EXCLUDED."discovery_note",
  "ingestion_policy" = EXCLUDED."ingestion_policy",
  "last_checked_at" = EXCLUDED."last_checked_at",
  "source_verified_at" = COALESCE("event_sources"."source_verified_at", EXCLUDED."source_verified_at"),
  "status" = CASE
    WHEN "event_sources"."status" = 'rejected' THEN 'rejected'
    WHEN EXCLUDED."status" = 'approved' THEN 'approved'
    ELSE "event_sources"."status"
  END,
  "updated_at" = now();
