-- Official discipline and route-set expansion.
-- Checked on 2026-05-11 from official gym pages. Zac stores structured
-- summaries and source links only; it does not republish images, videos, or
-- full captions.

WITH official_gym_updates (
  source_external_id,
  disciplines,
  website_url,
  instagram_handle,
  instagram_url,
  source_url,
  source_attribution
) AS (
  VALUES
    (
      'rockgym:tokyo:b-pump-tokyo-akihabara',
      'ボルダー',
      'https://pump-climbing.com/gym/akiba/',
      'bpumptokyo',
      'https://www.instagram.com/bpumptokyo/',
      'https://pump-climbing.com/gym/akiba/',
      'B-PUMP TOKYO 秋葉原 公式サイト'
    ),
    (
      'rockgym:tokyo:b-pump-ogikubo',
      'ボルダー',
      'https://pump-climbing.com/gym/bpump/',
      'bpump_ogikubo',
      'https://www.instagram.com/bpump_ogikubo/',
      'https://pump-climbing.com/gym/bpump/',
      'B-PUMP OGIKUBO 公式サイト'
    ),
    (
      'rockgym:kanagawa:b-pump-yokohama',
      'ボルダー',
      'https://pump-climbing.com/gym/bpump2/',
      NULL,
      NULL,
      'https://pump-climbing.com/gym/bpump2/',
      'B-PUMP YOKOHAMA 公式サイト'
    ),
    (
      'rockgym:tokyo:prime-climbing',
      'ボルダー',
      'https://primeclimbing.com/',
      NULL,
      'https://www.instagram.com/primeclimbing/',
      'https://primeclimbing.com/',
      'PRIME CLIMBING 公式サイト'
    ),
    (
      'rockgym:tokyo:urban-base-camp-shinjuku',
      'ボルダー',
      'https://b-camp.jp/shinjuku/',
      'basecamp_shinjuku',
      'https://www.instagram.com/basecamp_shinjuku/',
      'https://b-camp.jp/shinjuku/',
      'Urban Base Camp 新宿 公式サイト'
    ),
    (
      'official:basecamp:shinbashi',
      'ボルダー',
      'https://b-camp.jp/shinbashi/',
      'basecamp_shinbashi',
      'https://www.instagram.com/basecamp_shinbashi/',
      'https://b-camp.jp/shinbashi/',
      'Urban Base Camp 新橋 公式サイト'
    ),
    (
      'official:basecamp:higashimurayama',
      'ボルダー',
      'https://b-camp.jp/higashimurayama/',
      'basecamp_higashimurayama',
      'https://www.instagram.com/basecamp_higashimurayama/',
      'https://b-camp.jp/higashimurayama/',
      'Boulder Park Base Camp 東村山 公式サイト'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = COALESCE(u.website_url, g."website_url"),
  "instagram_handle" = COALESCE(u.instagram_handle, g."instagram_handle"),
  "instagram_url" = COALESCE(u.instagram_url, g."instagram_url"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 12:05:00+09'::timestamptz,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_gym_updates u
WHERE g."source_external_id" = u.source_external_id
  AND g."deleted_at" IS NULL;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'b-pump-ogikubo',
      'B-PUMP OGIKUBO 公式サイト',
      'https://pump-climbing.com/gym/bpump/',
      'official_site',
      'Official PUMP gym page. Use for route-set, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'b-pump-yokohama',
      'B-PUMP YOKOHAMA 公式サイト',
      'https://pump-climbing.com/gym/bpump2/',
      'official_site',
      'Official PUMP gym page. Use for route-set, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'urban-base-camp-shinjuku',
      'Urban Base Camp 新宿 公式サイト',
      'https://b-camp.jp/shinjuku/',
      'official_site',
      'Official Base Camp gym page. Use for route-set, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'base-camp-higashimurayama',
      'Boulder Park Base Camp 東村山 公式サイト',
      'https://b-camp.jp/higashimurayama/',
      'official_site',
      'Official Base Camp gym page. Use for route-set, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'bpump_ogikubo',
      'B-PUMP OGIKUBO',
      'https://www.instagram.com/bpump_ogikubo/',
      'official_instagram',
      'Confirmed from the official PUMP OGIKUBO page embedded Instagram account. Publish summaries and source links only.'
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
  '2026-05-11 12:05:00+09'::timestamptz,
  '2026-05-11 12:05:00+09'::timestamptz,
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
      '77777777-7777-4777-8777-000000000023',
      'rockgym:tokyo:urban-base-camp-shinjuku',
      'route_set',
      '新宿店 King Cobra-SunnySide セット',
      'Urban Base Camp 新宿は5/11から5/12にKing Cobra-SunnySideのセット予定。',
      'Urban Base Camp 新宿公式ルート情報に基づくセット予定。来店前に公式ページで最新状況を確認してください。',
      '2026-05-11 10:00:00+09',
      '2026-05-12 23:00:00+09',
      '公式で確認',
      'https://b-camp.jp/shinjuku/route/',
      'Urban Base Camp 新宿 公式サイト',
      '2026-04-30 00:00:00+09',
      'King Cobra～SunnySide 5/11(月)～12(火)',
      '公式ルート情報で5月のセットスケジュールを確認。',
      0.86
    ),
    (
      '77777777-7777-4777-8777-000000000024',
      'rockgym:tokyo:urban-base-camp-shinjuku',
      'route_set',
      '新宿店 YosemiteFall-CandyLand セット',
      'Urban Base Camp 新宿は5/25から5/26にYosemiteFall-CandyLandのセット予定。',
      'Urban Base Camp 新宿公式ルート情報に基づくセット予定。来店前に公式ページで最新状況を確認してください。',
      '2026-05-25 10:00:00+09',
      '2026-05-26 23:00:00+09',
      '公式で確認',
      'https://b-camp.jp/shinjuku/route/',
      'Urban Base Camp 新宿 公式サイト',
      '2026-04-30 00:00:00+09',
      'YosemiteFall～CandyLand 5/25(月)～26(火)',
      '公式ルート情報で5月のセットスケジュールを確認。',
      0.86
    ),
    (
      '77777777-7777-4777-8777-000000000025',
      'rockgym:kanagawa:b-pump-yokohama',
      'route_set',
      'YOKOHAMA 2F All Change',
      'B-PUMP YOKOHAMAは5/30から5/31に2F All Change予定。',
      'B-PUMP YOKOHAMA公式ページのRoutes情報に基づくセット予定。来店前に公式ページで最新状況を確認してください。',
      '2026-05-30 11:00:00+09',
      '2026-05-31 21:00:00+09',
      '公式で確認',
      'https://pump-climbing.com/gym/bpump2/',
      'B-PUMP YOKOHAMA 公式サイト',
      '2026-05-11 00:00:00+09',
      'Next 5/30-31 2F All Change',
      '公式ページのRoutes欄で5/30-31の2F All Changeを確認。',
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
  '2026-05-11 12:05:00+09'::timestamptz,
  e.source_quote,
  e.source_raw_text,
  'summary_with_link',
  e.extraction_confidence::numeric,
  'approved',
  '2026-05-11 12:05:00+09'::timestamptz,
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
