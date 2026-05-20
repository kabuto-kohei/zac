-- Manual title polish for remaining Admin event candidates.
-- Generated from pending review inspection on 2026-05-21.
-- Scope: draft/pending candidates only.

UPDATE events
SET
  title = 'NOBOROCK 池袋店 6/7 ルートセット前クローズ',
  summary = 'NOBOROCK 池袋店でルートセット前の営業時間変更があります。',
  description = 'NOBOROCK 池袋店の公式情報で確認したルートセット前の営業時間変更です。対象エリア、利用制限、再開時間は公式ページで確認してください。',
  capacity_text = '対象エリア・利用制限は公式情報で確認',
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id = 'bebb196c-3ee7-44e8-85c8-cfb55a0c6787'::uuid;

UPDATE events
SET
  title = 'NOBOROCK 池袋店 6/8 ルートセット日クローズ',
  summary = 'NOBOROCK 池袋店でルートセット日のクローズ予定があります。',
  description = 'NOBOROCK 池袋店の公式情報で確認したルートセット日のクローズ予定です。対象エリア、利用制限、再開時間は公式ページで確認してください。',
  capacity_text = '対象エリア・利用制限は公式情報で確認',
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id = 'bd76a3ec-5e01-4511-9da4-d3f102ba7565'::uuid;

UPDATE events
SET
  title = 'NOBOROCK 溝ノ口店 6/14 ルートセット前クローズ',
  summary = 'NOBOROCK 溝ノ口店でルートセット前の営業時間変更があります。',
  description = 'NOBOROCK 溝ノ口店の公式情報で確認したルートセット前の営業時間変更です。対象エリア、利用制限、再開時間は公式ページで確認してください。',
  capacity_text = '対象エリア・利用制限は公式情報で確認',
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id = '4b86f166-3eeb-4eeb-b9e6-f21396bc20fc'::uuid;

UPDATE events
SET
  title = 'NOBOROCK 溝ノ口店 6/15 ルートセット日クローズ',
  summary = 'NOBOROCK 溝ノ口店でルートセット日のクローズ予定があります。',
  description = 'NOBOROCK 溝ノ口店の公式情報で確認したルートセット日のクローズ予定です。対象エリア、利用制限、再開時間は公式ページで確認してください。',
  capacity_text = '対象エリア・利用制限は公式情報で確認',
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id = '092bc62c-39d9-46fe-8e34-2daeeeeedca1'::uuid;

UPDATE events
SET
  title = 'NOBOROCK 町田店 6/17 ルートセット日クローズ',
  summary = 'NOBOROCK 町田店でルートセット日のクローズ予定があります。',
  description = 'NOBOROCK 町田店の公式情報で確認したルートセット日のクローズ予定です。対象エリア、利用制限、再開時間は公式ページで確認してください。',
  capacity_text = '対象エリア・利用制限は公式情報で確認',
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id = '7872ca8a-bb0c-423b-a3b9-c6147614cd6e'::uuid;

UPDATE events
SET
  category = 'route_set',
  title = 'NOBOROCK 町田店 6/18 ルートセット日クローズ',
  summary = 'NOBOROCK 町田店でルートセット日のクローズ予定があります。',
  description = 'NOBOROCK 町田店の公式情報で確認したルートセット日のクローズ予定です。対象エリア、利用制限、再開時間は公式ページで確認してください。',
  capacity_text = '対象エリア・利用制限は公式情報で確認',
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id = 'a6bcf84b-2ea8-483a-9a94-27a97cd9c5e3'::uuid;

UPDATE events
SET
  summary = 'NOBOROCK 高田馬場店で短縮営業の予定があります。',
  description = 'NOBOROCK 高田馬場店の公式Instagram投稿で確認した短縮営業のお知らせです。公開前に対象時間と通常営業への影響を確認してください。',
  capacity_text = '営業時間・利用制限は公式情報で確認',
  updated_at = now()
WHERE review_status = 'pending'
  AND id = '6251d1eb-7a30-4087-b86a-fc82569ae051'::uuid;

UPDATE events
SET
  summary = 'ボルダリングジム ジャムセッション三鷹で屋内クラック講習の募集があります。',
  description = 'ボルダリングジム ジャムセッション三鷹の公式Instagram投稿で確認した講習募集です。公開前に開催時間、対象者、申込方法を確認してください。',
  capacity_text = '申込方法・定員は公式情報で確認',
  updated_at = now()
WHERE review_status = 'pending'
  AND id = '61ae8a71-ed3b-4832-9ee3-36705c2fadb7'::uuid;
