-- Official-site observations generated from official-site fallback queues.
-- Generated: 2026-05-26T10:32:09.226Z
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

WITH checked_sources (handle, source_url) AS (
  VALUES
    ('beta-climbing', 'https://beta-climbing.com/'),
    ('boulcom-kawasaki', 'https://boulcom.jp/kawasaki/'),
    ('boulcom-tokyo', 'https://boulcom.jp/tokyo/'),
    ('rocky-climbing', 'https://www.rockyclimbing.com/'),
    ('aladdin-climbing', 'https://www7a.biglobe.ne.jp/~aladdinclimbing/'),
    ('altior-gym', 'https://altior-gym.com/'),
    ('dogwood-climbing-gym', 'https://dogwood-climbing.jp/'),
    ('and-energy-bouldering', 'https://www.andenergy-bouldering.com/'),
    ('aoroc', 'https://aoroc.jp/'),
    ('be-born', 'https://beborn.boy.jp/'),
    ('headrock-climbing', 'https://headrock-climbing.com/'),
    ('limestone-climbing-club', 'https://www.limestone.jp/'),
    ('lutra-lutra', 'https://www.lutra-lutra.com/')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-26 10:32:09.226+00'::timestamptz,
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
    ('boulcom-kawasaki', 'https://boulcom.jp/kawasaki/#zac-2026-02-07-private_booking-1', 'official-site:boulcom-kawasaki:2026-02-07:private_booking:1', 'private_booking', 'BOULCOM 川崎店 東京店', 'BOULCOM 川崎店の公式情報に基づく2026/02/07の貸切・利用制限情報です。一般利用への影響は公式情報で確認してください。', '2026-02-07 01:00:00.000+00'::timestamptz, '2026-02-07 02:00:00.000+00'::timestamptz, 'せ , &#8230; 【東京店】【川崎店】スタッフ募集のお知らせ 5 13 Read More キャンペーン , &#8230; スタートアップキャンペーン(2/7~3/31) 2 6 Read More お知らせ , &#8230; …', 0.60::numeric, 'pending', 'BOULCOM 川崎店 公式サイトから貸切・利用制限候補を検出。日付候補は2026/02/07。Adminで貸切日時、一般利用への影響を確認してください。根拠抜粋: せ , &#8230; 【東京店】【川崎店】スタッフ募集のお知らせ 5 13 Read More キャンペーン , &#8230; スタートアップキャンペーン(2/7~3/31) 2 6 Read More お知らせ , &#8230; …'),
    ('boulcom-kawasaki', 'https://boulcom.jp/kawasaki/#zac-2026-03-31-private_booking-2', 'official-site:boulcom-kawasaki:2026-03-31:private_booking:2', 'private_booking', 'BOULCOM 川崎店 東京店', 'BOULCOM 川崎店の公式情報に基づく2026/03/31の貸切・利用制限情報です。一般利用への影響は公式情報で確認してください。', '2026-03-31 01:00:00.000+00'::timestamptz, '2026-03-31 02:00:00.000+00'::timestamptz, '&#8230; 【東京店】【川崎店】スタッフ募集のお知らせ 5 13 Read More キャンペーン , &#8230; スタートアップキャンペーン(2/7~3/31) 2 6 Read More お知らせ , &#8230; 【川崎店…', 0.60::numeric, 'pending', 'BOULCOM 川崎店 公式サイトから貸切・利用制限候補を検出。日付候補は2026/03/31。Adminで貸切日時、一般利用への影響を確認してください。根拠抜粋: &#8230; 【東京店】【川崎店】スタッフ募集のお知らせ 5 13 Read More キャンペーン , &#8230; スタートアップキャンペーン(2/7~3/31) 2 6 Read More お知らせ , &#8230; 【川崎店…'),
    ('boulcom-kawasaki', 'https://boulcom.jp/kawasaki/#zac-2026-02-23-private_booking-3', 'official-site:boulcom-kawasaki:2026-02-23:private_booking:3', 'private_booking', 'BOULCOM 川崎店 川崎店', 'BOULCOM 川崎店の公式情報に基づく2026/02/23の貸切・利用制限情報です。一般利用への影響は公式情報で確認してください。', '2026-02-23 01:00:00.000+00'::timestamptz, '2026-02-23 02:00:00.000+00'::timestamptz, ', &#8230; スタートアップキャンペーン(2/7~3/31) 2 6 Read More お知らせ , &#8230; 【川崎店】全面HOLD替えに伴う2/23(月)～2/25(水)の営業時間変更のお知らせ 2 4 Read Mor…', 0.60::numeric, 'pending', 'BOULCOM 川崎店 公式サイトから貸切・利用制限候補を検出。日付候補は2026/02/23。Adminで貸切日時、一般利用への影響を確認してください。根拠抜粋: , &#8230; スタートアップキャンペーン(2/7~3/31) 2 6 Read More お知らせ , &#8230; 【川崎店】全面HOLD替えに伴う2/23(月)～2/25(水)の営業時間変更のお知らせ 2 4 Read Mor…'),
    ('boulcom-tokyo', 'https://boulcom.jp/tokyo/#zac-2026-06-06-competition-1', 'official-site:boulcom-tokyo:2026-06-06:competition:1', 'competition', 'BOULCOM 東京店 BOULコン', 'BOULCOM 東京店の公式情報に基づく2026/06/06のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-06-06 01:00:00.000+00'::timestamptz, '2026-06-06 02:00:00.000+00'::timestamptz, '用情報 問合せ BOULCOM 東京店 ALL 東京店のお知らせ 東京店のキャンペーン Read More 東京店のお知らせ 「BOULコン」エントリー受付中！6/6 東京店 ボルダリングコンペ 5 13 Read More 川崎店のお知…', 0.60::numeric, 'pending', 'BOULCOM 東京店 公式サイトからコンペ・大会候補を検出。日付候補は2026/06/06。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: 用情報 問合せ BOULCOM 東京店 ALL 東京店のお知らせ 東京店のキャンペーン Read More 東京店のお知らせ 「BOULコン」エントリー受付中！6/6 東京店 ボルダリングコンペ 5 13 Read More 川崎店のお知…'),
    ('boulcom-tokyo', 'https://boulcom.jp/tokyo/#zac-2026-04-11-opening_change-2', 'official-site:boulcom-tokyo:2026-04-11:opening_change:2', 'opening_change', 'BOULCOM 東京店 東京店', 'BOULCOM 東京店の公式情報に基づく2026/04/11の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-11 01:00:00.000+00'::timestamptz, '2026-04-11 02:00:00.000+00'::timestamptz, 'Read More 川崎店のお知らせ , &#8230; 【東京店】【川崎店】スタッフ募集のお知らせ 5 13 Read More 東京店のお知らせ 【東京店】4/11(土)営業時間変更のお知らせ 3 31 Read More キャンペー…', 0.60::numeric, 'pending', 'BOULCOM 東京店 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/11。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: Read More 川崎店のお知らせ , &#8230; 【東京店】【川崎店】スタッフ募集のお知らせ 5 13 Read More 東京店のお知らせ 【東京店】4/11(土)営業時間変更のお知らせ 3 31 Read More キャンペー…'),
    ('boulcom-tokyo', 'https://boulcom.jp/tokyo/#zac-2026-02-07-competition-3', 'official-site:boulcom-tokyo:2026-02-07:competition:3', 'competition', 'BOULCOM 東京店 東京店', 'BOULCOM 東京店の公式情報に基づく2026/02/07のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-02-07 01:00:00.000+00'::timestamptz, '2026-02-07 02:00:00.000+00'::timestamptz, '東京店のお知らせ 【東京店】4/11(土)営業時間変更のお知らせ 3 31 Read More キャンペーン , &#8230; スタートアップキャンペーン(2/7~3/31) 2 6 Read More お知らせ , &#8230; 【…', 0.60::numeric, 'pending', 'BOULCOM 東京店 公式サイトからコンペ・大会候補を検出。日付候補は2026/02/07。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: 東京店のお知らせ 【東京店】4/11(土)営業時間変更のお知らせ 3 31 Read More キャンペーン , &#8230; スタートアップキャンペーン(2/7~3/31) 2 6 Read More お知らせ , &#8230; 【…'),
    ('rocky-climbing', 'https://www.rockyclimbing.com/#zac-2025-12-15-opening_change-1', 'official-site:rocky-climbing:2025-12-15:opening_change:1', 'opening_change', 'ROCKY Climbing & Fitness Gym 12/15 営業変更', 'ROCKY Climbing & Fitness Gymの公式情報に基づく2025/12/15の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2025-12-15 01:00:00.000+00'::timestamptz, '2025-12-15 02:00:00.000+00'::timestamptz, 'ッズスクール お子様のご利用について JPN ENG ビギナーやキッズ向け課題も豊富！ 首都圏に６店舗の 大型クライミングジム 初めての方はこちらをCheck 2025/12/15 料金改定のお知らせ 2025/7/27 お盆期間営業時間…', 0.60::numeric, 'pending', 'ROCKY Climbing & Fitness Gym 公式サイトから営業時間・休業変更候補を検出。日付候補は2025/12/15。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ッズスクール お子様のご利用について JPN ENG ビギナーやキッズ向け課題も豊富！ 首都圏に６店舗の 大型クライミングジム 初めての方はこちらをCheck 2025/12/15 料金改定のお知らせ 2025/7/27 お盆期間営業時間…'),
    ('rocky-climbing', 'https://www.rockyclimbing.com/#zac-2025-07-27-opening_change-2', 'official-site:rocky-climbing:2025-07-27:opening_change:2', 'opening_change', 'ROCKY Climbing & Fitness Gym 07/27 営業変更', 'ROCKY Climbing & Fitness Gymの公式情報に基づく2025/07/27の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2025-07-27 01:00:00.000+00'::timestamptz, '2025-07-27 02:00:00.000+00'::timestamptz, 'N ENG ビギナーやキッズ向け課題も豊富！ 首都圏に６店舗の 大型クライミングジム 初めての方はこちらをCheck 2025/12/15 料金改定のお知らせ 2025/7/27 お盆期間営業時間のご案内 2025/7/17 メンバーシッ…', 0.60::numeric, 'pending', 'ROCKY Climbing & Fitness Gym 公式サイトから営業時間・休業変更候補を検出。日付候補は2025/07/27。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: N ENG ビギナーやキッズ向け課題も豊富！ 首都圏に６店舗の 大型クライミングジム 初めての方はこちらをCheck 2025/12/15 料金改定のお知らせ 2025/7/27 お盆期間営業時間のご案内 2025/7/17 メンバーシッ…'),
    ('rocky-climbing', 'https://www.rockyclimbing.com/#zac-2025-07-17-opening_change-3', 'official-site:rocky-climbing:2025-07-17:opening_change:3', 'opening_change', 'ROCKY Climbing & Fitness Gym 07/17 営業変更', 'ROCKY Climbing & Fitness Gymの公式情報に基づく2025/07/17の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2025-07-17 01:00:00.000+00'::timestamptz, '2025-07-17 02:00:00.000+00'::timestamptz, '首都圏に６店舗の 大型クライミングジム 初めての方はこちらをCheck 2025/12/15 料金改定のお知らせ 2025/7/27 お盆期間営業時間のご案内 2025/7/17 メンバーシップ物販割引率変更のお知らせ 2025/3/14…', 0.60::numeric, 'pending', 'ROCKY Climbing & Fitness Gym 公式サイトから営業時間・休業変更候補を検出。日付候補は2025/07/17。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 首都圏に６店舗の 大型クライミングジム 初めての方はこちらをCheck 2025/12/15 料金改定のお知らせ 2025/7/27 お盆期間営業時間のご案内 2025/7/17 メンバーシップ物販割引率変更のお知らせ 2025/3/14…'),
    ('dogwood-climbing-gym', 'https://dogwood-climbing.jp/#zac-2026-04-26-event-1', 'official-site:dogwood-climbing-gym:2026-04-26:event:1', 'event', 'DOGWOOD Climbing Gym 04/26 イベント', 'DOGWOOD Climbing Gymの公式情報に基づく2026/04/26のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-04-26 01:00:00.000+00'::timestamptz, '2026-04-26 02:00:00.000+00'::timestamptz, '。 クライミング初心者の方には登る楽しみを、 また上級者の方には他のジムにはない 面白い課題を提供し続けます。 NEWS キッズスクール入会金無料キャンペーン 2026年4月26日 3月 カレンダー 2025年3月19日 2月 カレンダー…', 0.60::numeric, 'pending', 'DOGWOOD Climbing Gym 公式サイトからイベント候補を検出。日付候補は2026/04/26。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 。 クライミング初心者の方には登る楽しみを、 また上級者の方には他のジムにはない 面白い課題を提供し続けます。 NEWS キッズスクール入会金無料キャンペーン 2026年4月26日 3月 カレンダー 2025年3月19日 2月 カレンダー…'),
    ('dogwood-climbing-gym', 'https://dogwood-climbing.jp/#zac-2025-03-19-event-2', 'official-site:dogwood-climbing-gym:2025-03-19:event:2', 'event', 'DOGWOOD Climbing Gym 03/19 イベント', 'DOGWOOD Climbing Gymの公式情報に基づく2025/03/19のイベント情報です。内容や参加条件は公式情報で確認してください。', '2025-03-19 01:00:00.000+00'::timestamptz, '2025-03-19 02:00:00.000+00'::timestamptz, 'を、 また上級者の方には他のジムにはない 面白い課題を提供し続けます。 NEWS キッズスクール入会金無料キャンペーン 2026年4月26日 3月 カレンダー 2025年3月19日 2月 カレンダー 2025年2月3日 1月 カレンダー …', 0.60::numeric, 'pending', 'DOGWOOD Climbing Gym 公式サイトからイベント候補を検出。日付候補は2025/03/19。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: を、 また上級者の方には他のジムにはない 面白い課題を提供し続けます。 NEWS キッズスクール入会金無料キャンペーン 2026年4月26日 3月 カレンダー 2025年3月19日 2月 カレンダー 2025年2月3日 1月 カレンダー …'),
    ('dogwood-climbing-gym', 'https://dogwood-climbing.jp/#zac-2025-02-03-event-3', 'official-site:dogwood-climbing-gym:2025-02-03:event:3', 'event', 'DOGWOOD Climbing Gym 02/03 イベント', 'DOGWOOD Climbing Gymの公式情報に基づく2025/02/03のイベント情報です。内容や参加条件は公式情報で確認してください。', '2025-02-03 01:00:00.000+00'::timestamptz, '2025-02-03 02:00:00.000+00'::timestamptz, '面白い課題を提供し続けます。 NEWS キッズスクール入会金無料キャンペーン 2026年4月26日 3月 カレンダー 2025年3月19日 2月 カレンダー 2025年2月3日 1月 カレンダー 2025年1月30日 &copy; DOG…', 0.60::numeric, 'pending', 'DOGWOOD Climbing Gym 公式サイトからイベント候補を検出。日付候補は2025/02/03。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 面白い課題を提供し続けます。 NEWS キッズスクール入会金無料キャンペーン 2026年4月26日 3月 カレンダー 2025年3月19日 2月 カレンダー 2025年2月3日 1月 カレンダー 2025年1月30日 &copy; DOG…'),
    ('and-energy-bouldering', 'https://www.andenergy-bouldering.com/#zac-2025-02-28-opening_change-1', 'official-site:and-energy-bouldering:2025-02-28:opening_change:1', 'opening_change', 'And Energy Bouldering 02/28 営業変更', 'And Energy Boulderingの公式情報に基づく2025/02/28の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2025-02-28 01:00:00.000+00'::timestamptz, '2025-02-28 02:00:00.000+00'::timestamptz, 'お問い合わせ もっと見る Use tab to navigate through the menu items. And Energy Bouldering 2025.2.28 OPEN !! 初めての方はこちらをチェック！！ 🔰 初め…', 0.60::numeric, 'pending', 'And Energy Bouldering 公式サイトから営業時間・休業変更候補を検出。日付候補は2025/02/28。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: お問い合わせ もっと見る Use tab to navigate through the menu items. And Energy Bouldering 2025.2.28 OPEN !! 初めての方はこちらをチェック！！ 🔰 初め…'),
    ('be-born', 'https://beborn.boy.jp/#zac-2026-05-21-event-1', 'official-site:be-born:2026-05-21:event:1', 'event', 'Be born Climbing gym NEW 水曜初級クラス新設', 'Be born Climbing gymの公式情報に基づく2026/05/21のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-21 01:00:00.000+00'::timestamptz, '2026-05-21 02:00:00.000+00'::timestamptz, 'うお気をつけ下さい。 NEWS 2023夏休み企画 ビーボーンクライミングジム サマースクール！！ --> web Sportivaで当店が紹介されました！ (5/21)キッズスクール募集状況 進級に伴い、各クラス僅かに空もございます。 …', 0.60::numeric, 'pending', 'Be born Climbing gym 公式サイトからイベント候補を検出。日付候補は2026/05/21。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: うお気をつけ下さい。 NEWS 2023夏休み企画 ビーボーンクライミングジム サマースクール！！ --> web Sportivaで当店が紹介されました！ (5/21)キッズスクール募集状況 進級に伴い、各クラス僅かに空もございます。 …'),
    ('be-born', 'https://beborn.boy.jp/#zac-2026-11-02-opening_change-2', 'official-site:be-born:2026-11-02:opening_change:2', 'opening_change', 'Be born Climbing gym メディア出演情報', 'Be born Climbing gymの公式情報に基づく2026/11/02の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-11-02 01:00:00.000+00'::timestamptz, '2026-11-02 02:00:00.000+00'::timestamptz, 'もございます。 気になる方はこちら⇒ クリック 8月営業スケジュールのお知らせ！ お盆休みも毎日10時OPEN 詳しくはこちら⇒ クリック 【メディア出演情報】 11月2日(土)18：55～ TBS系列《炎の体育会TV》に当ジムとキッズス…', 0.60::numeric, 'pending', 'Be born Climbing gym 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/11/02。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: もございます。 気になる方はこちら⇒ クリック 8月営業スケジュールのお知らせ！ お盆休みも毎日10時OPEN 詳しくはこちら⇒ クリック 【メディア出演情報】 11月2日(土)18：55～ TBS系列《炎の体育会TV》に当ジムとキッズス…'),
    ('be-born', 'https://beborn.boy.jp/#zac-2015-10-03-event-3', 'official-site:be-born:2015-10-03:event:3', 'event', 'Be born Climbing gym メディア出演情報', 'Be born Climbing gymの公式情報に基づく2015/10/03のイベント情報です。内容や参加条件は公式情報で確認してください。', '2015-10-03 01:00:00.000+00'::timestamptz, '2015-10-03 02:00:00.000+00'::timestamptz, 'ク 【メディア出演情報】 11月2日(土)18：55～ TBS系列《炎の体育会TV》に当ジムとキッズスクール生達が出演しました！！ 詳しくはこちら⇒ クリック 2015/10/03：クライミングジム 「Be born」を越谷市南越谷にオー…', 0.60::numeric, 'pending', 'Be born Climbing gym 公式サイトからイベント候補を検出。日付候補は2015/10/03。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: ク 【メディア出演情報】 11月2日(土)18：55～ TBS系列《炎の体育会TV》に当ジムとキッズスクール生達が出演しました！！ 詳しくはこちら⇒ クリック 2015/10/03：クライミングジム 「Be born」を越谷市南越谷にオー…'),
    ('headrock-climbing', 'https://headrock-climbing.com/#zac-2026-05-19-event-1', 'official-site:headrock-climbing:2026-05-19:event:1', 'event', 'HEADROCK CLIMBING GYM 3月末まで延長', 'HEADROCK CLIMBING GYMの公式情報に基づく2026/05/19のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-19 01:00:00.000+00'::timestamptz, '2026-05-19 02:00:00.000+00'::timestamptz, '開閉する 施設について 初めての方へ 料金表 スクール クーポン アクセス ONLINE SHOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月…', 0.60::numeric, 'pending', 'HEADROCK CLIMBING GYM 公式サイトからイベント候補を検出。日付候補は2026/05/19。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 開閉する 施設について 初めての方へ 料金表 スクール クーポン アクセス ONLINE SHOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月…'),
    ('headrock-climbing', 'https://headrock-climbing.com/#zac-2026-05-01-event-2', 'official-site:headrock-climbing:2026-05-01:event:2', 'event', 'HEADROCK CLIMBING GYM 3月末まで延長', 'HEADROCK CLIMBING GYMの公式情報に基づく2026/05/01のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-01 01:00:00.000+00'::timestamptz, '2026-05-01 02:00:00.000+00'::timestamptz, 'スクール クーポン アクセス ONLINE SHOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月スケジュール 2026/3/1 【3月末まで延…', 0.60::numeric, 'pending', 'HEADROCK CLIMBING GYM 公式サイトからイベント候補を検出。日付候補は2026/05/01。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: スクール クーポン アクセス ONLINE SHOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月スケジュール 2026/3/1 【3月末まで延…'),
    ('headrock-climbing', 'https://headrock-climbing.com/#zac-2026-03-01-event-3', 'official-site:headrock-climbing:2026-03-01:event:3', 'event', 'HEADROCK CLIMBING GYM 3月末まで延長', 'HEADROCK CLIMBING GYMの公式情報に基づく2026/03/01のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-03-01 01:00:00.000+00'::timestamptz, '2026-03-01 02:00:00.000+00'::timestamptz, 'HOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月スケジュール 2026/3/1 【3月末まで延長】始めたい人応援します！... 2026/3…', 0.60::numeric, 'pending', 'HEADROCK CLIMBING GYM 公式サイトからイベント候補を検出。日付候補は2026/03/01。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: HOP お問い合わせ 03-6659-5843 NEWS MORE 2026/5/19 キッズクラス体験会開催！ 2026/5/1 2026年5月スケジュール 2026/3/1 【3月末まで延長】始めたい人応援します！... 2026/3…'),
    ('limestone-climbing-club', 'https://www.limestone.jp/#zac-2026-05-24-competition-1', 'official-site:limestone-climbing-club:2026-05-24:competition:1', 'competition', 'LIMESTONE Climbing Club 05/24 コンペ', 'LIMESTONE Climbing Clubの公式情報に基づく2026/05/24のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-24 01:00:00.000+00'::timestamptz, '2026-05-24 02:00:00.000+00'::timestamptz, 'テップUPを目指す方へ 料金案内 よくあるご質問 INFORMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/24 6月🐸旬の壁 リセットのお知らせ 2026/05/12…', 0.60::numeric, 'pending', 'LIMESTONE Climbing Club 公式サイトからコンペ・大会候補を検出。日付候補は2026/05/24。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: テップUPを目指す方へ 料金案内 よくあるご質問 INFORMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/24 6月🐸旬の壁 リセットのお知らせ 2026/05/12…'),
    ('limestone-climbing-club', 'https://www.limestone.jp/#zac-2026-05-12-competition-2', 'official-site:limestone-climbing-club:2026-05-12:competition:2', 'competition', 'LIMESTONE Climbing Club 開店時間変更のお知らせ', 'LIMESTONE Climbing Clubの公式情報に基づく2026/05/12のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-12 01:00:00.000+00'::timestamptz, '2026-05-12 02:00:00.000+00'::timestamptz, 'RMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/24 6月🐸旬の壁 リセットのお知らせ 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催…', 0.60::numeric, 'pending', 'LIMESTONE Climbing Club 公式サイトからコンペ・大会候補を検出。日付候補は2026/05/12。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: RMATION アクセス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/24 6月🐸旬の壁 リセットのお知らせ 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催…'),
    ('limestone-climbing-club', 'https://www.limestone.jp/#zac-2026-05-12-competition-3', 'official-site:limestone-climbing-club:2026-05-12:competition:3', 'competition', 'LIMESTONE Climbing Club 開店時間変更のお知らせ', 'LIMESTONE Climbing Clubの公式情報に基づく2026/05/12のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-12 01:00:00.000+00'::timestamptz, '2026-05-12 02:00:00.000+00'::timestamptz, 'ス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/24 6月🐸旬の壁 リセットのお知らせ 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催中！ 2026/05/…', 0.60::numeric, 'pending', 'LIMESTONE Climbing Club 公式サイトからコンペ・大会候補を検出。日付候補は2026/05/12。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: ス ブログ search メニュー開閉 Youtube INFORMATION 2026/05/24 6月🐸旬の壁 リセットのお知らせ 2026/05/12 5/12(火)～5/17(日) 《旬の壁トライアル》開催中！ 2026/05/…'),
    ('lutra-lutra', 'https://www.lutra-lutra.com/#zac-2026-03-31-competition-1', 'official-site:lutra-lutra:2026-03-31:competition:1', 'competition', 'Lutra Lutra 03/31 コンペ', 'Lutra Lutraの公式情報に基づく2026/03/31のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-03-31 01:00:00.000+00'::timestamptz, '2026-03-31 02:00:00.000+00'::timestamptz, '�大ゴッホ展とTHEWALL合宿🌻 茨城生まれ、足立区育ち、サウナ好きなやつはだいたいトモダチ🎵てんちょーです福島美術館で開幕中の大ゴッホ展に突撃です💨 2026.03.31 08:27 ジム 観光 お風呂 ✨６面リニューアル✨今月…', 0.60::numeric, 'pending', 'Lutra Lutra 公式サイトからコンペ・大会候補を検出。日付候補は2026/03/31。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: �大ゴッホ展とTHEWALL合宿🌻 茨城生まれ、足立区育ち、サウナ好きなやつはだいたいトモダチ🎵てんちょーです福島美術館で開幕中の大ゴッホ展に突撃です💨 2026.03.31 08:27 ジム 観光 お風呂 ✨６面リニューアル✨今月…')
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
  '2026-05-26 10:32:09.226+00'::timestamptz,
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
