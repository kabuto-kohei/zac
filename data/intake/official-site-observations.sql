-- Official-site observations generated from official-site fallback queues.
-- Generated: 2026-05-20T16:20:59.490Z
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

WITH checked_sources (handle, source_url) AS (
  VALUES
    ('headrock-climbing', 'https://headrock-climbing.com/'),
    ('limestone-climbing-club', 'https://www.limestone.jp/'),
    ('lutra-lutra', 'https://www.lutra-lutra.com/'),
    ('monolithe-bouldering-gym', 'https://www.boulderinggym.jp/'),
    ('noborock-ikebukuro', 'https://noborock-climbing.com/program/ikebukuro/')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-20 16:20:59.490+00'::timestamptz,
  "updated_at" = now()
FROM checked_sources c
WHERE s."handle" = c.handle
  AND s."source_url" = c.source_url;

WITH observed_items (
  handle,
  source_url,
  source_external_id,
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
    ('headrock-climbing', 'https://headrock-climbing.com/#zac-2026-05-19-event-1', 'official-site:headrock-climbing:2026-05-19:event:1', 'event', 'HEADROCK CLIMBING GYM 3月末まで延長', 'HEADROCK CLIMBING GYMの公式情報に基づく2026/05/19のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-19 01:00:00.000+00'::timestamptz, '2026-05-19 02:00:00.000+00'::timestamptz, '開閉する 施設について 初めての方へ 料金表 スクール クーポン アクセス ONLINE SHOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月…', 0.60::numeric, 'pending', 'HEADROCK CLIMBING GYM 公式サイトからイベント候補を検出。日付候補は2026/05/19。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 開閉する 施設について 初めての方へ 料金表 スクール クーポン アクセス ONLINE SHOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月…'),
    ('headrock-climbing', 'https://headrock-climbing.com/#zac-2026-05-01-event-2', 'official-site:headrock-climbing:2026-05-01:event:2', 'event', 'HEADROCK CLIMBING GYM 3月末まで延長', 'HEADROCK CLIMBING GYMの公式情報に基づく2026/05/01のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-01 01:00:00.000+00'::timestamptz, '2026-05-01 02:00:00.000+00'::timestamptz, 'スクール クーポン アクセス ONLINE SHOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月スケジュール 2026/3/1 【3月末まで延…', 0.60::numeric, 'pending', 'HEADROCK CLIMBING GYM 公式サイトからイベント候補を検出。日付候補は2026/05/01。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: スクール クーポン アクセス ONLINE SHOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月スケジュール 2026/3/1 【3月末まで延…'),
    ('headrock-climbing', 'https://headrock-climbing.com/#zac-2026-03-01-event-3', 'official-site:headrock-climbing:2026-03-01:event:3', 'event', 'HEADROCK CLIMBING GYM 3月末まで延長', 'HEADROCK CLIMBING GYMの公式情報に基づく2026/03/01のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-03-01 01:00:00.000+00'::timestamptz, '2026-03-01 02:00:00.000+00'::timestamptz, 'HOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月スケジュール 2026/3/1 【3月末まで延長】始めたい人応援します！... 2026/3…', 0.60::numeric, 'pending', 'HEADROCK CLIMBING GYM 公式サイトからイベント候補を検出。日付候補は2026/03/01。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: HOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月スケジュール 2026/3/1 【3月末まで延長】始めたい人応援します！... 2026/3…'),
    ('limestone-climbing-club', 'https://www.limestone.jp/#zac-2026-05-12-competition-1', 'official-site:limestone-climbing-club:2026-05-12:competition:1', 'competition', 'LIMESTONE Climbing Club 開店時間変更のお知らせ', 'LIMESTONE Climbing Clubの公式情報に基づく2026/05/12のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-12 01:00:00.000+00'::timestamptz, '2026-05-12 02:00:00.000+00'::timestamptz, 'テップUPを目指す方へ 料金案内 よくあるご質問 INFORMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催…', 0.60::numeric, 'pending', 'LIMESTONE Climbing Club 公式サイトからコンペ・大会候補を検出。日付候補は2026/05/12。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: テップUPを目指す方へ 料金案内 よくあるご質問 INFORMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催…'),
    ('limestone-climbing-club', 'https://www.limestone.jp/#zac-2026-05-12-competition-2', 'official-site:limestone-climbing-club:2026-05-12:competition:2', 'competition', 'LIMESTONE Climbing Club 開店時間変更のお知らせ', 'LIMESTONE Climbing Clubの公式情報に基づく2026/05/12のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-12 01:00:00.000+00'::timestamptz, '2026-05-12 02:00:00.000+00'::timestamptz, '料金案内 よくあるご質問 INFORMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催中！ 2026/05/0…', 0.60::numeric, 'pending', 'LIMESTONE Climbing Club 公式サイトからコンペ・大会候補を検出。日付候補は2026/05/12。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: 料金案内 よくあるご質問 INFORMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催中！ 2026/05/0…'),
    ('limestone-climbing-club', 'https://www.limestone.jp/#zac-2026-05-17-competition-3', 'official-site:limestone-climbing-club:2026-05-17:competition:3', 'competition', 'LIMESTONE Climbing Club 開店時間変更のお知らせ', 'LIMESTONE Climbing Clubの公式情報に基づく2026/05/17のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-17 01:00:00.000+00'::timestamptz, '2026-05-17 02:00:00.000+00'::timestamptz, 'あるご質問 INFORMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催中！ 2026/05/05 5月🎏旬…', 0.60::numeric, 'pending', 'LIMESTONE Climbing Club 公式サイトからコンペ・大会候補を検出。日付候補は2026/05/17。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: あるご質問 INFORMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催中！ 2026/05/05 5月🎏旬…'),
    ('lutra-lutra', 'https://www.lutra-lutra.com/#zac-2026-03-31-competition-1', 'official-site:lutra-lutra:2026-03-31:competition:1', 'competition', 'Lutra Lutra 03/31 コンペ', 'Lutra Lutraの公式情報に基づく2026/03/31のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-03-31 01:00:00.000+00'::timestamptz, '2026-03-31 02:00:00.000+00'::timestamptz, '�大ゴッホ展とTHEWALL合宿🌻 茨城生まれ、足立区育ち、サウナ好きなやつはだいたいトモダチ🎵てんちょーです福島美術館で開幕中の大ゴッホ展に突撃です💨 2026.03.31 08:27 ジム 観光 お風呂 ✨６面リニューアル✨今月…', 0.60::numeric, 'pending', 'Lutra Lutra 公式サイトからコンペ・大会候補を検出。日付候補は2026/03/31。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: �大ゴッホ展とTHEWALL合宿🌻 茨城生まれ、足立区育ち、サウナ好きなやつはだいたいトモダチ🎵てんちょーです福島美術館で開幕中の大ゴッホ展に突撃です💨 2026.03.31 08:27 ジム 観光 お風呂 ✨６面リニューアル✨今月…'),
    ('noborock-ikebukuro', 'https://noborock-climbing.com/program/ikebukuro/#zac-2026-05-08-route_set-1', 'official-site:noborock-ikebukuro:2026-05-08:route_set:1', 'route_set', 'NOBOROCK 池袋店 2026/05/08 セット', 'NOBOROCK 池袋店の公式情報に基づく2026/05/08のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-08 01:00:00.000+00'::timestamptz, '2026-05-08 02:00:00.000+00'::timestamptz, '浅草店 高田馬場店 渋谷店 池袋店 町田店 溝ノ口店 大宮店 カレンダー 撮影について ホーム 店舗案内 店舗 池袋店 店舗 池袋店 お知らせ 【ルートセット】 5/8 ルートセット完了！ 6/7(日) 17:00 close 6/8(月…', 0.60::numeric, 'pending', 'NOBOROCK 池袋店 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/08。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: 浅草店 高田馬場店 渋谷店 池袋店 町田店 溝ノ口店 大宮店 カレンダー 撮影について ホーム 店舗案内 店舗 池袋店 店舗 池袋店 お知らせ 【ルートセット】 5/8 ルートセット完了！ 6/7(日) 17:00 close 6/8(月…'),
    ('noborock-ikebukuro', 'https://noborock-climbing.com/program/ikebukuro/#zac-2026-06-07-route_set-2', 'official-site:noborock-ikebukuro:2026-06-07:route_set:2', 'route_set', 'NOBOROCK 池袋店 2026/06/07 セット', 'NOBOROCK 池袋店の公式情報に基づく2026/06/07のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-06-07 01:00:00.000+00'::timestamptz, '2026-06-07 02:00:00.000+00'::timestamptz, '池袋店 町田店 溝ノ口店 大宮店 カレンダー 撮影について ホーム 店舗案内 店舗 池袋店 店舗 池袋店 お知らせ 【ルートセット】 5/8 ルートセット完了！ 6/7(日) 17:00 close 6/8(月) close 6/9(火)…', 0.60::numeric, 'pending', 'NOBOROCK 池袋店 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/06/07。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: 池袋店 町田店 溝ノ口店 大宮店 カレンダー 撮影について ホーム 店舗案内 店舗 池袋店 店舗 池袋店 お知らせ 【ルートセット】 5/8 ルートセット完了！ 6/7(日) 17:00 close 6/8(月) close 6/9(火)…'),
    ('noborock-ikebukuro', 'https://noborock-climbing.com/program/ikebukuro/#zac-2026-06-08-route_set-3', 'official-site:noborock-ikebukuro:2026-06-08:route_set:3', 'route_set', 'NOBOROCK 池袋店 2026/06/08 セット', 'NOBOROCK 池袋店の公式情報に基づく2026/06/08のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-06-08 01:00:00.000+00'::timestamptz, '2026-06-08 02:00:00.000+00'::timestamptz, 'ンダー 撮影について ホーム 店舗案内 店舗 池袋店 店舗 池袋店 お知らせ 【ルートセット】 5/8 ルートセット完了！ 6/7(日) 17:00 close 6/8(月) close 6/9(火) 18:30 open! 施設案内 池…', 0.60::numeric, 'pending', 'NOBOROCK 池袋店 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/06/08。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: ンダー 撮影について ホーム 店舗案内 店舗 池袋店 店舗 池袋店 お知らせ 【ルートセット】 5/8 ルートセット完了！ 6/7(日) 17:00 close 6/8(月) close 6/9(火) 18:30 open! 施設案内 池…')
),
matched_sources AS (
  SELECT
    o.*,
    s."id" AS event_source_id
  FROM observed_items o
  LEFT JOIN "event_sources" s
    ON s."deleted_at" IS NULL
   AND s."handle" = o.handle
   AND s."source_type" = 'official_site'
)
INSERT INTO "source_post_observations" (
  "event_source_id",
  "platform",
  "handle",
  "source_url",
  "source_external_id",
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
  'web',
  handle,
  source_url,
  source_external_id,
  '2026-05-20 16:20:59.490+00'::timestamptz,
  classification,
  title,
  summary,
  starts_at::timestamptz,
  ends_at::timestamptz,
  source_quote,
  extraction_confidence::numeric,
  review_status,
  decision_note
FROM matched_sources
ON CONFLICT ("source_url") DO UPDATE SET
  "event_source_id" = EXCLUDED."event_source_id",
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
