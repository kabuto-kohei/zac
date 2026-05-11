-- Closure-queue official active sync, batch 3.
-- Checked on 2026-05-11 from public official pages.
-- Keep gyms published when official pages show active facility information.
-- Do not infer closure from missing social/account data.

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
      'rockgym:tokyo:miyake-recreation-center',
      'ボルダー / リード',
      'https://www.vill.miyake.tokyo.jp/recreation/shisetsu.html',
      NULL,
      'https://www.vill.miyake.tokyo.jp/recreation/shisetsu.html',
      '三宅村役場 施設情報',
      '平日 13:00-20:00 / 土日祝 10:00-17:00 / 木曜休館'
    ),
    (
      'rockgym:saitama:walrus',
      'クライミング',
      'https://www.walrus.co.jp/',
      'https://www.instagram.com/climbinggym_walrus/',
      'https://www.walrus.co.jp/',
      'Climbing Gym Walrus公式サイト',
      '月-金 13:00-22:00 / 土日祝 10:00-20:00'
    ),
    (
      'rockgym:tokyo:exciting-sancha',
      'ボルダー',
      'https://exciting-sancha.com/about/',
      NULL,
      'https://exciting-sancha.com/about/',
      'スポーツクライミングジム エキサイティング三茶公式サイト',
      '平日 13:00-22:00 / 土日祝 10:00-20:00 / 不定休'
    ),
    (
      'rockgym:gunma:ranbo',
      'ボルダー',
      'https://ranbo.jp/',
      'https://www.instagram.com/climbing_gym_ranbo/',
      'https://ranbo.jp/',
      'クライミングジムランボ公式サイト',
      '平日 15:00-23:00 / 土日祝 10:00-20:00 / 不定休'
    ),
    (
      'rockgym:gunma:wall-street',
      'ボルダー / リード',
      'https://wallst.jp/',
      'https://www.instagram.com/climbinggym_wallstreet/',
      'https://wallst.jp/',
      'クライミングジム・ウォールストリート公式サイト',
      '月-金 14:00-23:00 / 土 12:00-22:00 / 日祝 10:00-20:00'
    ),
    (
      'rockgym:tochigi:prob',
      'ボルダー',
      'https://prob.pupu.jp/',
      NULL,
      'https://prob.pupu.jp/',
      'ClimbingGym PROB公式サイト',
      '平日 15:30-22:30 / 土日祝 12:00-20:00 / 月曜定休'
    ),
    (
      'rockgym:tokyo:madrock',
      'ボルダー',
      'https://www.bouldering-climbinggym-madrock.com/',
      'https://www.instagram.com/madrock.cg.jp_online/',
      'https://www.bouldering-climbinggym-madrock.com/',
      'クライミングジム マッドロック公式サイト',
      '平日 14:00-22:00 / 土 12:00-22:00 / 日祝 12:00-20:00'
    ),
    (
      'rockgym:tokyo:d-bouldering-hachioji',
      'ボルダー',
      'https://www.d-b-c.jp/top/hachioji/',
      NULL,
      'https://www.d-b-c.jp/top/hachioji/',
      'D.Bouldering Hachioji公式サイト',
      '平日 10:00-22:00 / 土日祝 11:30-21:00 / 年中無休'
    ),
    (
      'rockgym:tokyo:d-bouldering-plus-nishi-hachioji',
      'ボルダー',
      'https://www.d-b-c.jp/top/nishihachioji/',
      NULL,
      'https://www.d-b-c.jp/top/nishihachioji/',
      'ディーボルダリングプラス西八王子公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-23:00'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = u.website_url,
  "instagram_url" = COALESCE(u.instagram_url, g."instagram_url"),
  "instagram_handle" = CASE
    WHEN u.instagram_url = 'https://www.instagram.com/climbinggym_walrus/' THEN 'climbinggym_walrus'
    WHEN u.instagram_url = 'https://www.instagram.com/climbing_gym_ranbo/' THEN 'climbing_gym_ranbo'
    WHEN u.instagram_url = 'https://www.instagram.com/climbinggym_wallstreet/' THEN 'climbinggym_wallstreet'
    WHEN u.instagram_url = 'https://www.instagram.com/madrock.cg.jp_online/' THEN 'madrock.cg.jp_online'
    ELSE g."instagram_handle"
  END,
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 16:25:00+09'::timestamptz,
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
      'miyake-recreation-center',
      '三宅村レクリエーションセンター公式ページ',
      'https://www.vill.miyake.tokyo.jp/recreation/shisetsu.html',
      'official_site',
      'Official Miyake Village facility page. Use for facility status, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'climbing-gym-walrus',
      'Climbing Gym Walrus公式サイト',
      'https://www.walrus.co.jp/',
      'official_site',
      'Official Walrus site. Use for facility status, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'climbinggym_walrus',
      'Climbing Gym Walrus公式Instagram',
      'https://www.instagram.com/climbinggym_walrus/',
      'official_instagram',
      'Linked from official Walrus site/directory evidence. Use public post summaries and source links only; do not republish captions or media.'
    ),
    (
      'web',
      'exciting-sancha',
      'スポーツクライミングジム エキサイティング三茶公式サイト',
      'https://exciting-sancha.com/about/',
      'official_site',
      'Official Exciting Sancha store page. Use for opening-change, private-booking, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'climbing-gym-ranbo',
      'クライミングジムランボ公式サイト',
      'https://ranbo.jp/',
      'official_site',
      'Official RANBO site. Use for events, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'climbing_gym_ranbo',
      'クライミングジムランボ公式Instagram',
      'https://www.instagram.com/climbing_gym_ranbo/',
      'official_instagram',
      'Linked from official RANBO site. Use public post summaries and source links only; do not republish captions or media.'
    ),
    (
      'web',
      'climbing-gym-wall-street',
      'クライミングジム・ウォールストリート公式サイト',
      'https://wallst.jp/',
      'official_site',
      'Official Wall Street site. Use for competitions, lessons, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'climbinggym_wallstreet',
      'クライミングジム・ウォールストリート公式Instagram',
      'https://www.instagram.com/climbinggym_wallstreet/',
      'official_instagram',
      'Linked from official Wall Street site. Use public post summaries and source links only; do not republish captions or media.'
    ),
    (
      'web',
      'climbinggym-prob',
      'ClimbingGym PROB公式サイト',
      'https://prob.pupu.jp/',
      'official_site',
      'Official PROB site. Use for events, route-set/opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'madrock-climbing-gym',
      'クライミングジム マッドロック公式サイト',
      'https://www.bouldering-climbinggym-madrock.com/',
      'official_site',
      'Official Madrock site. Use for TAMAX, route-set, classes, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'madrock.cg.jp_online',
      'クライミングジム マッドロック公式Instagram',
      'https://www.instagram.com/madrock.cg.jp_online/',
      'official_instagram',
      'Linked from official Madrock site. Use public post summaries and source links only; do not republish captions or media.'
    ),
    (
      'web',
      'd-bouldering-hachioji',
      'D.Bouldering Hachioji公式サイト',
      'https://www.d-b-c.jp/top/hachioji/',
      'official_site',
      'Official D.Bouldering Hachioji site. Use for events, opening-change, route-set, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'd-bouldering-plus-nishi-hachioji',
      'ディーボルダリングプラス西八王子公式サイト',
      'https://www.d-b-c.jp/top/nishihachioji/',
      'official_site',
      'Official D.Bouldering Plus Nishi-Hachioji site. Use for events, opening-change, route-set, and closure/rename rechecks. Publish summaries and source links only.'
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
  '2026-05-11 16:25:00+09'::timestamptz,
  '2026-05-11 16:25:00+09'::timestamptz,
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

WITH route_set_events (
  id,
  gym_source_external_id,
  category,
  title,
  summary,
  description,
  starts_at,
  ends_at,
  capacity_text,
  source_url,
  source_account,
  source_published_at,
  source_quote,
  source_raw_text,
  extraction_confidence
) AS (
  VALUES
    (
      '77777777-7777-4777-8777-000000000028',
      'rockgym:tokyo:madrock',
      'route_set',
      '5/24-26 次回セット休業',
      'マッドロックは5/24から5/26までセット作業のため休業予定。',
      'クライミングジム マッドロック公式サイトのROUTESETTING欄に基づくセット休業。来店前に公式ページで最新状況を確認してください。',
      '2026-05-24 00:00:00+09',
      '2026-05-26 23:59:00+09',
      'セット休業',
      'https://www.bouldering-climbinggym-madrock.com/',
      'クライミングジム マッドロック公式サイト',
      '2026-05-11 00:00:00+09',
      '2026/5/24(日)、25(月)、26(火)',
      '公式サイトのROUTESETTING欄で5/24-26の次回セット日程と休業予定を確認。',
      0.86
    )
)
INSERT INTO "events" (
  "id",
  "gym_id",
  "category",
  "title",
  "summary",
  "description",
  "starts_at",
  "ends_at",
  "capacity_text",
  "source_type",
  "source_url",
  "source_account",
  "source_published_at",
  "source_fetched_at",
  "source_quote",
  "source_raw_text",
  "source_policy",
  "extraction_confidence",
  "review_status",
  "reviewed_at",
  "status",
  "visibility",
  "created_by"
)
SELECT
  e.id::uuid,
  g.id,
  e.category,
  e.title,
  e.summary,
  e.description,
  e.starts_at::timestamptz,
  e.ends_at::timestamptz,
  e.capacity_text,
  'official_site',
  e.source_url,
  e.source_account,
  e.source_published_at::timestamptz,
  '2026-05-11 16:25:00+09'::timestamptz,
  e.source_quote,
  e.source_raw_text,
  'summary_with_link',
  e.extraction_confidence::numeric,
  'approved',
  '2026-05-11 16:25:00+09'::timestamptz,
  'scheduled',
  'public',
  '00000000-0000-4000-8000-000000000001'::uuid
FROM route_set_events e
JOIN "gyms" g ON g."source_external_id" = e.gym_source_external_id
ON CONFLICT ("id") DO UPDATE SET
  "gym_id" = EXCLUDED."gym_id",
  "category" = EXCLUDED."category",
  "title" = EXCLUDED."title",
  "summary" = EXCLUDED."summary",
  "description" = EXCLUDED."description",
  "starts_at" = EXCLUDED."starts_at",
  "ends_at" = EXCLUDED."ends_at",
  "capacity_text" = EXCLUDED."capacity_text",
  "source_type" = EXCLUDED."source_type",
  "source_url" = EXCLUDED."source_url",
  "source_account" = EXCLUDED."source_account",
  "source_published_at" = EXCLUDED."source_published_at",
  "source_fetched_at" = EXCLUDED."source_fetched_at",
  "source_quote" = EXCLUDED."source_quote",
  "source_raw_text" = EXCLUDED."source_raw_text",
  "source_policy" = EXCLUDED."source_policy",
  "extraction_confidence" = EXCLUDED."extraction_confidence",
  "review_status" = EXCLUDED."review_status",
  "reviewed_at" = EXCLUDED."reviewed_at",
  "status" = EXCLUDED."status",
  "visibility" = EXCLUDED."visibility",
  "updated_at" = now(),
  "deleted_at" = NULL;
