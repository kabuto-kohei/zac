-- Closure-queue official active sync, batch 5.
-- Checked on 2026-05-11 from public official pages/search-visible
-- official pages. Keep weak third-party-only rows queued.

WITH official_active_gyms (
  source_external_id,
  disciplines,
  website_url,
  instagram_url,
  source_url,
  source_attribution,
  opening_hours_text
) AS (
  VALUES
    (
      'rockgym:chiba:d-bouldering-plus-soga',
      'ボルダー',
      'https://www.d-b-c.jp/top/soga/',
      'https://www.instagram.com/dbouldering_soga/',
      'https://www.d-b-c.jp/top/soga/',
      'D.Bouldering Plus 蘇我公式サイト',
      '都度利用 平日 12:30-21:00 / 土日祝 10:00-18:00 / 月パス会員 24時間'
    ),
    (
      'rockgym:saitama:okku-rock',
      'ボルダー',
      'https://okkurock.com/',
      NULL,
      'https://okkurock.com/',
      'クライミングハウス オックロック公式サイト',
      '平日 10:00-22:00 / 土日祝 10:00-20:00'
    ),
    (
      'rockgym:tokyo:piglet',
      'ボルダー',
      'https://piglet-climb.com/',
      'https://www.instagram.com/pigletclimbinggym/',
      'https://piglet-climb.com/',
      'PIGLET CLIMBING GYM公式サイト',
      '平日 14:00-23:00 / 土日祝 13:00-21:00 / 不定休'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = u.website_url,
  "instagram_url" = COALESCE(u.instagram_url, g."instagram_url"),
  "instagram_handle" = CASE
    WHEN u.instagram_url = 'https://www.instagram.com/dbouldering_soga/' THEN 'dbouldering_soga'
    WHEN u.instagram_url = 'https://www.instagram.com/pigletclimbinggym/' THEN 'pigletclimbinggym'
    ELSE g."instagram_handle"
  END,
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 17:15:00+09'::timestamptz,
  "source_policy" = 'summary_with_link',
  "status" = 'published',
  "deleted_at" = NULL,
  "updated_at" = now()
FROM official_active_gyms u
WHERE g."source_external_id" = u.source_external_id;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'd-bouldering-plus-soga',
      'D.Bouldering Plus 蘇我公式サイト',
      'https://www.d-b-c.jp/top/soga/',
      'official_site',
      'Official D.Bouldering Plus Soga site. Use for events, route-set, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'dbouldering_soga',
      'D.Bouldering Plus 蘇我公式Instagram',
      'https://www.instagram.com/dbouldering_soga/',
      'official_instagram',
      'Linked from official Soga site. Use public post summaries and source links only; do not republish captions or media.'
    ),
    (
      'web',
      'okku-rock',
      'クライミングハウス オックロック公式サイト',
      'https://okkurock.com/',
      'official_site',
      'Official OKKU ROCK site. Use for opening-change, events, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'piglet-climbing-gym',
      'PIGLET CLIMBING GYM公式サイト',
      'https://piglet-climb.com/',
      'official_site',
      'Official Piglet site. Use for events, lessons, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'pigletclimbinggym',
      'PIGLET CLIMBING GYM公式Instagram',
      'https://www.instagram.com/pigletclimbinggym/',
      'official_instagram',
      'Official Piglet Instagram. Use public post summaries and source links only; do not republish captions or media.'
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
  'closure_queue_official_active_sync',
  discovery_note,
  'summary_with_link',
  '2026-05-11 17:15:00+09'::timestamptz,
  '2026-05-11 17:15:00+09'::timestamptz,
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
