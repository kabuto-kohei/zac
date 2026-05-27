-- Official Instagram browser roller observations.
-- Generated: 2026-05-27T05:26:33.759Z
-- Policy: store source links, short summaries, and short quotes only; do not store passwords, cookies, full captions, images, videos, comments, DMs, or stories.

WITH checked_sources (id, handle) AS (
  VALUES
    ('82ebe4b8-1462-4498-a1cc-fa0a8c279489'::uuid, 'rocky_shinagawa'),
    ('1c927437-7710-4318-9d77-e0e2104c9dc1'::uuid, 'bpump_ogikubo'),
    ('ddecdf49-2c84-4697-b4e7-2763b75d7d3d'::uuid, 'tokyodomecity_spodori'),
    ('afc1e405-5c8a-42f9-b244-f084f79529f8'::uuid, 'climbing_gym_ranbo'),
    ('442a5bb0-f6b3-4707-82f5-8783631d9087'::uuid, 'funabashirocky'),
    ('96041608-b9fa-4d73-96b0-2d309eed77cc'::uuid, '310_avue'),
    ('836e940c-b745-4cea-8490-4366a35b520c'::uuid, 'chabouzu.bouldering.gym'),
    ('b76cb4ec-9f4c-40c1-986c-dfbad22c2725'::uuid, 'climbinggym_walrus'),
    ('89e0c101-bdf9-4b6e-a2f1-6fbcfe0b4243'::uuid, 'basecamp_iruma'),
    ('fa2a3f46-e116-47c6-ba28-7f2b6663b1fc'::uuid, 'rockmania.jp'),
    ('5e5112eb-5589-4f15-9b5f-d1d5ddca4352'::uuid, 'mountain_cliff_climbing'),
    ('05a589fb-d85c-4a7a-8a11-cd99d5a0f625'::uuid, 'bpumpyokohama'),
    ('980b0f60-2f81-4f01-b602-b141409f808e'::uuid, 'penguinclimb'),
    ('712daf70-fa1a-4141-a3dc-bed0f208e5de'::uuid, 'nextgen.bouldering'),
    ('63c7e04c-a3ec-4afd-8bb9-867f912ecefa'::uuid, 'shina_rocky'),
    ('fdcb412f-e5a7-47d1-9820-62c76879ec84'::uuid, 'pigletclimbinggym'),
    ('fa3467fe-ca12-4ea6-a5ee-d24b88f3e674'::uuid, 'ao_roc.climbing'),
    ('fe6959b7-2e09-42fe-9379-a1394c1824c6'::uuid, 'bonobo_bs'),
    ('230beec0-b638-4d8d-acb9-b0d6c2dd6750'::uuid, 'bouldering_gym_share'),
    ('974238ef-edfa-4ba4-b9ed-55d0753b3e24'::uuid, 'mitaka_gym'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing'),
    ('a022e11b-b296-4479-baf6-b6b608bad0dd'::uuid, 'bunker.boulderinggym')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-27 05:26:33.759+00'::timestamptz,
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
    ('b76cb4ec-9f4c-40c1-986c-dfbad22c2725'::uuid, 'climbinggym_walrus', 'https://www.instagram.com/p/DY1I6KOEy9v/', 'DY1I6KOEy9v', '2026-05-27 05:25:47.000+00'::timestamptz, 'notice', 'Climbing Gym Walrus 2026/5/27時点のエントリーリストです', 'Climbing Gym Walrusの公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '2026/5/27時点のエントリーリストです。', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('fa2a3f46-e116-47c6-ba28-7f2b6663b1fc'::uuid, 'rockmania.jp', 'https://www.instagram.com/reel/DWG0siWk1TY/', 'DWG0siWk1TY', NULL::timestamptz, 'route_set', 'rockmania.jp 3/20〜4/5まで❤️‍🔥', 'rockmania.jpの公式情報に基づく2026/03/20のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-03-20 06:00:00.000+00'::timestamptz, '2026-03-20 07:00:00.000+00'::timestamptz, '3/20〜4/5まで❤️‍🔥', 0.72::numeric, 'pending', 'rockmania.jpの公式Instagramからセット・ホールド替え候補を検出。日付候補は2026/03/20。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: 3/20〜4/5まで❤️‍🔥'),
    ('fa2a3f46-e116-47c6-ba28-7f2b6663b1fc'::uuid, 'rockmania.jp', 'https://www.instagram.com/p/DVTF6k3Ew1h/', 'DVTF6k3Ew1h', '2026-02-28 10:31:16.000+00'::timestamptz, 'route_set', 'rockmania.jp 2026/03/15 セット', 'rockmania.jpの公式情報に基づく2026/03/15のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '3/15 10:00-16:00', 0.30::numeric, 'ignored', 'Ignored by Instagram backfill lookback guard: visible posted date is older than 60 days.'),
    ('fa2a3f46-e116-47c6-ba28-7f2b6663b1fc'::uuid, 'rockmania.jp', 'https://www.instagram.com/reel/DVQxl9Kk2lh/', 'DVQxl9Kk2lh', NULL::timestamptz, 'route_set', 'rockmania.jp - 営業時間 -', 'rockmania.jpの公式情報に基づくセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '- 営業時間 -', 0.55::numeric, 'pending', 'rockmania.jpの公式Instagramからセット・ホールド替え候補を検出。日付候補は未確定。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: - 営業時間 -'),
    ('5e5112eb-5589-4f15-9b5f-d1d5ddca4352'::uuid, 'mountain_cliff_climbing', 'https://www.instagram.com/reel/DY1HgibqAi3/', 'DY1HgibqAi3', NULL::timestamptz, 'route_set', 'MOUNTAIN CLIFF（マウンテンクリフ） ✔︎ ルートセットがメインのジム👌', 'MOUNTAIN CLIFF（マウンテンクリフ）の公式情報に基づくセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '✔︎ ルートセットがメインのジム👌', 0.55::numeric, 'pending', 'MOUNTAIN CLIFF（マウンテンクリフ）の公式Instagramからセット・ホールド替え候補を検出。日付候補は未確定。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: ✔︎ ルートセットがメインのジム👌'),
    ('63c7e04c-a3ec-4afd-8bb9-867f912ecefa'::uuid, 'shina_rocky', 'https://www.instagram.com/reel/DYzEvRHBzwG/', 'DYzEvRHBzwG', NULL::timestamptz, 'notice', 'ROCKY 品川店 ダイナミックな新セットが完成🔥', 'ROCKY 品川店の公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, 'ダイナミックな新セットが完成🔥', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('fdcb412f-e5a7-47d1-9820-62c76879ec84'::uuid, 'pigletclimbinggym', 'https://www.instagram.com/reel/DYzLt3VPnIa/', 'DYzLt3VPnIa', NULL::timestamptz, 'notice', 'PIGLET CLIMBING GYM "今週の週課題120度上級の参考動画です', 'PIGLET CLIMBING GYMの公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '"今週の週課題120度上級の参考動画です。', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('fa3467fe-ca12-4ea6-a5ee-d24b88f3e674'::uuid, 'ao_roc.climbing', 'https://www.instagram.com/p/DYyD3f8BcAG/', 'DYyD3f8BcAG', '2026-05-26 00:44:38.000+00'::timestamptz, 'competition', 'アオロク〖ao_roc.climbing〗 ❶ホールド替え', 'アオロク〖ao_roc.climbing〗の公式情報に基づく2026/07/05のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-07-05 01:00:00.000+00'::timestamptz, '2026-07-05 02:00:00.000+00'::timestamptz, '❶ホールド替え', 0.72::numeric, 'pending', 'アオロク〖ao_roc.climbing〗の公式Instagramからコンペ・大会候補を検出。日付候補は2026/07/05。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: ❶ホールド替え'),
    ('fa3467fe-ca12-4ea6-a5ee-d24b88f3e674'::uuid, 'ao_roc.climbing', 'https://www.instagram.com/p/DYmTLBbAdjh/', 'DYmTLBbAdjh', '2026-05-21 11:08:53.000+00'::timestamptz, 'event', 'アオロク〖ao_roc.climbing〗 5月23日(土),24日(日)に開催されるアオロク戦のタイムスケジュール【更新版】となります', 'アオロク〖ao_roc.climbing〗の公式情報に基づく2026/05/23のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-23 01:00:00.000+00'::timestamptz, '2026-05-23 12:00:00.000+00'::timestamptz, '5月23日(土),24日(日)に開催されるアオロク戦のタイムスケジュール【更新版】となります。', 0.72::numeric, 'pending', 'アオロク〖ao_roc.climbing〗の公式Instagramからイベント候補を検出。日付候補は2026/05/23。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 5月23日(土),24日(日)に開催されるアオロク戦のタイムスケジュール【更新版】となります。'),
    ('230beec0-b638-4d8d-acb9-b0d6c2dd6750'::uuid, 'bouldering_gym_share', 'https://www.instagram.com/p/DX9yXEoGVfk/', 'DX9yXEoGVfk', '2026-05-05 17:30:32.000+00'::timestamptz, 'notice', 'ボルダリングジム Share（シェア） "【GWスペシャルセット第3弾', 'ボルダリングジム Share（シェア）の公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '"【GWスペシャルセット第3弾】', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('230beec0-b638-4d8d-acb9-b0d6c2dd6750'::uuid, 'bouldering_gym_share', 'https://www.instagram.com/p/DX6CC5REUzn/', 'DX6CC5REUzn', '2026-05-04 06:30:37.000+00'::timestamptz, 'notice', 'ボルダリングジム Share（シェア） "【GWスペシャルセット第2弾', 'ボルダリングジム Share（シェア）の公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '"【GWスペシャルセット第2弾】', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('230beec0-b638-4d8d-acb9-b0d6c2dd6750'::uuid, 'bouldering_gym_share', 'https://www.instagram.com/p/DX26N_KDJza/', 'DX26N_KDJza', '2026-05-09 13:59:35.000+00'::timestamptz, 'event', 'ボルダリングジム Share（シェア） 5月15日（金）、アークテリクス MARK ISみなとみらいブランドストアがリニューアルオープン', 'ボルダリングジム Share（シェア）の公式情報に基づく2026/05/15のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-15 01:00:00.000+00'::timestamptz, '2026-05-01 12:00:00.000+00'::timestamptz, '5月15日（金）、アークテリクス MARK ISみなとみらいブランドストアがリニューアルオープン。', 0.72::numeric, 'pending', 'ボルダリングジム Share（シェア）の公式Instagramからイベント候補を検出。日付候補は2026/05/15。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 5月15日（金）、アークテリクス MARK ISみなとみらいブランドストアがリニューアルオープン。'),
    ('230beec0-b638-4d8d-acb9-b0d6c2dd6750'::uuid, 'bouldering_gym_share', 'https://www.instagram.com/reel/DX1T9ejJwGG/', 'DX1T9ejJwGG', NULL::timestamptz, 'notice', 'ボルダリングジム Share（シェア） 今日は @bouldering_gym_share さんでGW2日間コーデオンリーで楽しく登らせて頂きました 🌊🌊🌊', 'ボルダリングジム Share（シェア）の公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '今日は @bouldering_gym_share さんでGW2日間コーデオンリーで楽しく登らせて頂きました 🌊🌊🌊', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('974238ef-edfa-4ba4-b9ed-55d0753b3e24'::uuid, 'mitaka_gym', 'https://www.instagram.com/p/DY1AyO1EovX/', 'DY1AyO1EovX', '2026-05-27 04:21:08.000+00'::timestamptz, 'notice', 'ロッククライミング 三鷹ジム "ランダムリセット', 'ロッククライミング 三鷹ジムの公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '"ランダムリセット', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing', 'https://www.instagram.com/p/DYMlaYykfU4/', 'DYMlaYykfU4', '2026-05-11 11:30:39.000+00'::timestamptz, 'notice', 'クライミングジム TRIP "FRIENDLY FOOT POWDER✨', 'クライミングジム TRIPの公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '"FRIENDLY FOOT POWDER✨', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing', 'https://www.instagram.com/p/DYJ7BUaET2z/', 'DYJ7BUaET2z', '2026-05-10 10:42:33.000+00'::timestamptz, 'event', 'クライミングジム TRIP 開催時間', 'クライミングジム TRIPの公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '【開催時間】', 0.55::numeric, 'pending', 'クライミングジム TRIPの公式Instagramからイベント候補を検出。日付候補は未確定。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 【開催時間】'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing', 'https://www.instagram.com/reel/DYHa9QQR6dg/', 'DYHa9QQR6dg', NULL::timestamptz, 'notice', 'クライミングジム TRIP "バルジ壁紺色Ｖ✨', 'クライミングジム TRIPの公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '"バルジ壁紺色Ｖ✨', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing', 'https://www.instagram.com/p/DYGPJ57E8Db/', 'DYGPJ57E8Db', '2026-05-09 00:21:43.000+00'::timestamptz, 'event', 'クライミングジム TRIP 🔰初心者向けのボルダリング体験会✨', 'クライミングジム TRIPの公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '🔰初心者向けのボルダリング体験会✨', 0.55::numeric, 'pending', 'クライミングジム TRIPの公式Instagramからイベント候補を検出。日付候補は未確定。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 🔰初心者向けのボルダリング体験会✨'),
    ('a022e11b-b296-4479-baf6-b6b608bad0dd'::uuid, 'bunker.boulderinggym', 'https://www.instagram.com/reel/DYzFSZaJjtL/', 'DYzFSZaJjtL', NULL::timestamptz, 'route_set', 'bunker.boulderinggym Vol.3も5/27(水)17:00まで', 'bunker.boulderinggymの公式情報に基づくセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, 'Vol.3も5/27(水)17:00まで', 0.55::numeric, 'pending', 'bunker.boulderinggymの公式Instagramからセット・ホールド替え候補を検出。日付候補は未確定。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: Vol.3も5/27(水)17:00まで')
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
  '2026-05-27 05:26:33.759+00'::timestamptz,
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
