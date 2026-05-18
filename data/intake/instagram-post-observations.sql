-- Official Instagram browser roller observations.
-- Generated: 2026-05-18T15:16:43.178Z
-- Policy: store source links, short summaries, and short quotes only; do not store passwords, cookies, full captions, images, videos, comments, DMs, or stories.

WITH checked_sources (id, handle) AS (
  VALUES
    ('7061a581-458e-485a-8a88-b9c9adf269e1'::uuid, 'climb.vortex'),
    ('ae3bf68c-ef39-4336-8496-08ad3618b804'::uuid, 'basecamp_shinjuku'),
    ('1c927437-7710-4318-9d77-e0e2104c9dc1'::uuid, 'bpump_ogikubo'),
    ('86b3a08a-8bae-454f-9eb0-241adab7b8ec'::uuid, 'bpumptokyo'),
    ('7046b655-8cd4-4087-a233-db5bb52aa729'::uuid, 'energyurawa'),
    ('b2e46ff9-fa74-4413-9269-457f4a24775f'::uuid, 'noborock_takadanobaba'),
    ('8dd8d0fc-d295-40af-bd1c-a676b1d8ea4a'::uuid, 'be_born_climbing_gym'),
    ('05a589fb-d85c-4a7a-8a11-cd99d5a0f625'::uuid, 'bpumpyokohama'),
    ('924eff10-8759-4291-8975-8c9afb0f9ace'::uuid, 'exciting_sancha'),
    ('29729a2e-530f-4bd6-a77f-f3d9a586f18e'::uuid, 'headrockcg'),
    ('130a0146-a8f8-4f45-bb5d-8f7680b3cc24'::uuid, 'okkurock'),
    ('980b0f60-2f81-4f01-b602-b141409f808e'::uuid, 'penguinclimb'),
    ('96041608-b9fa-4d73-96b0-2d309eed77cc'::uuid, '310_avue'),
    ('1e1c5950-4893-4760-bb9c-d11891dc09e5'::uuid, 'b.g.funny'),
    ('230beec0-b638-4d8d-acb9-b0d6c2dd6750'::uuid, 'bouldering_gym_share'),
    ('1f04c6db-0b8f-4dc0-94a4-9416dfa234fb'::uuid, 'climbing_gym_cozy'),
    ('15beb98e-1f8b-40b2-badc-791514039786'::uuid, 'climbinggym_hutte'),
    ('97cfd6d2-9988-4777-ae47-c1511d4816f4'::uuid, 'climbinggymflash'),
    ('33933782-2ad8-4000-afae-772c5f05ecce'::uuid, 'climbrise2016'),
    ('86e485c9-55ea-48ea-b4bc-be876064ff75'::uuid, 'quartier_de_roche'),
    ('02d44afc-a542-4d6e-8e36-042215e7a55e'::uuid, 'rhinoandbird_nishinippori'),
    ('8e81426f-f0ee-45a1-ac86-6625148f8e1d'::uuid, 'rockbeans.insta'),
    ('f5d7c62a-37fb-4253-ab25-f7135be773db'::uuid, 'sloth.gym'),
    ('f328ae42-2dd0-45da-b667-62b6c5a479ef'::uuid, 'dbouldering_tsudanuma')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-18 15:16:43.178+00'::timestamptz,
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
    ('f328ae42-2dd0-45da-b667-62b6c5a479ef'::uuid, 'dbouldering_tsudanuma', 'https://www.instagram.com/reel/DVaJVOVE2jJ/', 'DVaJVOVE2jJ', NULL::timestamptz, 'notice', 'ディーボルダリングプラス津田沼 dbouldering_tsudanuma', 'ディーボルダリングプラス津田沼の公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, 'dbouldering_tsudanuma', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.')
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
  '2026-05-18 15:16:43.178+00'::timestamptz,
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
ON CONFLICT ("platform", "source_external_id") WHERE "source_external_id" IS NOT NULL DO UPDATE SET
  "event_source_id" = EXCLUDED."event_source_id",
  "handle" = EXCLUDED."handle",
  "source_url" = EXCLUDED."source_url",
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
