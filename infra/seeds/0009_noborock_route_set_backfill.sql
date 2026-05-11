-- Official NOBOROCK route-set backfill.
-- Checked on 2026-05-11 from public NOBOROCK store pages and search-result
-- snippets. Zac stores structured summaries and source links only; it does not
-- republish images, videos, or full captions.

WITH checked_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'noborock-ikebukuro',
      'NOBOROCK 池袋店 公式サイト',
      'https://noborock-climbing.com/program/ikebukuro/',
      'official_site',
      'Official NOBOROCK store page. Use for route-set, event, opening-change, and private-booking discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'noborock-machida',
      'NOBOROCK 町田店 公式サイト',
      'https://noborock-climbing.com/program/machida/',
      'official_site',
      'Official NOBOROCK store page. Use for route-set, event, opening-change, and private-booking discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'noborock-mizonokuchi',
      'NOBOROCK 溝ノ口店 公式サイト',
      'https://noborock-climbing.com/program/mizonokuchi/',
      'official_site',
      'Official NOBOROCK store page. Use for route-set, event, opening-change, and private-booking discovery. Publish summaries and source links only.'
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
  '2026-05-11 11:20:00+09'::timestamptz,
  '2026-05-11 11:20:00+09'::timestamptz,
  'approved'
FROM checked_sources
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

WITH checked_instagram_sources (platform, handle) AS (
  VALUES
    ('instagram', 'noborock_ikebukuro'),
    ('instagram', 'noborock_machida')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-11 11:20:00+09'::timestamptz,
  "updated_at" = now()
FROM checked_instagram_sources c
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
  source_url,
  source_account,
  source_quote,
  source_raw_text,
  extraction_confidence
) AS (
  VALUES
    (
      '77777777-7777-4777-8777-000000000020',
      'rockgym:tokyo:noborock-ikebukuro',
      'route_set',
      '池袋店 5/6 ルートセット営業変更',
      'NOBOROCK池袋店は5/6 17:00 close、5/7 close、5/8 18:30 open予定。',
      'NOBOROCK池袋店公式ページのルートセット予定に基づく営業変更。セットに伴う営業時間影響のため、公開分類はセットとして扱います。',
      '2026-05-06 17:00:00+09',
      '2026-05-08 18:30:00+09',
      'https://noborock-climbing.com/program/ikebukuro/',
      'NOBOROCK 池袋店 公式サイト',
      '5/6(水) 17:00 close',
      '公式店舗ページで5/6 17:00 close、5/7 close、5/8 18:30 openのルートセット予定を確認。',
      0.86
    ),
    (
      '77777777-7777-4777-8777-000000000021',
      'rockgym:tokyo:noborock-machida',
      'route_set',
      '町田店 5/10 ルートセット営業変更',
      'NOBOROCK町田店は5/10 17:00 close、5/11 close、5/12 18:30 open予定。',
      'NOBOROCK町田店公式ページのルートセット予定に基づく営業変更。セットに伴う営業時間影響のため、公開分類はセットとして扱います。',
      '2026-05-10 17:00:00+09',
      '2026-05-12 18:30:00+09',
      'https://noborock-climbing.com/program/machida/',
      'NOBOROCK 町田店 公式サイト',
      '5/10(日) 17:00 close',
      '公式店舗ページで5/10 17:00 close、5/11 close、5/12 18:30 openのルートセット予定を確認。',
      0.86
    ),
    (
      '77777777-7777-4777-8777-000000000022',
      'rockgym:kanagawa:noborock-mizonokuchi',
      'route_set',
      '溝ノ口店 5/10 ルートセット営業変更',
      'NOBOROCK溝ノ口店は5/10 17:00 close、5/11 close、5/12 18:30 open予定。',
      'NOBOROCK溝ノ口店公式ページのルートセット予定に基づく営業変更。セットに伴う営業時間影響のため、公開分類はセットとして扱います。',
      '2026-05-10 17:00:00+09',
      '2026-05-12 18:30:00+09',
      'https://noborock-climbing.com/program/mizonokuchi/',
      'NOBOROCK 溝ノ口店 公式サイト',
      '5/10(日) 17:00 close',
      '公式店舗ページで5/10 17:00 close、5/11 close、5/12 18:30 openのルートセット予定を確認。',
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
  '営業変更',
  'official_site',
  e.source_url,
  e.source_account,
  '2026-05-11 00:00:00+09'::timestamptz,
  '2026-05-11 11:20:00+09'::timestamptz,
  e.source_quote,
  e.source_raw_text,
  'summary_with_link',
  e.extraction_confidence::numeric,
  'approved',
  '2026-05-11 11:20:00+09'::timestamptz,
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
