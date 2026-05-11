-- Official Base Camp expansion pass.
-- Checked on 2026-05-11 from Base Camp official pages. Zac stores
-- structured summaries and source links only; it does not republish images,
-- videos, or full captions.

INSERT INTO "gyms" (
  "source_external_id",
  "name",
  "description",
  "address",
  "area",
  "website_url",
  "instagram_handle",
  "instagram_url",
  "phone",
  "opening_hours_text",
  "source_type",
  "source_url",
  "source_attribution",
  "source_verified_at",
  "source_policy",
  "status"
)
VALUES
  (
    'official:basecamp:shinbashi',
    'Urban Base Camp 新橋',
    '新橋駅・内幸町駅・御成門駅などから徒歩圏のBase Camp店舗。公式アクセスページで住所・営業時間・営業中の店舗情報を確認済み。',
    '東京都港区西新橋2-39-3 SVAX西新橋ビルディング地下1階',
    '港区',
    'https://b-camp.jp/shinbashi/',
    'basecamp_shinbashi',
    'https://www.instagram.com/basecamp_shinbashi/',
    '03-6459-0017',
    '平日 10:00-23:00 / 土日祝 10:00-21:00 / 定休日なし、臨時休業あり',
    'official_site',
    'https://b-camp.jp/shinbashi/access/',
    'Urban Base Camp 新橋 公式サイト',
    '2026-05-11 00:00:00+09',
    'summary_with_link',
    'published'
  ),
  (
    'official:basecamp:higashimurayama',
    'Boulder Park Base Camp 東村山',
    '東村山駅東口から徒歩圏のBase Camp店舗。公式アクセスページで住所・営業時間・営業中の店舗情報を確認済み。',
    '東京都東村山市本町2-7-1',
    '東村山市',
    'https://b-camp.jp/higashimurayama/',
    'basecamp_higashimurayama',
    'https://www.instagram.com/basecamp_higashimurayama/',
    '042-306-2628',
    '平日 14:00-22:30 / 土 10:00-21:00 / 日祝 10:00-20:00 / 定休日なし、臨時休業あり',
    'official_site',
    'https://b-camp.jp/higashimurayama/access/',
    'Boulder Park Base Camp 東村山 公式サイト',
    '2026-05-11 00:00:00+09',
    'summary_with_link',
    'published'
  )
ON CONFLICT ("source_external_id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "address" = EXCLUDED."address",
  "area" = EXCLUDED."area",
  "website_url" = EXCLUDED."website_url",
  "instagram_handle" = EXCLUDED."instagram_handle",
  "instagram_url" = EXCLUDED."instagram_url",
  "phone" = EXCLUDED."phone",
  "opening_hours_text" = EXCLUDED."opening_hours_text",
  "source_type" = EXCLUDED."source_type",
  "source_url" = EXCLUDED."source_url",
  "source_attribution" = EXCLUDED."source_attribution",
  "source_verified_at" = EXCLUDED."source_verified_at",
  "source_policy" = EXCLUDED."source_policy",
  "status" = EXCLUDED."status",
  "updated_at" = now(),
  "deleted_at" = NULL;

WITH verified_sources (
  handle,
  display_name,
  source_url,
  discovery_note
) AS (
  VALUES
    (
      'basecamp_shinbashi',
      'Urban Base Camp 新橋',
      'https://www.instagram.com/basecamp_shinbashi/',
      'Confirmed on the Urban Base Camp 新橋 official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'basecamp_higashimurayama',
      'Boulder Park Base Camp 東村山',
      'https://www.instagram.com/basecamp_higashimurayama/',
      'Confirmed on the Boulder Park Base Camp 東村山 official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
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
  'instagram',
  handle,
  display_name,
  source_url,
  'official_instagram',
  NULL,
  'official_site_verification',
  discovery_note,
  'summary_with_link',
  now(),
  now(),
  'approved'
FROM verified_sources
ON CONFLICT ("platform", "handle") DO UPDATE SET
  "display_name" = EXCLUDED."display_name",
  "source_url" = EXCLUDED."source_url",
  "source_type" = 'official_instagram',
  "relationship_source_handle" = NULL,
  "discovery_source" = EXCLUDED."discovery_source",
  "discovery_note" = EXCLUDED."discovery_note",
  "ingestion_policy" = EXCLUDED."ingestion_policy",
  "last_checked_at" = EXCLUDED."last_checked_at",
  "source_verified_at" = EXCLUDED."source_verified_at",
  "status" = 'approved',
  "updated_at" = now();

WITH route_set_event (
  id,
  gym_source_external_id,
  category,
  title,
  summary,
  description,
  starts_at,
  ends_at,
  capacity_text,
  source_type,
  source_url,
  source_account,
  source_published_at,
  source_quote,
  source_raw_text,
  extraction_confidence
) AS (
  VALUES
    (
      '77777777-7777-4777-8777-000000000016',
      'official:basecamp:shinbashi',
      'route_set',
      '5月全面ホールド替え',
      'Urban Base Camp 新橋の全面ホールド替え。5/17 18:00 close、5/18終日close、5/19 18:00 OPEN。',
      'Urban Base Camp 新橋公式ルート情報に基づく全面ホールド替え予定。来店前に公式ページで最新状況を確認してください。',
      '2026-05-17 18:00:00+09',
      '2026-05-19 18:00:00+09',
      '営業変更',
      'official_site',
      'https://b-camp.jp/shinbashi/',
      'Urban Base Camp 新橋 公式サイト',
      '2026-05-11 00:00:00+09',
      '5月全面ホールド替えのお知らせ',
      '公式トップのルート情報欄で5/17 18:00 close、5/18終日close、5/19 18:00 OPENの予定を確認。',
      0.88
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
  e.source_type,
  e.source_url,
  e.source_account,
  e.source_published_at::timestamptz,
  '2026-05-11 00:00:00+09'::timestamptz,
  e.source_quote,
  e.source_raw_text,
  'summary_with_link',
  e.extraction_confidence::numeric,
  'approved',
  '2026-05-11 00:00:00+09'::timestamptz,
  'scheduled',
  'public',
  '00000000-0000-4000-8000-000000000001'::uuid
FROM route_set_event e
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
