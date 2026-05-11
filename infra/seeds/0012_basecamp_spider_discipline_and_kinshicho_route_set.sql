-- Official Base Camp / SPIDER discipline refinement and route-set expansion.
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
  source_attribution,
  opening_hours_text
) AS (
  VALUES
    (
      'rockgym:tokyo:spider',
      'ボルダー',
      'https://climbing-spider.com/',
      NULL,
      NULL,
      'https://climbing-spider.com/shop/',
      'クライミングジムSPIDER 公式サイト',
      '平日 14:00-22:00 / 土日祝 6:00-19:00 / 定休日 不定期'
    ),
    (
      'rockgym:tokyo:base-camp-tokyo-edogawabashi',
      'ボルダー / リード',
      'https://b-camp.jp/edogawabashi/',
      'basecamp_edogawabashi',
      'https://www.instagram.com/basecamp_edogawabashi/',
      'https://b-camp.jp/edogawabashi/',
      'Base Camp Tokyo 江戸川橋 公式サイト',
      '平日 12:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:tokyo:base-camp-tokyo-kinshicho',
      'ボルダー / リード',
      'https://b-camp.jp/kinshicho/',
      'basecamp_kinshicho',
      'https://www.instagram.com/basecamp_kinshicho/',
      'https://b-camp.jp/kinshicho/',
      'Base Camp Tokyo 錦糸町 公式サイト',
      '平日 12:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:saitama:base-camp-hanno',
      'ボルダー',
      'https://b-camp.jp/hanno',
      'basecamp_hanno',
      'https://www.instagram.com/basecamp_hanno/',
      'https://b-camp.jp/hanno',
      'Boulder Park Base Camp 飯能店 公式サイト',
      '平日 12:30-22:30 / 土 10:00-21:00 / 日祝 10:00-20:00'
    ),
    (
      'rockgym:saitama:base-camp-iruma',
      'ボルダー / リード',
      'https://b-camp.jp/iruma',
      'basecamp_iruma',
      'https://www.instagram.com/basecamp_iruma/',
      'https://b-camp.jp/iruma/trial/',
      'Climb Park Base Camp 入間店 公式サイト',
      '平日 12:30-22:30 / 土 10:00-21:00 / 日祝 10:00-20:00'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = COALESCE(u.website_url, g."website_url"),
  "instagram_handle" = COALESCE(u.instagram_handle, g."instagram_handle"),
  "instagram_url" = COALESCE(u.instagram_url, g."instagram_url"),
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 12:45:00+09'::timestamptz,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_gym_updates u
WHERE g."source_external_id" = u.source_external_id
  AND g."deleted_at" IS NULL;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'base-camp-tokyo-edogawabashi',
      'Base Camp Tokyo 江戸川橋 公式サイト',
      'https://b-camp.jp/edogawabashi/',
      'official_site',
      'Official Base Camp Tokyo 江戸川橋 page. Use for route-set, construction, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'base-camp-tokyo-kinshicho',
      'Base Camp Tokyo 錦糸町 公式サイト',
      'https://b-camp.jp/kinshicho/',
      'official_site',
      'Official Base Camp Tokyo 錦糸町 page. Use for route-set, construction, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'base-camp-hanno',
      'Boulder Park Base Camp 飯能店 公式サイト',
      'https://b-camp.jp/hanno',
      'official_site',
      'Official Boulder Park Base Camp 飯能店 page. Use for route-set, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'base-camp-iruma',
      'Climb Park Base Camp 入間店 公式サイト',
      'https://b-camp.jp/iruma',
      'official_site',
      'Official Climb Park Base Camp 入間店 page. Use for route-set, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'climbing-spider',
      'クライミングジムSPIDER 公式サイト',
      'https://climbing-spider.com/shop/',
      'official_site',
      'Official SPIDER access and shop page. Use for opening-change and gym information discovery. Publish summaries and source links only.'
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
  '2026-05-11 12:45:00+09'::timestamptz,
  '2026-05-11 12:45:00+09'::timestamptz,
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
      '77777777-7777-4777-8777-000000000026',
      'rockgym:tokyo:base-camp-tokyo-kinshicho',
      'route_set',
      '錦糸町 リードエリア Leaning Tower セット',
      'Base Camp Tokyo 錦糸町は5/27から5/29にリードエリアLeaning Towerのリニューアルセット予定。',
      'Base Camp Tokyo 錦糸町公式ルート情報に基づくリードエリアのセット予定。来店前に公式ページで最新状況を確認してください。',
      '2026-05-27 12:00:00+09',
      '2026-05-29 21:00:00+09',
      '公式で確認',
      'https://b-camp.jp/kinshicho/',
      'Base Camp Tokyo 錦糸町 公式サイト',
      '2026-05-11 00:00:00+09',
      'リードエリア「Leaning Tower」リニューアルセット',
      '公式ページのルート情報欄で5/27-29のリードエリアセットを確認。',
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
  '2026-05-11 12:45:00+09'::timestamptz,
  e.source_quote,
  e.source_raw_text,
  'summary_with_link',
  e.extraction_confidence::numeric,
  'approved',
  '2026-05-11 12:45:00+09'::timestamptz,
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
