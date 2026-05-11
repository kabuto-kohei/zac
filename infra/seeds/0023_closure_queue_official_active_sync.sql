-- Closure-queue official active sync, batch 4.
-- Checked on 2026-05-11 from public official pages.
-- Apply only official active evidence; directory-only or stale third-party
-- evidence remains queued for later recheck.

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
      'rockgym:tokyo:cell',
      'ボルダー',
      'https://www.climb-cell.com/',
      NULL,
      'https://www.climb-cell.com/',
      'クライミングジムCELL公式サイト',
      '平日 12:00-22:00 / 土休日 10:00-20:00 / 不定休'
    ),
    (
      'rockgym:saitama:kazo-gymnasium',
      'ボルダー / リード',
      'https://www.city.kazo.lg.jp/benriservice/map/shisetsu/sisetugaiyou_supotu/30292.html',
      NULL,
      'https://www.city.kazo.lg.jp/benriservice/map/shisetsu/sisetugaiyou_supotu/30292.html',
      '加須市公式サイト 加須市民体育館',
      '利用時間 9:00-21:45 / 年末年始休館'
    ),
    (
      'rockgym:chiba:asuka',
      'ボルダー',
      'https://climbing-aska.com/',
      NULL,
      'https://climbing-aska.com/',
      'クライミング飛鳥公式サイト',
      NULL
    ),
    (
      'rockgym:chiba:d-bouldering-plus-lead-kaihimmakuhari',
      'ボルダー / リード',
      'https://www.d-b-c.jp/top/kaihin-makuhari/',
      NULL,
      'https://www.d-b-c.jp/top/kaihin-makuhari/',
      'D.Bouldering Plus Lead 海浜幕張公式サイト',
      '平日 13:00-23:00 / 土日祝 10:00-20:00 / 年中無休'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = u.website_url,
  "instagram_url" = COALESCE(u.instagram_url, g."instagram_url"),
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 16:45:00+09'::timestamptz,
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
      'climbing-gym-cell',
      'クライミングジムCELL公式サイト',
      'https://www.climb-cell.com/',
      'official_site',
      'Official CELL site. Use for opening-change, route-set, lesson, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'kazo-citizen-gymnasium',
      '加須市民体育館公式ページ',
      'https://www.city.kazo.lg.jp/benriservice/map/shisetsu/sisetugaiyou_supotu/30292.html',
      'official_site',
      'Official Kazo City gymnasium page. Use for facility status, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'climbing-aska',
      'クライミング飛鳥公式サイト',
      'https://climbing-aska.com/',
      'official_site',
      'Official Climbing Asuka site. Use for events, lessons, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'd-bouldering-plus-lead-kaihin-makuhari',
      'D.Bouldering Plus Lead 海浜幕張公式サイト',
      'https://www.d-b-c.jp/top/kaihin-makuhari/',
      'official_site',
      'Official D.Bouldering Plus Lead Kaihin-Makuhari site. Use for events, route-set, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
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
  '2026-05-11 16:45:00+09'::timestamptz,
  '2026-05-11 16:45:00+09'::timestamptz,
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
