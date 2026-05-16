-- Official Instagram post observations generated from instagramPostInspection.
-- Generated: 2026-05-16T12:02:31.550Z
-- Policy: store source links, short summaries, and short quotes only; do not store full captions or media.

WITH checked_sources (id, handle) AS (
  VALUES
    ('4afeef09-e278-4b3c-90e0-ef1c87150149'::uuid, 'climbing_gym_rockyn0429')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-16 12:02:31.550+00'::timestamptz,
  "updated_at" = now()
FROM checked_sources c
WHERE s."id" = c.id
  AND s."handle" = c.handle;

WITH observed_posts (
  event_source_id,
  handle,
  source_url,
  source_external_id,
  source_posted_at,
  classification,
  title,
  summary,
  starts_at,
  ends_at,
  source_quote,
  extraction_confidence,
  review_status,
  decision_note
) AS (
  VALUES
    ('4afeef09-e278-4b3c-90e0-ef1c87150149'::uuid, 'climbing_gym_rockyn0429', 'https://www.instagram.com/p/DKtnWbyRDB4/', 'DKtnWbyRDB4', '2025-06-10 07:58:19.000+00'::timestamptz, 'event', 'クライミングジムロッキンでは', 'クライミングジム RocKY’N（ロッキン）の公式Instagram投稿をイベントとして確認。公開UIに出す前に詳細確認が必要。', NULL::timestamptz, NULL::timestamptz, 'クライミングジムロッキンでは', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('4afeef09-e278-4b3c-90e0-ef1c87150149'::uuid, 'climbing_gym_rockyn0429', 'https://www.instagram.com/p/DPPtj6lkq04/', 'DPPtj6lkq04', '2025-09-30 23:52:20.000+00'::timestamptz, 'competition', 'ロッキンでは　キッズスクール生を', 'クライミングジム RocKY’N（ロッキン）の公式Instagram投稿をコンペ・大会として確認。公開UIに出す前に詳細確認が必要。', NULL::timestamptz, NULL::timestamptz, 'ロッキンでは　キッズスクール生を', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('4afeef09-e278-4b3c-90e0-ef1c87150149'::uuid, 'climbing_gym_rockyn0429', 'https://www.instagram.com/p/DYJAhb4Ei03/', 'DYJAhb4Ei03', '2026-05-10 02:07:57.000+00'::timestamptz, 'notice', '今　世界で話題のGPソール', 'クライミングジム RocKY’N（ロッキン）の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL::timestamptz, NULL::timestamptz, '今　世界で話題のGPソール', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.')
)
INSERT INTO "source_post_observations" (
  "event_source_id",
  "platform",
  "handle",
  "source_url",
  "source_external_id",
  "source_posted_at",
  "observed_at",
  "classification",
  "title",
  "summary",
  "starts_at",
  "ends_at",
  "source_quote",
  "extraction_confidence",
  "review_status",
  "decision_note"
)
SELECT
  event_source_id,
  'instagram',
  handle,
  source_url,
  source_external_id,
  source_posted_at::timestamptz,
  '2026-05-16 12:02:31.550+00'::timestamptz,
  classification,
  title,
  summary,
  starts_at::timestamptz,
  ends_at::timestamptz,
  source_quote,
  extraction_confidence::numeric,
  review_status,
  decision_note
FROM observed_posts
ON CONFLICT ("source_url") DO UPDATE SET
  "event_source_id" = EXCLUDED."event_source_id",
  "handle" = EXCLUDED."handle",
  "source_external_id" = EXCLUDED."source_external_id",
  "source_posted_at" = EXCLUDED."source_posted_at",
  "observed_at" = EXCLUDED."observed_at",
  "classification" = EXCLUDED."classification",
  "title" = EXCLUDED."title",
  "summary" = EXCLUDED."summary",
  "starts_at" = EXCLUDED."starts_at",
  "ends_at" = EXCLUDED."ends_at",
  "source_quote" = EXCLUDED."source_quote",
  "extraction_confidence" = EXCLUDED."extraction_confidence",
  "review_status" = EXCLUDED."review_status",
  "decision_note" = EXCLUDED."decision_note",
  "updated_at" = now(),
  "deleted_at" = NULL;
