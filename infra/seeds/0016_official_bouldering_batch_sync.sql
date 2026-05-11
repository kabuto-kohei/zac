-- Additional official-site discipline sync.
-- Checked on 2026-05-11 from gym official pages. Public Zac output remains
-- summary-with-link only; no images, videos, or full captions are republished.

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
      'rockgym:tokyo:boulders',
      'ボルダー',
      'https://hokimaboulders.com/',
      'https://hokimaboulders.com/',
      'HOKIMABOULDERS 公式サイト',
      '平日 13:00-23:00 / 土日祝 9:00-21:00'
    ),
    (
      'rockgym:tokyo:fish-and-bird',
      'ボルダー',
      'https://fish-bird.co.jp/fishandbird/',
      'https://fish-bird.co.jp/fishandbird/',
      'Fish and Bird 公式サイト',
      '平日 14:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:tokyo:fits',
      'ボルダー',
      'https://www.fits-climbing.com/',
      'https://www.fits-climbing.com/',
      'FITS CLIMBING GYM 公式サイト',
      '火水金 10:30-22:00 / 木 13:00-22:00 / 土日祝 10:00-19:00 / 月曜定休'
    ),
    (
      'rockgym:kanagawa:forge-bouldering',
      'ボルダー',
      'https://www.forge-bouldering.com/',
      'https://www.forge-bouldering.com/',
      'Forge bouldering 公式サイト',
      '平日 14:00-23:00 / 土日 11:00-21:00 / 祝 13:00-21:00 / 月曜定休'
    ),
    (
      'rockgym:tokyo:jet-set',
      'ボルダー',
      'https://www.jetsetclimbing.com/',
      'https://www.jetsetclimbing.com/',
      'JET SET Climbing Gym 公式サイト',
      '平日 14:00-22:00 / 土 10:00-20:00 / 日祝 10:00-19:00 / 火曜定休'
    ),
    (
      'rockgym:kanagawa:kachill',
      'ボルダー',
      'https://kachill.jimdosite.com/',
      'https://kachill.jimdosite.com/',
      'KaChill 公式サイト',
      '平日 12:00-23:00 / 土日祝 10:00-21:00 / 金曜定休'
    ),
    (
      'rockgym:kanagawa:folk',
      'ボルダー',
      'https://folkboulderinggym.com/',
      'https://folkboulderinggym.com/',
      'folk bouldering gym 公式サイト',
      '平日 13:00-22:30 / 土日祝 10:00-20:00'
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
  "source_verified_at" = '2026-05-11 13:20:00+00'::timestamptz,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_gym_updates u
WHERE g."source_external_id" = u.source_external_id
  AND g."deleted_at" IS NULL;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'hokimaboulders',
      'HOKIMABOULDERS 公式サイト',
      'https://hokimaboulders.com/',
      'official_site',
      'Official BOULDERS page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'fish-and-bird',
      'Fish and Bird 公式サイト',
      'https://fish-bird.co.jp/fishandbird/',
      'official_site',
      'Official Fish and Bird page. Use for competition, event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'fits-climbing',
      'FITS CLIMBING GYM 公式サイト',
      'https://www.fits-climbing.com/',
      'official_site',
      'Official FITS page. Use for event, route-set, private-booking, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'forge-bouldering',
      'Forge bouldering 公式サイト',
      'https://www.forge-bouldering.com/',
      'official_site',
      'Official Forge page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'jetsetclimbing',
      'JET SET Climbing Gym 公式サイト',
      'https://www.jetsetclimbing.com/',
      'official_site',
      'Official JET SET page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'kachill',
      'KaChill 公式サイト',
      'https://kachill.jimdosite.com/',
      'official_site',
      'Official KaChill page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'folk-bouldering-gym',
      'folk bouldering gym 公式サイト',
      'https://folkboulderinggym.com/',
      'official_site',
      'Official folk page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
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
  '2026-05-11 13:20:00+00'::timestamptz,
  '2026-05-11 13:20:00+00'::timestamptz,
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
