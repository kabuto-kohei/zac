-- Additional official-site discipline sync.
-- Checked on 2026-05-11 from gym official pages. Zac keeps public output to
-- summaries and source links.

WITH official_gym_updates (
  source_external_id,
  disciplines,
  website_url,
  source_url,
  source_attribution,
  opening_hours_text
) AS (
  VALUES
    (
      'rockgym:tokyo:headrock',
      'ボルダー',
      'https://headrock-climbing.com/',
      'https://headrock-climbing.com/',
      'HEADROCK CLIMBING GYM 公式サイト',
      '平日 13:00-23:30 / 土日祝 10:00-21:00 / 不定休'
    ),
    (
      'rockgym:saitama:limestone',
      'ボルダー',
      'https://www.limestone.jp/',
      'https://www.limestone.jp/facility',
      'LIMESTONE Climbing Club 公式サイト',
      '平日 13:00-23:00'
    ),
    (
      'rockgym:saitama:lutra-lutra',
      'ボルダー',
      'https://www.lutra-lutra.com/',
      'https://www.lutra-lutra.com/',
      'Lutra Lutra 公式サイト',
      '平日 14:00-23:00 / 土日祝 10:00-20:00 / 金曜定休'
    ),
    (
      'rockgym:saitama:monolithe',
      'ボルダー',
      'https://www.boulderinggym.jp/',
      'https://www.boulderinggym.jp/',
      'Monolithe Bouldering Gym 公式サイト',
      '平日 13:30-22:30 / 土日祝 10:00-20:00'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = COALESCE(u.website_url, g."website_url"),
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 14:05:00+00'::timestamptz,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_gym_updates u
WHERE g."source_external_id" = u.source_external_id
  AND g."deleted_at" IS NULL;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'headrock-climbing',
      'HEADROCK CLIMBING GYM 公式サイト',
      'https://headrock-climbing.com/',
      'official_site',
      'Official HEADROCK page. Use for event, route-set, school, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'limestone-climbing-club',
      'LIMESTONE Climbing Club 公式サイト',
      'https://www.limestone.jp/',
      'official_site',
      'Official LIMESTONE page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'lutra-lutra',
      'Lutra Lutra 公式サイト',
      'https://www.lutra-lutra.com/',
      'official_site',
      'Official Lutra Lutra page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'monolithe-bouldering-gym',
      'Monolithe Bouldering Gym 公式サイト',
      'https://www.boulderinggym.jp/',
      'official_site',
      'Official Monolithe page. Use for event, route-set, private-booking, and opening-change discovery. Publish summaries and source links only.'
    )
)
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
  platform,
  handle,
  display_name,
  source_url,
  source_type,
  NULL,
  'official_site_verification',
  discovery_note,
  'summary_with_link',
  '2026-05-11 14:05:00+00'::timestamptz,
  '2026-05-11 14:05:00+00'::timestamptz,
  'approved'
FROM official_sources
ON CONFLICT ("platform", "handle") DO UPDATE SET
  "display_name" = EXCLUDED."display_name",
  "source_url" = EXCLUDED."source_url",
  "source_type" = EXCLUDED."source_type",
  "discovery_source" = EXCLUDED."discovery_source",
  "discovery_note" = EXCLUDED."discovery_note",
  "ingestion_policy" = EXCLUDED."ingestion_policy",
  "last_checked_at" = EXCLUDED."last_checked_at",
  "source_verified_at" = EXCLUDED."source_verified_at",
  "status" = EXCLUDED."status",
  "updated_at" = now();
