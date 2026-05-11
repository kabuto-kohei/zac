-- Official NOBOROCK calendar refresh.
-- Checked on 2026-05-11 from public NOBOROCK store/calendar pages.
-- Zac stores structured summaries and source links only; it does not republish
-- images, videos, or full captions.

WITH checked_sources (platform, handle) AS (
  VALUES
    ('web', 'base-camp-edogawabashi'),
    ('web', 'westrock-climbing-event'),
    ('instagram', 'bpumptokyo'),
    ('instagram', 'noborock_ikebukuro'),
    ('instagram', 'noborock_takadanobaba'),
    ('instagram', 'noborock_machida'),
    ('instagram', 'noborock_omiya')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-11 10:45:00+09'::timestamptz,
  "updated_at" = now()
FROM checked_sources c
WHERE s."platform" = c.platform
  AND s."handle" = c.handle;

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
      '77777777-7777-4777-8777-000000000017',
      'rockgym:tokyo:noborock-takadanobaba',
      'notice',
      '高田馬場店 5/25 短縮営業',
      'NOBOROCK高田馬場店は貸切利用のため5/25 18:00 close予定。来店前に公式ページで最新状況を確認してください。',
      'NOBOROCK高田馬場店公式ページの営業時間変更告知に基づく短縮営業。公開側では要約と公式リンクのみを表示します。',
      '2026-05-25 18:00:00+09',
      '2026-05-25 21:00:00+09',
      '営業変更',
      'official_site',
      'https://noborock-climbing.com/program/takadanobaba/',
      'NOBOROCK 高田馬場店 公式サイト',
      '2026-05-11 00:00:00+09',
      '高田馬場18:00 close',
      '公式店舗ページで貸切利用に伴う2026年5月25日18:00 closeを確認。',
      0.90
    ),
    (
      '77777777-7777-4777-8777-000000000018',
      'rockgym:saitama:noborock-omiya',
      'route_set',
      '大宮店 5/31 ルートセット営業変更',
      'NOBOROCK大宮店は5/31 17:00 close、6/1 close、6/2 18:30 open予定。',
      'NOBOROCK大宮店公式ページのルートセット予定に基づく営業変更。公開側では要約と公式リンクのみを表示します。',
      '2026-05-31 17:00:00+09',
      '2026-06-02 18:30:00+09',
      '営業変更',
      'official_site',
      'https://noborock-climbing.com/program/omiya/',
      'NOBOROCK 大宮店 公式サイト',
      '2026-05-11 00:00:00+09',
      '大宮17:00 close',
      '公式店舗ページで5/31 17:00 close、6/1 close、6/2 18:30 openを確認。',
      0.90
    ),
    (
      '77777777-7777-4777-8777-000000000019',
      'rockgym:tokyo:noborock-takadanobaba',
      'route_set',
      '高田馬場店 5/31 ルートセット営業変更',
      'NOBOROCK高田馬場店は5/31 17:00 close、6/1 close、6/2 18:30 open予定。',
      'NOBOROCK高田馬場店公式ページのルートセット予定に基づく営業変更。公開側では要約と公式リンクのみを表示します。',
      '2026-05-31 17:00:00+09',
      '2026-06-02 18:30:00+09',
      '営業変更',
      'official_site',
      'https://noborock-climbing.com/program/takadanobaba/',
      'NOBOROCK 高田馬場店 公式サイト',
      '2026-05-11 00:00:00+09',
      '高田馬場17:00 close',
      '公式店舗ページで5/31 17:00 close、6/1 close、6/2 18:30 openを確認。',
      0.90
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
  '2026-05-11 10:45:00+09'::timestamptz,
  e.source_quote,
  e.source_raw_text,
  'summary_with_link',
  e.extraction_confidence::numeric,
  'approved',
  '2026-05-11 10:45:00+09'::timestamptz,
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
