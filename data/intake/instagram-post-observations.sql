-- Official Instagram post observations generated from instagramPostInspection.
-- Generated: 2026-05-13T08:05:00.374Z
-- Policy: store source links, short summaries, and short quotes only; do not store full captions or media.

WITH checked_sources (id, handle) AS (
  VALUES
    ('5c60bf4c-316b-4c7a-b8f8-19cf9fbf2821'::uuid, 'dbouldering_soga'),
    ('1c927437-7710-4318-9d77-e0e2104c9dc1'::uuid, 'bpump_ogikubo'),
    ('682b12a0-d629-4aa7-9bdc-c26b6ad3868a'::uuid, 'basecamp_kinshicho')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-13 08:05:00.374+00'::timestamptz,
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
    ('5c60bf4c-316b-4c7a-b8f8-19cf9fbf2821'::uuid, 'dbouldering_soga', 'https://www.instagram.com/p/DXrCdNQD5PJ/', 'DXrCdNQD5PJ', '2026-04-28 11:28:18.000+00'::timestamptz, 'route_set', '.', 'D.Bouldering Plus 蘇我公式Instagramの公式Instagram投稿をセット替えとして確認。 日付候補は2026/05/07。公開UIに出す前に詳細確認が必要。', '2026-05-07 01:00:00.000+00'::timestamptz, '2026-05-08 12:00:00.000+00'::timestamptz, '.', 0.72::numeric, 'pending', 'Potential calendar candidate from official Instagram; keep pending until human/source cross-check.'),
    ('5c60bf4c-316b-4c7a-b8f8-19cf9fbf2821'::uuid, 'dbouldering_soga', 'https://www.instagram.com/p/DVk58TxD90z/', 'DVk58TxD90z', '2026-03-07 08:32:56.000+00'::timestamptz, 'event', '.', 'D.Bouldering Plus 蘇我公式Instagramの公式Instagram投稿をイベントとして確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '.', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('5c60bf4c-316b-4c7a-b8f8-19cf9fbf2821'::uuid, 'dbouldering_soga', 'https://www.instagram.com/p/DYJAeESjy-l/', 'DYJAeESjy-l', '2026-05-10 02:14:18.000+00'::timestamptz, 'notice', '.', 'D.Bouldering Plus 蘇我公式Instagramの公式Instagram投稿を一般告知として確認。 日付候補は2026/05/11。公開UIに出す前に詳細確認が必要。', '2026-05-11 01:00:00.000+00'::timestamptz, '2026-05-11 02:00:00.000+00'::timestamptz, '.', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('1c927437-7710-4318-9d77-e0e2104c9dc1'::uuid, 'bpump_ogikubo', 'https://www.instagram.com/p/DXy0HKeElJ0/', 'DXy0HKeElJ0', '2026-05-01 11:14:24.000+00'::timestamptz, 'competition', '.', 'B-PUMP OGIKUBOの公式Instagram投稿をコンペ・大会として確認。 日付候補は2026/05/10。公開UIに出す前に詳細確認が必要。', '2026-05-10 08:00:00.000+00'::timestamptz, '2026-05-11 12:00:00.000+00'::timestamptz, '.', 0.72::numeric, 'pending', 'Potential calendar candidate from official Instagram; keep pending until human/source cross-check.'),
    ('1c927437-7710-4318-9d77-e0e2104c9dc1'::uuid, 'bpump_ogikubo', 'https://www.instagram.com/p/DXHComvEz5I/', 'DXHComvEz5I', '2026-04-14 11:15:09.000+00'::timestamptz, 'competition', '開催発表', 'B-PUMP OGIKUBOの公式Instagram投稿をコンペ・大会として確認。 日付候補は2026/06/06。公開UIに出す前に詳細確認が必要。', '2026-06-06 01:00:00.000+00'::timestamptz, '2026-06-06 02:00:00.000+00'::timestamptz, '【開催発表】', 0.72::numeric, 'pending', 'Potential calendar candidate from official Instagram; keep pending until human/source cross-check.'),
    ('1c927437-7710-4318-9d77-e0e2104c9dc1'::uuid, 'bpump_ogikubo', 'https://www.instagram.com/p/DYMhcMQEr9t/', 'DYMhcMQEr9t', '2026-05-11 10:51:15.000+00'::timestamptz, 'competition', '.', 'B-PUMP OGIKUBOの公式Instagram投稿をコンペ・大会として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '.', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('682b12a0-d629-4aa7-9bdc-c26b6ad3868a'::uuid, 'basecamp_kinshicho', 'https://www.instagram.com/p/DYOhwiosqjd/', 'DYOhwiosqjd', '2026-05-12 05:37:55.000+00'::timestamptz, 'notice', '🎥CHECK THE MOVE 🎥', 'Base Camp Tokyo 錦糸町の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '🎥CHECK THE MOVE 🎥', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('682b12a0-d629-4aa7-9bdc-c26b6ad3868a'::uuid, 'basecamp_kinshicho', 'https://www.instagram.com/p/DYMH2-PlF8C/', 'DYMH2-PlF8C', '2026-05-11 07:07:43.000+00'::timestamptz, 'notice', '🎥 CHECK THE MOVE 🎥', 'Base Camp Tokyo 錦糸町の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '🎥 CHECK THE MOVE 🎥', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('682b12a0-d629-4aa7-9bdc-c26b6ad3868a'::uuid, 'basecamp_kinshicho', 'https://www.instagram.com/p/DYG-6SIs_d8/', 'DYG-6SIs_d8', '2026-05-09 07:15:36.000+00'::timestamptz, 'notice', '🎥CHECK THE MOVE 🎥', 'Base Camp Tokyo 錦糸町の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '🎥CHECK THE MOVE 🎥', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.')
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
  source_posted_at,
  '2026-05-13 08:05:00.374+00'::timestamptz,
  classification,
  title,
  summary,
  starts_at,
  ends_at,
  source_quote,
  extraction_confidence,
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
