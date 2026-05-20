-- Manual quality cleanup for Admin event candidates.
-- Generated from pending review inspection on 2026-05-21.
-- Scope: draft/pending candidates only; public/scheduled rows are not rejected here.

UPDATE source_post_observations AS observation
SET
  review_status = 'ignored',
  decision_note = 'Rejected during candidate quality cleanup: insufficient event evidence for Admin review.',
  updated_at = now()
FROM events AS event
WHERE observation.source_url = event.source_url
  AND observation.review_status = 'event_candidate'
  AND event.id IN (
    'acf56a5b-ce18-4628-8179-8cf783cb8c11'::uuid,
    'f943e5ff-8978-44ca-9984-06eb62295c55'::uuid,
    'f7ad6231-4022-4c42-baa7-0f6d2414dcae'::uuid,
    'be9ec6bb-114d-4859-ac48-5562d5981dcf'::uuid,
    'de188cfc-9b4a-4cad-8425-7cd8c756ba61'::uuid,
    'd09c875f-0cfa-4cd1-b3b9-239b03303618'::uuid,
    '454ccd0f-bd11-4704-8fb1-10f80ad8736a'::uuid
  );

UPDATE events
SET
  review_status = 'rejected',
  reviewed_at = now(),
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id IN (
    'acf56a5b-ce18-4628-8179-8cf783cb8c11'::uuid,
    'f943e5ff-8978-44ca-9984-06eb62295c55'::uuid,
    'f7ad6231-4022-4c42-baa7-0f6d2414dcae'::uuid,
    'be9ec6bb-114d-4859-ac48-5562d5981dcf'::uuid,
    'de188cfc-9b4a-4cad-8425-7cd8c756ba61'::uuid,
    'd09c875f-0cfa-4cd1-b3b9-239b03303618'::uuid,
    '454ccd0f-bd11-4704-8fb1-10f80ad8736a'::uuid
  );

UPDATE events
SET
  title = 'NOBOROCK 溝ノ口店 ルートセット',
  summary = 'NOBOROCK 溝ノ口店でルートセット関連の予定があります。',
  description = 'NOBOROCK 溝ノ口店の公式情報で確認したルートセット関連の予定です。対象エリア、利用制限、再開時間は公式ページで確認してください。',
  capacity_text = '対象エリア・利用制限は公式情報で確認',
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id IN (
    '4b86f166-3eeb-4eeb-b9e6-f21396bc20fc'::uuid,
    '092bc62c-39d9-46fe-8e34-2daeeeeedca1'::uuid
  );

UPDATE events
SET
  category = 'route_set',
  title = 'NOBOROCK 町田店 ルートセット',
  summary = 'NOBOROCK 町田店でルートセット関連の予定があります。',
  description = 'NOBOROCK 町田店の公式情報で確認したルートセット関連の予定です。対象エリア、利用制限、再開時間は公式ページで確認してください。',
  capacity_text = '対象エリア・利用制限は公式情報で確認',
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id IN (
    '7872ca8a-bb0c-423b-a3b9-c6147614cd6e'::uuid,
    'a6bcf84b-2ea8-483a-9a94-27a97cd9c5e3'::uuid
  );
