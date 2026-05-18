-- Official-site observations generated from official-site fallback queues.
-- Generated: 2026-05-18T15:18:43.306Z
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

WITH checked_sources (handle, source_url) AS (
  VALUES
    ('d-bouldering-plus-yachiyo', 'https://www.d-b-c.jp/yachiyo-news/facility'),
    ('energy-climbing-urawa', 'https://energy-climbing.co.jp/urawa/'),
    ('jam-session-mitaka', 'https://xn--xckbj6a9jra6a4gy403a4b6j.com/'),
    ('penguin-climb', 'https://penguin-climb.com/')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-18 15:18:43.306+00'::timestamptz,
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
    ('d-bouldering-plus-yachiyo', 'https://www.d-b-c.jp/yachiyo-news/facility#zac-2025-02-06-private_booking-1', 'official-site:d-bouldering-plus-yachiyo:2025-02-06:private_booking:1', 'private_booking', 'ディーボルダリングプラス八千代公式施設紹介 施設のご紹介', 'ディーボルダリングプラス八千代公式施設紹介の公式情報に基づく2025/02/06の貸切・利用制限情報です。一般利用への影響は公式情報で確認してください。', '2025-02-06 01:00:00.000+00'::timestamptz, '2025-02-06 02:00:00.000+00'::timestamptz, 'ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース＆ キャンペーン NEWS & CAMPAIGN ディーボルダリングプラス八千代【施設のご紹介】 2025/2/6 ディーボルダリングプラス八千代 施設のご紹介 &#x1f69…', 0.60::numeric, 'pending', 'ディーボルダリングプラス八千代公式施設紹介の公式サイトから貸切・利用制限候補を検出。日付候補は2025/02/06。Adminで貸切日時、一般利用への影響を確認してください。根拠抜粋: ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース＆ キャンペーン NEWS & CAMPAIGN ディーボルダリングプラス八千代【施設のご紹介】 2025/2/6 ディーボルダリングプラス八千代 施設のご紹介 &#x1f69…'),
    ('d-bouldering-plus-yachiyo', 'https://www.d-b-c.jp/yachiyo-news/facility#zac-2025-06-05-event-2', 'official-site:d-bouldering-plus-yachiyo:2025-06-05:event:2', 'event', 'ディーボルダリングプラス八千代公式施設紹介 お詫びと自主回収のお知らせ', 'ディーボルダリングプラス八千代公式施設紹介の公式情報に基づく2025/06/05のイベント情報です。内容や参加条件は公式情報で確認してください。', '2025-06-05 01:00:00.000+00'::timestamptz, '2025-06-05 02:00:00.000+00'::timestamptz, '11月スケジュール 【お詫びと自主回収のお知らせ】Specialty Supplement Hematite BCAA／Obsidian BCAA+ （更新：2025年6月5日） キッズスクール開校 月パスについて ディーボルダリングプラ…', 0.60::numeric, 'pending', 'ディーボルダリングプラス八千代公式施設紹介の公式サイトからイベント候補を検出。日付候補は2025/06/05。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 11月スケジュール 【お詫びと自主回収のお知らせ】Specialty Supplement Hematite BCAA／Obsidian BCAA+ （更新：2025年6月5日） キッズスクール開校 月パスについて ディーボルダリングプラ…'),
    ('d-bouldering-plus-yachiyo', 'https://www.d-b-c.jp/yachiyo-news/facility#zac-2025-12-20-private_booking-3', 'official-site:d-bouldering-plus-yachiyo:2025-12-20:private_booking:3', 'private_booking', 'ディーボルダリングプラス八千代公式施設紹介 施設のご紹介', 'ディーボルダリングプラス八千代公式施設紹介の公式情報に基づく2025/12/20の貸切・利用制限情報です。一般利用への影響は公式情報で確認してください。', '2025-12-20 01:00:00.000+00'::timestamptz, '2025-12-20 02:00:00.000+00'::timestamptz, '：2025年6月5日） キッズスクール開校 月パスについて ディーボルダリングプラス八千代【施設のご紹介】 春の習いごとはじめ応援キャンペーン 月別アーカイブ 2025年12月 2025年11月 2025年6月 2025年2月 2025年…', 0.60::numeric, 'pending', 'ディーボルダリングプラス八千代公式施設紹介の公式サイトから貸切・利用制限候補を検出。日付候補は2025/12/20。Adminで貸切日時、一般利用への影響を確認してください。根拠抜粋: ：2025年6月5日） キッズスクール開校 月パスについて ディーボルダリングプラス八千代【施設のご紹介】 春の習いごとはじめ応援キャンペーン 月別アーカイブ 2025年12月 2025年11月 2025年6月 2025年2月 2025年…'),
    ('energy-climbing-urawa', 'https://energy-climbing.co.jp/urawa/#zac-2026-04-30-opening_change-1', 'official-site:energy-climbing-urawa:2026-04-30:opening_change:1', 'opening_change', 'エナジークライミングジム浦和店 年パス10％OFF', 'エナジークライミングジム浦和店の公式情報に基づく2026/04/30の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-30 01:00:00.000+00'::timestamptz, '2026-04-30 02:00:00.000+00'::timestamptz, '蔵野線、武蔵浦和駅より徒歩8分 TEL 048-838-1850 駐車場 敷地内無料17台分あり 施設 トップロープ・リード・ボルダリング お知らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 20…', 0.60::numeric, 'pending', 'エナジークライミングジム浦和店公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/30。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 蔵野線、武蔵浦和駅より徒歩8分 TEL 048-838-1850 駐車場 敷地内無料17台分あり 施設 トップロープ・リード・ボルダリング お知らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 20…'),
    ('energy-climbing-urawa', 'https://energy-climbing.co.jp/urawa/#zac-2025-12-27-opening_change-2', 'official-site:energy-climbing-urawa:2025-12-27:opening_change:2', 'opening_change', 'エナジークライミングジム浦和店 年パス10％OFF', 'エナジークライミングジム浦和店の公式情報に基づく2025/12/27の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2025-12-27 01:00:00.000+00'::timestamptz, '2025-12-27 02:00:00.000+00'::timestamptz, '敷地内無料17台分あり 施設 トップロープ・リード・ボルダリング お知らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 2025.12.27 浦和店のお知らせ 年末年始の営業時間のお知らせ 2025…', 0.60::numeric, 'pending', 'エナジークライミングジム浦和店公式サイトから営業時間・休業変更候補を検出。日付候補は2025/12/27。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 敷地内無料17台分あり 施設 トップロープ・リード・ボルダリング お知らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 2025.12.27 浦和店のお知らせ 年末年始の営業時間のお知らせ 2025…'),
    ('energy-climbing-urawa', 'https://energy-climbing.co.jp/urawa/#zac-2025-01-14-route_set-3', 'official-site:energy-climbing-urawa:2025-01-14:route_set:3', 'route_set', 'エナジークライミングジム浦和店 年パス10％OFF', 'エナジークライミングジム浦和店の公式情報に基づく2025/01/14のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2025-01-14 01:00:00.000+00'::timestamptz, '2025-01-14 02:00:00.000+00'::timestamptz, 'らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 2025.12.27 浦和店のお知らせ 年末年始の営業時間のお知らせ 2025.01.14 浦和店のお知らせ 「年パス10％OFF」キャンペーンのお…', 0.60::numeric, 'pending', 'エナジークライミングジム浦和店公式サイトからセット・ホールド替え候補を検出。日付候補は2025/01/14。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 2025.12.27 浦和店のお知らせ 年末年始の営業時間のお知らせ 2025.01.14 浦和店のお知らせ 「年パス10％OFF」キャンペーンのお…'),
    ('jam-session-mitaka', 'https://xn--xckbj6a9jra6a4gy403a4b6j.com/#zac-2026-05-10-opening_change-1', 'official-site:jam-session-mitaka:2026-05-10:opening_change:1', 'opening_change', 'ジャムセッション三鷹 外岩クラック講習（8月、9月、10月）参加募集', 'ジャムセッション三鷹の公式情報に基づく2026/05/10の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-05-10 01:00:00.000+00'::timestamptz, '2026-05-10 02:00:00.000+00'::timestamptz, 'クライミングを楽しめます。 癒しの木造内装 ジムの内装には木を多く使っています。さわやかな木の香りが気持ちをリラックスさせてくれます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 20…', 0.60::numeric, 'pending', 'ジャムセッション三鷹公式サイトから営業時間・休業変更候補を検出。日付候補は2026/05/10。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: クライミングを楽しめます。 癒しの木造内装 ジムの内装には木を多く使っています。さわやかな木の香りが気持ちをリラックスさせてくれます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 20…'),
    ('jam-session-mitaka', 'https://xn--xckbj6a9jra6a4gy403a4b6j.com/#zac-2026-05-04-opening_change-2', 'official-site:jam-session-mitaka:2026-05-04:opening_change:2', 'opening_change', 'ジャムセッション三鷹 外岩クラック講習（8月、9月、10月）参加募集', 'ジャムセッション三鷹の公式情報に基づく2026/05/04の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-05-04 01:00:00.000+00'::timestamptz, '2026-05-04 02:00:00.000+00'::timestamptz, 'ます。さわやかな木の香りが気持ちをリラックスさせてくれます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 2026年5月4日 【スタッフ／アルバイト募集中】 2026年4月29日 【ゴ…', 0.60::numeric, 'pending', 'ジャムセッション三鷹公式サイトから営業時間・休業変更候補を検出。日付候補は2026/05/04。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ます。さわやかな木の香りが気持ちをリラックスさせてくれます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 2026年5月4日 【スタッフ／アルバイト募集中】 2026年4月29日 【ゴ…'),
    ('jam-session-mitaka', 'https://xn--xckbj6a9jra6a4gy403a4b6j.com/#zac-2026-04-29-opening_change-3', 'official-site:jam-session-mitaka:2026-04-29:opening_change:3', 'opening_change', 'ジャムセッション三鷹 外岩クラック講習（8月、9月、10月）参加募集', 'ジャムセッション三鷹の公式情報に基づく2026/04/29の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-29 01:00:00.000+00'::timestamptz, '2026-04-29 02:00:00.000+00'::timestamptz, 'れます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 2026年5月4日 【スタッフ／アルバイト募集中】 2026年4月29日 【ゴールデンウイークの営業時間】 2026年4月22日 …', 0.60::numeric, 'pending', 'ジャムセッション三鷹公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/29。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: れます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 2026年5月4日 【スタッフ／アルバイト募集中】 2026年4月29日 【ゴールデンウイークの営業時間】 2026年4月22日 …'),
    ('penguin-climb', 'https://penguin-climb.com/#zac-2025-12-06-event-1', 'official-site:penguin-climb:2025-12-06:event:1', 'event', 'クライミングジムPenguin 1時間体験プラン', 'クライミングジムPenguinの公式情報に基づく2025/12/06のイベント情報です。内容や参加条件は公式情報で確認してください。', '2025-12-06 01:00:00.000+00'::timestamptz, '2025-12-06 02:00:00.000+00'::timestamptz, 'nners 料金案内 Price 施設案内 Gym スタッフ紹介 Staff アクセス Access お問い合わせ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 …', 0.60::numeric, 'pending', 'クライミングジムPenguin公式サイトからイベント候補を検出。日付候補は2025/12/06。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: nners 料金案内 Price 施設案内 Gym スタッフ紹介 Staff アクセス Access お問い合わせ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 …'),
    ('penguin-climb', 'https://penguin-climb.com/#zac-2025-12-06-event-2', 'official-site:penguin-climb:2025-12-06:event:2', 'event', 'クライミングジムPenguin 1時間体験プラン', 'クライミングジムPenguinの公式情報に基づく2025/12/06のイベント情報です。内容や参加条件は公式情報で確認してください。', '2025-12-06 01:00:00.000+00'::timestamptz, '2025-12-06 02:00:00.000+00'::timestamptz, 'ッフ紹介 Staff アクセス Access お問い合わせ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 ペンギン・キッズスクールのご案内 2025年12月6日 …', 0.60::numeric, 'pending', 'クライミングジムPenguin公式サイトからイベント候補を検出。日付候補は2025/12/06。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: ッフ紹介 Staff アクセス Access お問い合わせ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 ペンギン・キッズスクールのご案内 2025年12月6日 …'),
    ('penguin-climb', 'https://penguin-climb.com/#zac-2025-12-06-event-3', 'official-site:penguin-climb:2025-12-06:event:3', 'event', 'クライミングジムPenguin 1時間体験プラン', 'クライミングジムPenguinの公式情報に基づく2025/12/06のイベント情報です。内容や参加条件は公式情報で確認してください。', '2025-12-06 01:00:00.000+00'::timestamptz, '2025-12-06 02:00:00.000+00'::timestamptz, 'せ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 ペンギン・キッズスクールのご案内 2025年12月6日 ペンギン・マンツーマンレッスンのご案内 2026年5月6…', 0.60::numeric, 'pending', 'クライミングジムPenguin公式サイトからイベント候補を検出。日付候補は2025/12/06。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: せ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 ペンギン・キッズスクールのご案内 2025年12月6日 ペンギン・マンツーマンレッスンのご案内 2026年5月6…')
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
  '2026-05-18 15:18:43.306+00'::timestamptz,
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
