-- Official Instagram browser roller observations.
-- Generated: 2026-05-26T09:57:42.926Z
-- Policy: store source links, short summaries, and short quotes only; do not store passwords, cookies, full captions, images, videos, comments, DMs, or stories.

WITH checked_sources (id, handle) AS (
  VALUES
    ('82ebe4b8-1462-4498-a1cc-fa0a8c279489'::uuid, 'rocky_shinagawa'),
    ('d31a0053-f68b-428d-90a0-26090f3c9ddd'::uuid, 'boulderinggym.bunker2'),
    ('36a5ee15-afe7-4f86-a8a8-c529f82749a6'::uuid, 'basecamp_kawagoe'),
    ('1c927437-7710-4318-9d77-e0e2104c9dc1'::uuid, 'bpump_ogikubo'),
    ('ddecdf49-2c84-4697-b4e7-2763b75d7d3d'::uuid, 'tokyodomecity_spodori'),
    ('20fddaf6-bd4f-4800-95e1-40c8ccd47d67'::uuid, 'volny_climbing'),
    ('806b9f74-2b0b-418f-89df-a1b0ffe51a91'::uuid, 'echoesclimbing'),
    ('afc1e405-5c8a-42f9-b244-f084f79529f8'::uuid, 'climbing_gym_ranbo'),
    ('442a5bb0-f6b3-4707-82f5-8783631d9087'::uuid, 'funabashirocky'),
    ('96041608-b9fa-4d73-96b0-2d309eed77cc'::uuid, '310_avue'),
    ('b88821b5-d46f-4ce1-a568-111cfbd106b5'::uuid, 'bloc_bouldering_local_circuit'),
    ('3f9d3b7b-b618-4c13-9825-86e6b47e5109'::uuid, 'climbingzerosaitama'),
    ('b4d8e7df-566f-48f4-98d1-e837a1850b9c'::uuid, 'bluebird_bouldering_gym'),
    ('60a38ea2-fbc2-4b56-a765-44b3c8421581'::uuid, 'jands_ikebukuro'),
    ('cdf8f4aa-2f0f-47f9-8699-3afe5bf0c84f'::uuid, 'iichiko_step'),
    ('5c60bf4c-316b-4c7a-b8f8-19cf9fbf2821'::uuid, 'dbouldering_soga'),
    ('ade2f2c1-a869-4818-bc70-86283c894d21'::uuid, 'madrock.cg.jp_online'),
    ('528c7d5a-ffb5-45d5-ae64-9f976e5fb7d3'::uuid, 'jetsetclimbing'),
    ('383a857a-b8ee-49aa-9ba4-31d3b4f1e410'::uuid, 'climbinggym_wallstreet'),
    ('7af896be-33b1-487b-b917-c1d19c4b01e1'::uuid, 'fishandbird_toyocho'),
    ('35fc4b76-689f-4343-b332-8f7fee0b3373'::uuid, 'noborock_ikebukuro'),
    ('ed6409de-0b0a-474c-abbe-ad215b26e67e'::uuid, 'altior_climbing_gym1'),
    ('1f04c6db-0b8f-4dc0-94a4-9416dfa234fb'::uuid, 'climbing_gym_cozy')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-26 09:57:42.926+00'::timestamptz,
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
    ('d31a0053-f68b-428d-90a0-26090f3c9ddd'::uuid, 'boulderinggym.bunker2', 'https://www.instagram.com/p/DXyl_CHmeuZ/', 'DXyl_CHmeuZ', '2026-05-01 09:15:01.000+00'::timestamptz, 'event', 'boulderinggym.bunker2 "【期間イベント', 'boulderinggym.bunker2の公式情報に基づく2026/05/17のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-17 01:00:00.000+00'::timestamptz, '2026-05-17 12:00:00.000+00'::timestamptz, '"【期間イベント】', 0.72::numeric, 'pending', 'boulderinggym.bunker2の公式Instagramからイベント候補を検出。日付候補は2026/05/17。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: "【期間イベント】'),
    ('36a5ee15-afe7-4f86-a8a8-c529f82749a6'::uuid, 'basecamp_kawagoe', 'https://www.instagram.com/p/DXxt2MRk_c6/', 'DXxt2MRk_c6', '2026-05-01 01:00:12.000+00'::timestamptz, 'notice', 'basecamp_kawagoe Base Campの一店舗として「Boulder Park Base Camp川越」を2026年6月吉日にオープンさせて頂く事となりました', 'basecamp_kawagoeの公式情報に基づく2026/04/08のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-04-08 01:00:00.000+00'::timestamptz, '2026-04-08 02:00:00.000+00'::timestamptz, 'Base Campの一店舗として「Boulder Park Base Camp川越」を2026年6月吉日にオープンさせて頂く事となりました。', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('b88821b5-d46f-4ce1-a568-111cfbd106b5'::uuid, 'bloc_bouldering_local_circuit', 'https://www.instagram.com/p/DYwzKs3JX7w/', 'DYwzKs3JX7w', '2026-05-25 13:02:57.000+00'::timestamptz, 'competition', 'BLoC Bouldering Local Circuit "【BLoC2026 round4', 'BLoC Bouldering Local Circuitの公式情報に基づくコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '"【BLoC2026 round4】', 0.55::numeric, 'pending', 'BLoC Bouldering Local Circuitの公式Instagramからコンペ・大会候補を検出。日付候補は未確定。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: "【BLoC2026 round4】'),
    ('b88821b5-d46f-4ce1-a568-111cfbd106b5'::uuid, 'bloc_bouldering_local_circuit', 'https://www.instagram.com/p/DYwX3ejGYMj/', 'DYwX3ejGYMj', '2026-05-25 08:45:07.000+00'::timestamptz, 'competition', 'BLoC Bouldering Local Circuit "【BLoC2026 round5', 'BLoC Bouldering Local Circuitの公式情報に基づく2026/07/25のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-07-25 01:00:00.000+00'::timestamptz, '2026-07-25 02:00:00.000+00'::timestamptz, '"【BLoC2026 round5】', 0.72::numeric, 'pending', 'BLoC Bouldering Local Circuitの公式Instagramからコンペ・大会候補を検出。日付候補は2026/07/25。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: "【BLoC2026 round5】'),
    ('3f9d3b7b-b618-4c13-9825-86e6b47e5109'::uuid, 'climbingzerosaitama', 'https://www.instagram.com/p/DWbMesCiYOI/', 'DWbMesCiYOI', '2026-03-28 10:35:19.000+00'::timestamptz, 'event', 'クライミングジム ZE-RO（ゼロ） さいたま店 🔥🔥🔥『聖地巡零2026』開催のお知らせ🔥🔥🔥', 'クライミングジム ZE-RO（ゼロ） さいたま店の公式情報に基づく2026/08/09のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-08-09 01:00:00.000+00'::timestamptz, '2026-08-09 02:00:00.000+00'::timestamptz, '🔥🔥🔥『聖地巡零2026』開催のお知らせ🔥🔥🔥', 0.72::numeric, 'pending', 'クライミングジム ZE-RO（ゼロ） さいたま店の公式Instagramからイベント候補を検出。日付候補は2026/08/09。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 🔥🔥🔥『聖地巡零2026』開催のお知らせ🔥🔥🔥'),
    ('7af896be-33b1-487b-b917-c1d19c4b01e1'::uuid, 'fishandbird_toyocho', 'https://www.instagram.com/reel/DYybGF5SKFg/', 'DYybGF5SKFg', NULL::timestamptz, 'notice', 'fishandbird_toyocho "2FNewセット課題紹介第五弾🟣', 'fishandbird_toyochoの公式情報に基づくイベント情報です。内容や参加条件は公式情報で確認してください。', NULL::timestamptz, NULL::timestamptz, '"2FNewセット課題紹介第五弾🟣', 0.40::numeric, 'ignored', 'Browser roller found no calendar-worthy event signal in the visible post text.'),
    ('35fc4b76-689f-4343-b332-8f7fee0b3373'::uuid, 'noborock_ikebukuro', 'https://www.instagram.com/p/DYyH8muzRsg/', 'DYyH8muzRsg', '2026-05-26 01:25:07.000+00'::timestamptz, 'opening_change', 'NOBOROCK 池袋店 ⛏次回セットスケジュール⛏', 'NOBOROCK 池袋店の公式情報に基づく2026/06/07の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-06-07 08:00:00.000+00'::timestamptz, '2026-06-08 12:00:00.000+00'::timestamptz, '⛏次回セットスケジュール⛏', 0.72::numeric, 'pending', 'NOBOROCK 池袋店の公式Instagramから営業時間・休業変更候補を検出。日付候補は2026/06/07。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ⛏次回セットスケジュール⛏'),
    ('ed6409de-0b0a-474c-abbe-ad215b26e67e'::uuid, 'altior_climbing_gym1', 'https://www.instagram.com/reel/DYyTbeCvx_P/', 'DYyTbeCvx_P', NULL::timestamptz, 'route_set', 'ALTIOR（アルティオール）クライミングジム grade:2D/V9/7c', 'ALTIOR（アルティオール）クライミングジムの公式情報に基づく2026/09/07のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-09-07 08:00:00.000+00'::timestamptz, '2026-09-07 09:00:00.000+00'::timestamptz, 'grade:2D/V9/7c', 0.72::numeric, 'pending', 'ALTIOR（アルティオール）クライミングジムの公式Instagramからセット・ホールド替え候補を検出。日付候補は2026/09/07。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: grade:2D/V9/7c')
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
  '2026-05-26 09:57:42.926+00'::timestamptz,
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
