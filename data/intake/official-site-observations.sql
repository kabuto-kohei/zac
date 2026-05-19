-- Official-site observations generated from official-site fallback queues.
-- Generated: 2026-05-18T23:55:00.954Z
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

WITH checked_sources (handle, source_url) AS (
  VALUES
    ('b-pump-ogikubo', 'https://pump-climbing.com/gym/bpump/'),
    ('berry-wall', 'https://www.berrywall.com/'),
    ('climbing-aska', 'https://climbing-aska.com/'),
    ('climbing-gym-cell', 'https://www.climb-cell.com/'),
    ('d-bouldering-plus-lead-kaihin-makuhari', 'https://www.d-b-c.jp/top/kaihin-makuhari/'),
    ('kazo-citizen-gymnasium', 'https://www.city.kazo.lg.jp/benriservice/map/shisetsu/sisetugaiyou_supotu/30292.html')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-18 23:55:00.954+00'::timestamptz,
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
    ('b-pump-ogikubo', 'https://pump-climbing.com/gym/bpump/#zac-2022-04-18-competition-1', 'official-site:b-pump-ogikubo:2022-04-18:competition:1', 'competition', 'B-PUMP OGIKUBO HELLO CLIMBER', 'B-PUMP OGIKUBOの公式情報に基づく2022/04/18のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2022-04-18 01:00:00.000+00'::timestamptz, '2022-04-18 02:00:00.000+00'::timestamptz, 'したB-PUMP荻窪のDNA。 「HELLO CLIMBER」 純度100%のボルダリングへようこそ。 営業ガイダンス（最新版） Routes 130 New 2022/4/18 COMPETITION WALL Next 2022/4/…', 0.60::numeric, 'pending', 'B-PUMP OGIKUBO 公式サイトからコンペ・大会候補を検出。日付候補は2022/04/18。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: したB-PUMP荻窪のDNA。 「HELLO CLIMBER」 純度100%のボルダリングへようこそ。 営業ガイダンス（最新版） Routes 130 New 2022/4/18 COMPETITION WALL Next 2022/4/…'),
    ('b-pump-ogikubo', 'https://pump-climbing.com/gym/bpump/#zac-2022-04-25-competition-2', 'official-site:b-pump-ogikubo:2022-04-25:competition:2', 'competition', 'B-PUMP OGIKUBO 開催発表', 'B-PUMP OGIKUBOの公式情報に基づく2022/04/25のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2022-04-25 01:00:00.000+00'::timestamptz, '2022-04-25 02:00:00.000+00'::timestamptz, '純度100%のボルダリングへようこそ。 営業ガイダンス（最新版） Routes 130 New 2022/4/18 COMPETITION WALL Next 2022/4/25,26 ROCKLANDS WALL PICK UP NEW…', 0.60::numeric, 'pending', 'B-PUMP OGIKUBO 公式サイトからコンペ・大会候補を検出。日付候補は2022/04/25。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: 純度100%のボルダリングへようこそ。 営業ガイダンス（最新版） Routes 130 New 2022/4/18 COMPETITION WALL Next 2022/4/25,26 ROCKLANDS WALL PICK UP NEW…'),
    ('b-pump-ogikubo', 'https://pump-climbing.com/gym/bpump/#zac-2026-04-27-opening_change-3', 'official-site:b-pump-ogikubo:2026-04-27:opening_change:3', 'opening_change', 'B-PUMP OGIKUBO ENTRY', 'B-PUMP OGIKUBOの公式情報に基づく2026/04/27の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-27 01:00:00.000+00'::timestamptz, '2026-04-27 02:00:00.000+00'::timestamptz, 'ンセプトは「クライミングを愛する誰もが楽しめる [&hellip;] 【ENTRY】THE6 -BEGINNING OF THE HISTORY- Vol.4 2026.04.27 BLOG NEWS EVENT NEWS THE6 -B…', 0.60::numeric, 'pending', 'B-PUMP OGIKUBO 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/27。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ンセプトは「クライミングを愛する誰もが楽しめる [&hellip;] 【ENTRY】THE6 -BEGINNING OF THE HISTORY- Vol.4 2026.04.27 BLOG NEWS EVENT NEWS THE6 -B…'),
    ('berry-wall', 'https://www.berrywall.com/#zac-2025-07-01-event-1', 'official-site:berry-wall:2025-07-01:event:1', 'event', 'BERRY WALL Climbing Gym 07/01 イベント', 'BERRY WALL Climbing Gymの公式情報に基づく2025/07/01のイベント情報です。内容や参加条件は公式情報で確認してください。', '2025-07-01 01:00:00.000+00'::timestamptz, '2025-07-01 02:00:00.000+00'::timestamptz, 'ンクラスから競技を目指すアスリートクラスまでレベルに合わせて開催！！ 詳しくはこちら 体験コース案内 まずはクライミングを体験してみよう！! 詳しくはこちら ※2025年7月1日よりフリータイム（デイタイム）およびジュニアクライミングスク…', 0.60::numeric, 'pending', 'BERRY WALL Climbing Gym 公式サイトからイベント候補を検出。日付候補は2025/07/01。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: ンクラスから競技を目指すアスリートクラスまでレベルに合わせて開催！！ 詳しくはこちら 体験コース案内 まずはクライミングを体験してみよう！! 詳しくはこちら ※2025年7月1日よりフリータイム（デイタイム）およびジュニアクライミングスク…'),
    ('berry-wall', 'https://www.berrywall.com/#zac-2026-04-28-route_set-2', 'official-site:berry-wall:2026-04-28:route_set:2', 'route_set', 'BERRY WALL Climbing Gym 04/28 セット', 'BERRY WALL Climbing Gymの公式情報に基づく2026/04/28のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-04-28 01:00:00.000+00'::timestamptz, '2026-04-28 02:00:00.000+00'::timestamptz, '入っていないときはスタッフが不在になる場合があります。 ※最終枠に予約がないときは、最終枠予約受付終了後はスタッフが不在になる場合があります。 営業カレンダー 2026年4月28日 / 最終更新日 : 2026年4月28日 BERRYWA…', 0.60::numeric, 'pending', 'BERRY WALL Climbing Gym 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/04/28。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: 入っていないときはスタッフが不在になる場合があります。 ※最終枠に予約がないときは、最終枠予約受付終了後はスタッフが不在になる場合があります。 営業カレンダー 2026年4月28日 / 最終更新日 : 2026年4月28日 BERRYWA…'),
    ('berry-wall', 'https://www.berrywall.com/#zac-2026-04-28-route_set-3', 'official-site:berry-wall:2026-04-28:route_set:3', 'route_set', 'BERRY WALL Climbing Gym 04/28 セット', 'BERRY WALL Climbing Gymの公式情報に基づく2026/04/28のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-04-28 01:00:00.000+00'::timestamptz, '2026-04-28 02:00:00.000+00'::timestamptz, 'があります。 ※最終枠に予約がないときは、最終枠予約受付終了後はスタッフが不在になる場合があります。 営業カレンダー 2026年4月28日 / 最終更新日 : 2026年4月28日 BERRYWALL お知らせ セット替えのお知らせ 5月…', 0.60::numeric, 'pending', 'BERRY WALL Climbing Gym 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/04/28。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: があります。 ※最終枠に予約がないときは、最終枠予約受付終了後はスタッフが不在になる場合があります。 営業カレンダー 2026年4月28日 / 最終更新日 : 2026年4月28日 BERRYWALL お知らせ セット替えのお知らせ 5月…'),
    ('d-bouldering-plus-lead-kaihin-makuhari', 'https://www.d-b-c.jp/top/kaihin-makuhari/#zac-2026-04-27-private_booking-1', 'official-site:d-bouldering-plus-lead-kaihin-makuhari:2026-04-27:private_booking:1', 'private_booking', 'D.Bouldering Plus Lead 海浜幕張 2026/04/27 貸切', 'D.Bouldering Plus Lead 海浜幕張の公式情報に基づく2026/04/27の貸切・利用制限情報です。一般利用への影響は公式情報で確認してください。', '2026-04-27 01:00:00.000+00'::timestamptz, '2026-04-27 02:00:00.000+00'::timestamptz, 'E 料金案内 はじめての方へ お子さまのご利用 キッズスクール 施設のご紹介 ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース & キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026…', 0.60::numeric, 'pending', 'D.Bouldering Plus Lead 海浜幕張公式サイトから貸切・利用制限候補を検出。日付候補は2026/04/27。Adminで貸切日時、一般利用への影響を確認してください。根拠抜粋: E 料金案内 はじめての方へ お子さまのご利用 キッズスクール 施設のご紹介 ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース & キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026…'),
    ('d-bouldering-plus-lead-kaihin-makuhari', 'https://www.d-b-c.jp/top/kaihin-makuhari/#zac-2026-04-26-private_booking-2', 'official-site:d-bouldering-plus-lead-kaihin-makuhari:2026-04-26:private_booking:2', 'private_booking', 'D.Bouldering Plus Lead 海浜幕張 2026/04/26 貸切', 'D.Bouldering Plus Lead 海浜幕張の公式情報に基づく2026/04/26の貸切・利用制限情報です。一般利用への影響は公式情報で確認してください。', '2026-04-26 01:00:00.000+00'::timestamptz, '2026-04-26 02:00:00.000+00'::timestamptz, 'ご紹介 ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース & キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026.04.26 &#x1f38f;５月のカレンダー&#x1f38f; 2…', 0.60::numeric, 'pending', 'D.Bouldering Plus Lead 海浜幕張公式サイトから貸切・利用制限候補を検出。日付候補は2026/04/26。Adminで貸切日時、一般利用への影響を確認してください。根拠抜粋: ご紹介 ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース & キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026.04.26 &#x1f38f;５月のカレンダー&#x1f38f; 2…'),
    ('d-bouldering-plus-lead-kaihin-makuhari', 'https://www.d-b-c.jp/top/kaihin-makuhari/#zac-2026-03-31-event-3', 'official-site:d-bouldering-plus-lead-kaihin-makuhari:2026-03-31:event:3', 'event', 'D.Bouldering Plus Lead 海浜幕張 03/31 イベント', 'D.Bouldering Plus Lead 海浜幕張の公式情報に基づく2026/03/31のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-03-31 01:00:00.000+00'::timestamptz, '2026-03-31 02:00:00.000+00'::timestamptz, 'キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026.04.26 &#x1f38f;５月のカレンダー&#x1f38f; 2026.03.31 &#x1f338;４月のカレンダー&#x1f338; R…', 0.60::numeric, 'pending', 'D.Bouldering Plus Lead 海浜幕張公式サイトからイベント候補を検出。日付候補は2026/03/31。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026.04.26 &#x1f38f;５月のカレンダー&#x1f38f; 2026.03.31 &#x1f338;４月のカレンダー&#x1f338; R…'),
    ('kazo-citizen-gymnasium', 'https://www.city.kazo.lg.jp/benriservice/map/shisetsu/sisetugaiyou_supotu/30292.html#zac-2022-04-01-event-1', 'official-site:kazo-citizen-gymnasium:2022-04-01:event:1', 'event', '加須市民体育館 04/01 イベント', '加須市民体育館の公式情報に基づく2022/04/01のイベント情報です。内容や参加条件は公式情報で確認してください。', '2022-04-01 01:00:00.000+00'::timestamptz, '2022-04-01 02:00:00.000+00'::timestamptz, ';&#3618; 翻訳 PC版で表示する 現在のページ ホーム 便利サービス 施設案内 施設概要 スポーツ 加須市民体育館 加須市民体育館 Tweet 更新日：2022年04月01日 加須市民体育館 加須市民体育館にはアリーナ（バレーコー…', 0.60::numeric, 'pending', '加須市民体育館公式ページの公式サイトからイベント候補を検出。日付候補は2022/04/01。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: ;&#3618; 翻訳 PC版で表示する 現在のページ ホーム 便利サービス 施設案内 施設概要 スポーツ 加須市民体育館 加須市民体育館 Tweet 更新日：2022年04月01日 加須市民体育館 加須市民体育館にはアリーナ（バレーコー…'),
    ('kazo-citizen-gymnasium', 'https://www.city.kazo.lg.jp/benriservice/map/shisetsu/sisetugaiyou_supotu/30292.html#zac-2026-03-06-event-2', 'official-site:kazo-citizen-gymnasium:2026-03-06:event:2', 'event', '加須市民体育館 03/06 イベント', '加須市民体育館の公式情報に基づく2026/03/06のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-03-06 01:00:00.000+00'::timestamptz, '2026-03-06 02:00:00.000+00'::timestamptz, '3分割電動可動式 2面 高さ13.0メートル×幅4.0メートル 2分割電動可動式 2面 高さ12.0メートル×幅4.0メートル ボルダ－（練習用）壁 1面 高さ3.6メートル×幅5.0メートル 卓球室 5台 18mメートル×12メートル …', 0.60::numeric, 'pending', '加須市民体育館公式ページの公式サイトからイベント候補を検出。日付候補は2026/03/06。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 3分割電動可動式 2面 高さ13.0メートル×幅4.0メートル 2分割電動可動式 2面 高さ12.0メートル×幅4.0メートル ボルダ－（練習用）壁 1面 高さ3.6メートル×幅5.0メートル 卓球室 5台 18mメートル×12メートル …'),
    ('kazo-citizen-gymnasium', 'https://www.city.kazo.lg.jp/benriservice/map/shisetsu/sisetugaiyou_supotu/30292.html#zac-2026-01-02-event-3', 'official-site:kazo-citizen-gymnasium:2026-01-02:event:3', 'event', '加須市民体育館 01/02 イベント', '加須市民体育館の公式情報に基づく2026/01/02のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-01-02 01:00:00.000+00'::timestamptz, '2026-01-02 02:00:00.000+00'::timestamptz, '金額の約半額になります。 予約、当日利用申請は原則2時間までとなります。（延長の場合は当日施設が空いていれ ば可、再度申請が必要となります。） 市内学生は上記の1/2の料金となります。 市外料金は上記の1．5倍となります。 いずれも用具（…', 0.60::numeric, 'pending', '加須市民体育館公式ページの公式サイトからイベント候補を検出。日付候補は2026/01/02。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 金額の約半額になります。 予約、当日利用申請は原則2時間までとなります。（延長の場合は当日施設が空いていれ ば可、再度申請が必要となります。） 市内学生は上記の1/2の料金となります。 市外料金は上記の1．5倍となります。 いずれも用具（…')
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
  '2026-05-18 23:55:00.954+00'::timestamptz,
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
