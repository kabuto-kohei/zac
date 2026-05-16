-- Official Instagram post observations generated from instagramPostInspection.
-- Generated: 2026-05-16T00:23:40.841Z
-- Policy: store source links, short summaries, and short quotes only; do not store full captions or media.

WITH checked_sources (id, handle) AS (
  VALUES
    ('86e485c9-55ea-48ea-b4bc-be876064ff75'::uuid, 'quartier_de_roche'),
    ('02d44afc-a542-4d6e-8e36-042215e7a55e'::uuid, 'rhinoandbird_nishinippori'),
    ('8e81426f-f0ee-45a1-ac86-6625148f8e1d'::uuid, 'rockbeans.insta'),
    ('f5d7c62a-37fb-4253-ab25-f7135be773db'::uuid, 'sloth.gym'),
    ('ed678020-82d3-4a89-975c-b2c590fcf7a6'::uuid, 'three_peaks_climbing'),
    ('ddecdf49-2c84-4697-b4e7-2763b75d7d3d'::uuid, 'tokyodomecity_spodori'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-16 00:23:40.841+00'::timestamptz,
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
    ('86e485c9-55ea-48ea-b4bc-be876064ff75'::uuid, 'quartier_de_roche', 'https://www.instagram.com/p/DYT94slSzAx/', 'DYT94slSzAx', '2026-05-14 08:17:48.000+00'::timestamptz, 'notice', 'ウィークリー課題を更新しました‼︎', 'クライミングパーク カルチェロッシュの公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, 'ウィークリー課題を更新しました‼︎', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('86e485c9-55ea-48ea-b4bc-be876064ff75'::uuid, 'quartier_de_roche', 'https://www.instagram.com/p/DYGaPgWEu6j/', 'DYGaPgWEu6j', '2026-05-09 01:52:54.000+00'::timestamptz, 'notice', 'WALL to WALLにご参加いただいた会員さま、お疲れさまでした！', 'クライミングパーク カルチェロッシュの公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, 'WALL to WALLにご参加いただいた会員さま、お疲れさまでした！', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('86e485c9-55ea-48ea-b4bc-be876064ff75'::uuid, 'quartier_de_roche', 'https://www.instagram.com/p/DX6sMdPkmqO/', 'DX6sMdPkmqO', '2026-05-04 12:43:15.000+00'::timestamptz, 'notice', '今月のスピードレッスンのお知らせです！', 'クライミングパーク カルチェロッシュの公式Instagram投稿を一般告知として確認。 日付候補は2026/05/07。公開UIに出す前に詳細確認が必要。', '2026-05-07 01:00:00.000+00'::timestamptz, '2026-05-14 12:00:00.000+00'::timestamptz, '今月のスピードレッスンのお知らせです！', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('02d44afc-a542-4d6e-8e36-042215e7a55e'::uuid, 'rhinoandbird_nishinippori', 'https://www.instagram.com/p/Cyzb02uSFtx/', 'Cyzb02uSFtx', '2023-10-25 01:39:35.000+00'::timestamptz, 'notice', 'ご利用料金改定のお知らせ', 'Rhino and Bird（ライノアンドバード）の公式Instagram投稿を一般告知として確認。 日付候補は2023/11/01。公開UIに出す前に詳細確認が必要。', '2023-11-01 01:00:00.000+00'::timestamptz, '2023-11-01 02:00:00.000+00'::timestamptz, 'ご利用料金改定のお知らせ', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('02d44afc-a542-4d6e-8e36-042215e7a55e'::uuid, 'rhinoandbird_nishinippori', 'https://www.instagram.com/p/Cx0Gxc2y60t/', 'Cx0Gxc2y60t', '2023-09-30 11:23:28.000+00'::timestamptz, 'notice', 'Bloc参加者の皆様お疲れ様でした🔥🔥🔥', 'Rhino and Bird（ライノアンドバード）の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, 'Bloc参加者の皆様お疲れ様でした🔥🔥🔥', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('02d44afc-a542-4d6e-8e36-042215e7a55e'::uuid, 'rhinoandbird_nishinippori', 'https://www.instagram.com/p/CiZhBneu6Xv/', 'CiZhBneu6Xv', '2022-09-12 07:42:28.000+00'::timestamptz, 'event', '⭐️お知らせ⭐️', 'Rhino and Bird（ライノアンドバード）の公式Instagram投稿をイベントとして確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '⭐️お知らせ⭐️', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('8e81426f-f0ee-45a1-ac86-6625148f8e1d'::uuid, 'rockbeans.insta', 'https://www.instagram.com/p/DUhxBMzkgyj/', 'DUhxBMzkgyj', '2026-02-09 06:50:11.000+00'::timestamptz, 'opening_change', '日曜日はジム開店時でこんなに雪が積もっていました', 'クライミングジム ROCKBEANS（ロックビーンズ）の公式Instagram投稿を営業時間変更として確認。 日付候補は2026/02/12。公開UIに出す前に詳細確認が必要。', '2026-02-12 05:00:00.000+00'::timestamptz, '2026-02-20 12:00:00.000+00'::timestamptz, '日曜日はジム開店時でこんなに雪が積もっていました。', 0.72::numeric, 'pending', 'Potential calendar candidate from official Instagram; keep pending until human/source cross-check.'),
    ('8e81426f-f0ee-45a1-ac86-6625148f8e1d'::uuid, 'rockbeans.insta', 'https://www.instagram.com/p/DHqVCQ8yxFI/', 'DHqVCQ8yxFI', '2025-03-26 11:46:22.000+00'::timestamptz, 'notice', 'とつぜん始まったいちごパーティ！', 'クライミングジム ROCKBEANS（ロックビーンズ）の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, 'とつぜん始まったいちごパーティ！', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('8e81426f-f0ee-45a1-ac86-6625148f8e1d'::uuid, 'rockbeans.insta', 'https://www.instagram.com/p/DG0C04LShX8/', 'DG0C04LShX8', '2025-03-05 09:48:16.000+00'::timestamptz, 'notice', '昨晩の八王子は枝も白くてクルマもまばらで静かな夜でした', 'クライミングジム ROCKBEANS（ロックビーンズ）の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '昨晩の八王子は枝も白くてクルマもまばらで静かな夜でした', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('f5d7c62a-37fb-4253-ab25-f7135be773db'::uuid, 'sloth.gym', 'https://www.instagram.com/p/ClIvV33ymfp/', 'ClIvV33ymfp', '2022-11-19 08:54:39.000+00'::timestamptz, 'opening_change', 'climbing gym SLOTH 初めてのご来店のお客様へ！', 'クライミングジム SLOTH（スロース）の公式Instagram投稿を営業時間変更として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, 'climbing gym SLOTH 初めてのご来店のお客様へ！', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('f5d7c62a-37fb-4253-ab25-f7135be773db'::uuid, 'sloth.gym', 'https://www.instagram.com/p/DX0T1EBgVOV/', 'DX0T1EBgVOV', '2026-05-02 01:44:22.000+00'::timestamptz, 'opening_change', 'こんにちは！今日からGWですね！', 'クライミングジム SLOTH（スロース）の公式Instagram投稿を営業時間変更として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, 'こんにちは！今日からGWですね！', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('f5d7c62a-37fb-4253-ab25-f7135be773db'::uuid, 'sloth.gym', 'https://www.instagram.com/p/DXDcxJsge_8/', 'DXDcxJsge_8', '2026-04-13 01:51:58.000+00'::timestamptz, 'notice', '4/19（日） 4/26（日）は無人営業となります', 'クライミングジム SLOTH（スロース）の公式Instagram投稿を一般告知として確認。 日付候補は2026/04/19。公開UIに出す前に詳細確認が必要。', '2026-04-19 01:00:00.000+00'::timestamptz, '2026-04-26 12:00:00.000+00'::timestamptz, '4/19（日） 4/26（日）は無人営業となります。', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('ed678020-82d3-4a89-975c-b2c590fcf7a6'::uuid, 'three_peaks_climbing', 'https://www.instagram.com/p/DXyY9uxkeZL/', 'DXyY9uxkeZL', '2026-05-01 07:17:59.000+00'::timestamptz, 'notice', '大切なお知らせ：THREE PEAKSより皆様へ', 'クライミングジム THREE PEAKS（スリーピークス）の公式Instagram投稿を一般告知として確認。 日付候補は2026/05/31。公開UIに出す前に詳細確認が必要。', '2026-05-31 01:00:00.000+00'::timestamptz, '2026-05-31 02:00:00.000+00'::timestamptz, '【大切なお知らせ：THREE PEAKSより皆様へ】', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('ed678020-82d3-4a89-975c-b2c590fcf7a6'::uuid, 'three_peaks_climbing', 'https://www.instagram.com/p/DYAvO9vkXYZ/', 'DYAvO9vkXYZ', '2026-05-06 21:00:00.000+00'::timestamptz, 'notice', '.', 'クライミングジム THREE PEAKS（スリーピークス）の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '.', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('ed678020-82d3-4a89-975c-b2c590fcf7a6'::uuid, 'three_peaks_climbing', 'https://www.instagram.com/p/DX-KcUmE6Sx/', 'DX-KcUmE6Sx', '2026-05-05 21:00:00.000+00'::timestamptz, 'notice', '.NEW SLAB', 'クライミングジム THREE PEAKS（スリーピークス）の公式Instagram投稿を一般告知として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '.NEW SLAB', 0.40::numeric, 'ignored', 'No calendar-worthy event signal found in the inspected caption preview.'),
    ('ddecdf49-2c84-4697-b4e7-2763b75d7d3d'::uuid, 'tokyodomecity_spodori', 'https://www.instagram.com/p/C-AIA0OSRou/', 'C-AIA0OSRou', '2024-07-29 09:43:26.000+00'::timestamptz, 'opening_change', '<バッティングエリアのご紹介>', 'スポドリ！の公式Instagram投稿を営業時間変更として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '<バッティングエリアのご紹介>', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('ddecdf49-2c84-4697-b4e7-2763b75d7d3d'::uuid, 'tokyodomecity_spodori', 'https://www.instagram.com/p/C9zlD1cyaYm/', 'C9zlD1cyaYm', '2024-07-24 12:46:15.000+00'::timestamptz, 'opening_change', '駅から徒歩3分、東京ドームの敷地内にありますレジャー施設です', 'スポドリ！の公式Instagram投稿を営業時間変更として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '駅から徒歩3分、東京ドームの敷地内にありますレジャー施設です。', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('ddecdf49-2c84-4697-b4e7-2763b75d7d3d'::uuid, 'tokyodomecity_spodori', 'https://www.instagram.com/p/DXVcRKikonH/', 'DXVcRKikonH', '2026-04-20 01:27:49.000+00'::timestamptz, 'route_set', 'G・H壁ホールド替え完了のお知らせ', 'スポドリ！の公式Instagram投稿をセット替えとして確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '【G・H壁ホールド替え完了のお知らせ】', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing', 'https://www.instagram.com/p/DTR22LmEwiV/', 'DTR22LmEwiV', '2026-01-09 05:57:32.000+00'::timestamptz, 'event', 'TRIPの小・中学生対象キッズボルダリングスクールは、カラダだけじゃない❗️', 'クライミングジム TRIPの公式Instagram投稿をイベントとして確認。 日付候補は2026/01/12。公開UIに出す前に詳細確認が必要。', '2026-01-12 01:00:00.000+00'::timestamptz, '2026-01-12 02:00:00.000+00'::timestamptz, 'TRIPの小・中学生対象キッズボルダリングスクールは、カラダだけじゃない❗️', 0.72::numeric, 'pending', 'Potential calendar candidate from official Instagram; keep pending until human/source cross-check.'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing', 'https://www.instagram.com/p/DWvW80ME-22/', 'DWvW80ME-22', '2026-04-05 06:38:41.000+00'::timestamptz, 'opening_change', '軽やかリズムコンディショニング♪', 'クライミングジム TRIPの公式Instagram投稿を営業時間変更として確認。公開UIに出す前に詳細確認が必要。', NULL, NULL, '軽やかリズムコンディショニング♪', 0.55::numeric, 'pending', 'Relevant official Instagram post, but date extraction is not strong enough for public calendar insertion.'),
    ('2d9191d2-93c2-46c2-bb58-49134333c448'::uuid, 'tripclimbing', 'https://www.instagram.com/p/DTpArm7E1a9/', 'DTpArm7E1a9', '2026-01-18 05:46:00.000+00'::timestamptz, 'event', '幼児（4～６歳）対象', 'クライミングジム TRIPの公式Instagram投稿をイベントとして確認。 日付候補は2026/02/11。公開UIに出す前に詳細確認が必要。', '2026-02-11 01:00:00.000+00'::timestamptz, '2026-02-11 02:00:00.000+00'::timestamptz, '幼児（4～６歳）対象', 0.72::numeric, 'pending', 'Potential calendar candidate from official Instagram; keep pending until human/source cross-check.')
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
  '2026-05-16 00:23:40.841+00'::timestamptz,
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
