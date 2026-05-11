-- Closure-queue official active sync.
-- Checked on 2026-05-11 from public official pages.
-- These rows were directory-only closure/rename candidates, but official pages
-- show current operating information. Keep them published and promote their
-- official sources into the monitor rotation.

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
      'rockgym:saitama:energy-urawa',
      'ボルダー / リード',
      'https://energy-climbing.co.jp/urawa/',
      'https://www.instagram.com/energyurawa/',
      'https://energy-climbing.co.jp/urawa/',
      'エナジークライミングジム浦和店公式サイト',
      '火金 10:30-22:30 / 土日祝 10:00-21:00 / 月曜定休'
    ),
    (
      'rockgym:saitama:penguin',
      'ボルダー',
      'https://penguin-climb.com/',
      NULL,
      'https://penguin-climb.com/new/',
      'クライミングジムPenguin公式サイト',
      '火金 13:00-23:00 / 土 11:00-21:00 / 日祝 10:00-20:00 / 月曜定休'
    ),
    (
      'rockgym:tokyo:jam-session-mitaka',
      'ボルダー',
      'https://xn--xckbj6a9jra6a4gy403a4b6j.com/',
      NULL,
      'https://xn--xckbj6a9jra6a4gy403a4b6j.com/',
      'ジャムセッション三鷹公式サイト',
      NULL
    ),
    (
      'rockgym:ibaraki:monkey-magic-tsukuba',
      'ボルダー',
      'https://tsukuba-mm.jp/',
      NULL,
      'https://tsukuba-mm.jp/',
      'TSUKUBA MONKEY MAGIC公式サイト',
      '月水木金 13:00-22:00 / 土日祝 10:00-20:00 / 火曜定休'
    ),
    (
      'rockgym:chiba:d-bouldering-plus-yachiyo',
      'ボルダー',
      'https://www.d-b-c.jp/yachiyo-news/facility',
      NULL,
      'https://www.d-b-c.jp/yachiyo-news/facility',
      'ディーボルダリングプラス八千代公式施設紹介',
      '平日 13:00-22:00 / 土日祝 10:00-19:00 / 火木定休'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = u.website_url,
  "instagram_url" = COALESCE(u.instagram_url, g."instagram_url"),
  "instagram_handle" = CASE
    WHEN u.instagram_url = 'https://www.instagram.com/energyurawa/' THEN 'energyurawa'
    ELSE g."instagram_handle"
  END,
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 14:45:00+09'::timestamptz,
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
      'energy-climbing-urawa',
      'エナジークライミングジム浦和店公式サイト',
      'https://energy-climbing.co.jp/urawa/',
      'official_site',
      'Official Energy Urawa page. Use for opening-change, route-set, lesson, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'energyurawa',
      'エナジークライミングジム浦和店公式Instagram',
      'https://www.instagram.com/energyurawa/',
      'official_instagram',
      'Linked from the official Energy Urawa page. Use public post summaries and source links only; do not republish captions or media.'
    ),
    (
      'web',
      'penguin-climb',
      'クライミングジムPenguin公式サイト',
      'https://penguin-climb.com/',
      'official_site',
      'Official Penguin site. Use for opening-change, event, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'jam-session-mitaka',
      'ジャムセッション三鷹公式サイト',
      'https://xn--xckbj6a9jra6a4gy403a4b6j.com/',
      'official_site',
      'Official Jam Session Mitaka site. Use for events, opening-change, recruitment, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'tsukuba-monkey-magic',
      'TSUKUBA MONKEY MAGIC公式サイト',
      'https://tsukuba-mm.jp/',
      'official_site',
      'Official Tsukuba Monkey Magic site. Use for events, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'd-bouldering-plus-yachiyo',
      'ディーボルダリングプラス八千代公式施設紹介',
      'https://www.d-b-c.jp/yachiyo-news/facility',
      'official_site',
      'Official D-Bouldering Plus Yachiyo page. Use for event, route-set, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
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
  '2026-05-11 14:45:00+09'::timestamptz,
  '2026-05-11 14:45:00+09'::timestamptz,
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
