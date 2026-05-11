-- Official B-PUMP OGIKUBO route-set refresh.
-- Checked on 2026-05-11 from the public official PUMP OGIKUBO page.
-- Zac stores structured summaries and source links only.

WITH checked_sources (platform, handle) AS (
  VALUES
    ('web', 'b-pump-ogikubo'),
    ('instagram', 'bpump_ogikubo')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-11 13:55:00+09'::timestamptz,
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
  source_url,
  source_account,
  source_published_at,
  source_quote,
  source_raw_text,
  extraction_confidence
) AS (
  VALUES
    (
      '77777777-7777-4777-8777-000000000027',
      'rockgym:tokyo:b-pump-ogikubo',
      'route_set',
      '5月 COMPETITION WALL セット',
      'B-PUMP OGIKUBOは5/10 17:00からCOMPETITION WALLのホールド外し、5/11にルートセット予定。',
      'B-PUMP OGIKUBO公式ページの5月ROUTESET INFORMATIONに基づくセット予定。来店前に公式ページで最新状況を確認してください。',
      '2026-05-10 17:00:00+09',
      '2026-05-11 22:00:00+09',
      '営業変更',
      'https://pump-climbing.com/gym/bpump/',
      'B-PUMP OGIKUBO 公式サイト',
      '2026-04-24 00:00:00+09',
      '5月10日(土)17:00よりホールド外し / 5月11日(日)ルートセット',
      '公式ページの5月ROUTESET INFORMATIONでCOMPETITION WALLの5/10ホールド外しと5/11ルートセット予定を確認。',
      0.78
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
  '2026-05-11 13:55:00+09'::timestamptz,
  e.source_quote,
  e.source_raw_text,
  'summary_with_link',
  e.extraction_confidence::numeric,
  'approved',
  '2026-05-11 13:55:00+09'::timestamptz,
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
