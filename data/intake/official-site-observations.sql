-- Official-site observations generated from inspectNow official-site queue.
-- Generated: 2026-05-16T15:07:43.112Z
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

WITH checked_sources (handle, source_url) AS (
  VALUES
    ('beaks-climbing-studio', 'https://beaksc.wixsite.com/beaks'),
    ('berry-wall', 'https://www.berrywall.com/'),
    ('blue-bird-bouldering', 'https://climbing-bluebird.jp/'),
    ('bolbol', 'https://bol-bol.com/'),
    ('d-bouldering-plus-yachiyo', 'https://www.d-b-c.jp/yachiyo-news/facility'),
    ('energy-climbing-urawa', 'https://energy-climbing.co.jp/urawa/'),
    ('jam-session-mitaka', 'https://xn--xckbj6a9jra6a4gy403a4b6j.com/'),
    ('penguin-climb', 'https://penguin-climb.com/'),
    ('tsukuba-monkey-magic', 'https://tsukuba-mm.jp/'),
    ('mibu-general-gymnasium', 'https://www.town.mibu.tochigi.jp/docs/2015021200047/'),
    ('spole-climbing-gym', 'https://spoleclimbinggym.com/'),
    ('climbing-gym-ranbo', 'https://ranbo.jp/'),
    ('climbing-gym-wall-street', 'https://wallst.jp/'),
    ('climbing-gym-walrus', 'https://www.walrus.co.jp/'),
    ('climbinggym-prob', 'https://prob.pupu.jp/'),
    ('d-bouldering-hachioji', 'https://www.d-b-c.jp/top/hachioji/'),
    ('d-bouldering-plus-nishi-hachioji', 'https://www.d-b-c.jp/top/nishihachioji/'),
    ('exciting-sancha', 'https://exciting-sancha.com/about/'),
    ('madrock-climbing-gym', 'https://www.bouldering-climbinggym-madrock.com/'),
    ('miyake-recreation-center', 'https://www.vill.miyake.tokyo.jp/recreation/shisetsu.html'),
    ('climbing-aska', 'https://climbing-aska.com/'),
    ('climbing-gym-cell', 'https://www.climb-cell.com/'),
    ('d-bouldering-plus-lead-kaihin-makuhari', 'https://www.d-b-c.jp/top/kaihin-makuhari/')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-16 15:07:43.112+00'::timestamptz,
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
    ('berry-wall', 'https://www.berrywall.com/#zac-2025-07-01-event-1', 'official-site:berry-wall:2025-07-01:event:1', 'event', 'BERRY WALL Climbing Gym 公式サイト 07/01 イベント情報', 'BERRY WALL Climbing Gym 公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-07-01 01:00:00.000+00'::timestamptz, '2025-07-01 02:00:00.000+00'::timestamptz, 'ンクラスから競技を目指すアスリートクラスまでレベルに合わせて開催！！ 詳しくはこちら 体験コース案内 まずはクライミングを体験してみよう！! 詳しくはこちら ※2025年7月1日よりフリータイム（デイタイム）およびジュニアクライミングスク…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('berry-wall', 'https://www.berrywall.com/#zac-2026-04-28-route_set-2', 'official-site:berry-wall:2026-04-28:route_set:2', 'route_set', 'BERRY WALL Climbing Gym 公式サイト 04/28 セット情報', 'BERRY WALL Climbing Gym 公式サイトの公式サイト上でセット情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-28 01:00:00.000+00'::timestamptz, '2026-04-28 02:00:00.000+00'::timestamptz, '入っていないときはスタッフが不在になる場合があります。 ※最終枠に予約がないときは、最終枠予約受付終了後はスタッフが不在になる場合があります。 営業カレンダー 2026年4月28日 / 最終更新日 : 2026年4月28日 BERRYWA…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('berry-wall', 'https://www.berrywall.com/#zac-2026-04-28-route_set-3', 'official-site:berry-wall:2026-04-28:route_set:3', 'route_set', 'BERRY WALL Climbing Gym 公式サイト 04/28 セット情報', 'BERRY WALL Climbing Gym 公式サイトの公式サイト上でセット情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-28 01:00:00.000+00'::timestamptz, '2026-04-28 02:00:00.000+00'::timestamptz, 'があります。 ※最終枠に予約がないときは、最終枠予約受付終了後はスタッフが不在になる場合があります。 営業カレンダー 2026年4月28日 / 最終更新日 : 2026年4月28日 BERRYWALL お知らせ セット替えのお知らせ 5月…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('bolbol', 'https://bol-bol.com/#zac-2025-12-11-competition-1', 'official-site:bolbol:2025-12-11:competition:1', 'competition', 'BolBol 公式サイト もっと上達したい', 'BolBol 公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-12-11 01:00:00.000+00'::timestamptz, '2025-12-11 02:00:00.000+00'::timestamptz, 'についてのアドバイスも発信しておりますので、「もっと上達したい」とお考えの方はぜひぜひチェックしてみてください! BolBol公式ブログ！ お知らせ News 2025年12月11日 年末年始のスケジュール 2025年12月11日 Bol…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('bolbol', 'https://bol-bol.com/#zac-2025-12-11-competition-2', 'official-site:bolbol:2025-12-11:competition:2', 'competition', 'BolBol 公式サイト コンペ課題、9/28まで開放中！🔥', 'BolBol 公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-12-11 01:00:00.000+00'::timestamptz, '2025-12-11 02:00:00.000+00'::timestamptz, 'っと上達したい」とお考えの方はぜひぜひチェックしてみてください! BolBol公式ブログ！ お知らせ News 2025年12月11日 年末年始のスケジュール 2025年12月11日 BolBolCUP開催に伴う臨時休業のお知らせ 202…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('bolbol', 'https://bol-bol.com/#zac-2025-11-29-competition-3', 'official-site:bolbol:2025-11-29:competition:3', 'competition', 'BolBol 公式サイト コンペ課題、9/28まで開放中！🔥', 'BolBol 公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-11-29 01:00:00.000+00'::timestamptz, '2025-11-29 02:00:00.000+00'::timestamptz, 'Bol公式ブログ！ お知らせ News 2025年12月11日 年末年始のスケジュール 2025年12月11日 BolBolCUP開催に伴う臨時休業のお知らせ 2025年11月29日 アルバイトスタッフ募集中 2025年11月20日 エン…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-plus-yachiyo', 'https://www.d-b-c.jp/yachiyo-news/facility#zac-2025-02-06-private_booking-1', 'official-site:d-bouldering-plus-yachiyo:2025-02-06:private_booking:1', 'private_booking', 'ディーボルダリングプラス八千代公式施設紹介 施設のご紹介', 'ディーボルダリングプラス八千代公式施設紹介の公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-02-06 01:00:00.000+00'::timestamptz, '2025-02-06 02:00:00.000+00'::timestamptz, 'ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース＆ キャンペーン NEWS & CAMPAIGN ディーボルダリングプラス八千代【施設のご紹介】 2025/2/6 ディーボルダリングプラス八千代 施設のご紹介 &#x1f69…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-plus-yachiyo', 'https://www.d-b-c.jp/yachiyo-news/facility#zac-2025-06-05-event-2', 'official-site:d-bouldering-plus-yachiyo:2025-06-05:event:2', 'event', 'ディーボルダリングプラス八千代公式施設紹介 お詫びと自主回収のお知らせ', 'ディーボルダリングプラス八千代公式施設紹介の公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-06-05 01:00:00.000+00'::timestamptz, '2025-06-05 02:00:00.000+00'::timestamptz, ' 11月スケジュール 【お詫びと自主回収のお知らせ】Specialty Supplement Hematite BCAA／Obsidian BCAA+ （更新：2025年6月5日） キッズスクール開校 月パスについて ディーボルダリングプ…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-plus-yachiyo', 'https://www.d-b-c.jp/yachiyo-news/facility#zac-2025-12-20-private_booking-3', 'official-site:d-bouldering-plus-yachiyo:2025-12-20:private_booking:3', 'private_booking', 'ディーボルダリングプラス八千代公式施設紹介 施設のご紹介', 'ディーボルダリングプラス八千代公式施設紹介の公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-12-20 01:00:00.000+00'::timestamptz, '2025-12-20 02:00:00.000+00'::timestamptz, '：2025年6月5日） キッズスクール開校 月パスについて ディーボルダリングプラス八千代【施設のご紹介】 春の習いごとはじめ応援キャンペーン 月別アーカイブ 2025年12月 2025年11月 2025年6月 2025年2月 2025年…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('energy-climbing-urawa', 'https://energy-climbing.co.jp/urawa/#zac-2026-04-30-opening_change-1', 'official-site:energy-climbing-urawa:2026-04-30:opening_change:1', 'opening_change', 'エナジークライミングジム浦和店公式サイト 年パス10％OFF', 'エナジークライミングジム浦和店公式サイトの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-30 01:00:00.000+00'::timestamptz, '2026-04-30 02:00:00.000+00'::timestamptz, '蔵野線、武蔵浦和駅より徒歩8分 TEL 048-838-1850 駐車場 敷地内無料17台分あり 施設 トップロープ・リード・ボルダリング お知らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 20…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('energy-climbing-urawa', 'https://energy-climbing.co.jp/urawa/#zac-2025-12-27-opening_change-2', 'official-site:energy-climbing-urawa:2025-12-27:opening_change:2', 'opening_change', 'エナジークライミングジム浦和店公式サイト 年パス10％OFF', 'エナジークライミングジム浦和店公式サイトの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-12-27 01:00:00.000+00'::timestamptz, '2025-12-27 02:00:00.000+00'::timestamptz, '敷地内無料17台分あり 施設 トップロープ・リード・ボルダリング お知らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 2025.12.27 浦和店のお知らせ 年末年始の営業時間のお知らせ 2025…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('energy-climbing-urawa', 'https://energy-climbing.co.jp/urawa/#zac-2025-01-14-route_set-3', 'official-site:energy-climbing-urawa:2025-01-14:route_set:3', 'route_set', 'エナジークライミングジム浦和店公式サイト 年パス10％OFF', 'エナジークライミングジム浦和店公式サイトの公式サイト上でセット情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-01-14 01:00:00.000+00'::timestamptz, '2025-01-14 02:00:00.000+00'::timestamptz, 'らせ NEWS 2026.04.30 浦和店のお知らせ 浦和店より一部料金改定のお知らせ 2025.12.27 浦和店のお知らせ 年末年始の営業時間のお知らせ 2025.01.14 浦和店のお知らせ 「年パス10％OFF」キャンペーンのお…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('jam-session-mitaka', 'https://xn--xckbj6a9jra6a4gy403a4b6j.com/#zac-2026-05-10-opening_change-1', 'official-site:jam-session-mitaka:2026-05-10:opening_change:1', 'opening_change', 'ジャムセッション三鷹公式サイト 外岩クラック講習（8月、9月、10月）参加募集', 'ジャムセッション三鷹公式サイトの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-05-10 01:00:00.000+00'::timestamptz, '2026-05-10 02:00:00.000+00'::timestamptz, 'クライミングを楽しめます。 癒しの木造内装 ジムの内装には木を多く使っています。さわやかな木の香りが気持ちをリラックスさせてくれます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 20…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('jam-session-mitaka', 'https://xn--xckbj6a9jra6a4gy403a4b6j.com/#zac-2026-05-04-opening_change-2', 'official-site:jam-session-mitaka:2026-05-04:opening_change:2', 'opening_change', 'ジャムセッション三鷹公式サイト 外岩クラック講習（8月、9月、10月）参加募集', 'ジャムセッション三鷹公式サイトの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-05-04 01:00:00.000+00'::timestamptz, '2026-05-04 02:00:00.000+00'::timestamptz, 'ます。さわやかな木の香りが気持ちをリラックスさせてくれます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 2026年5月4日 【スタッフ／アルバイト募集中】 2026年4月29日 【ゴ…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('jam-session-mitaka', 'https://xn--xckbj6a9jra6a4gy403a4b6j.com/#zac-2026-04-29-opening_change-3', 'official-site:jam-session-mitaka:2026-04-29:opening_change:3', 'opening_change', 'ジャムセッション三鷹公式サイト 外岩クラック講習（8月、9月、10月）参加募集', 'ジャムセッション三鷹公式サイトの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-29 01:00:00.000+00'::timestamptz, '2026-04-29 02:00:00.000+00'::timestamptz, 'れます。 Information 2026年5月10日 【外岩クラック講習（8月、9月、10月）参加募集】 2026年5月4日 【スタッフ／アルバイト募集中】 2026年4月29日 【ゴールデンウイークの営業時間】 2026年4月22日 …', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('penguin-climb', 'https://penguin-climb.com/#zac-2025-12-06-event-1', 'official-site:penguin-climb:2025-12-06:event:1', 'event', 'クライミングジムPenguin公式サイト 1時間体験プラン', 'クライミングジムPenguin公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-12-06 01:00:00.000+00'::timestamptz, '2025-12-06 02:00:00.000+00'::timestamptz, 'nners 料金案内 Price 施設案内 Gym スタッフ紹介 Staff アクセス Access お問い合わせ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 …', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('penguin-climb', 'https://penguin-climb.com/#zac-2025-12-06-event-2', 'official-site:penguin-climb:2025-12-06:event:2', 'event', 'クライミングジムPenguin公式サイト 1時間体験プラン', 'クライミングジムPenguin公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-12-06 01:00:00.000+00'::timestamptz, '2025-12-06 02:00:00.000+00'::timestamptz, 'ッフ紹介 Staff アクセス Access お問い合わせ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 ペンギン・キッズスクールのご案内 2025年12月6日 …', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('penguin-climb', 'https://penguin-climb.com/#zac-2025-12-06-event-3', 'official-site:penguin-climb:2025-12-06:event:3', 'event', 'クライミングジムPenguin公式サイト 1時間体験プラン', 'クライミングジムPenguin公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-12-06 01:00:00.000+00'::timestamptz, '2025-12-06 02:00:00.000+00'::timestamptz, 'せ Inquiry --> 新着情報 News 2025年12月6日 ボルダリング「1時間体験プラン」 2025年12月6日 ペンギン・キッズスクールのご案内 2025年12月6日 ペンギン・マンツーマンレッスンのご案内 2026年5月6…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('tsukuba-monkey-magic', 'https://tsukuba-mm.jp/#zac-2026-03-28-event-1', 'official-site:tsukuba-monkey-magic:2026-03-28:event:1', 'event', 'TSUKUBA MONKEY MAGIC公式サイト 03/28 イベント情報', 'TSUKUBA MONKEY MAGIC公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-03-28 01:00:00.000+00'::timestamptz, '2026-03-28 02:00:00.000+00'::timestamptz, 'へスキップ ナビゲーションに移動 HOME 営業案内と料金 施設紹介 はじめての方へ スクール キッズスクール 親子教室 お知らせ アクセス案内 お問い合わせ 2026年3月28日で12周年！！ みなさまのおかげで13年目ももりもり元気に…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('tsukuba-monkey-magic', 'https://tsukuba-mm.jp/#zac-2026-04-27-opening_change-2', 'official-site:tsukuba-monkey-magic:2026-04-27:opening_change:2', 'opening_change', 'TSUKUBA MONKEY MAGIC公式サイト 04/27 営業情報', 'TSUKUBA MONKEY MAGIC公式サイトの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-27 01:00:00.000+00'::timestamptz, '2026-04-27 02:00:00.000+00'::timestamptz, ' モンキーマジックつくばでいい汗を流し、仲間との楽しいひとときをお過ごしください。 モンキーマジックからのお知らせ パラクライミングに触れよう～見えない人編～ 2026年4月27日 イベントのお知らせです パラクライミングに触れよう～見え…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('tsukuba-monkey-magic', 'https://tsukuba-mm.jp/#zac-2026-04-27-opening_change-3', 'official-site:tsukuba-monkey-magic:2026-04-27:opening_change:3', 'opening_change', 'TSUKUBA MONKEY MAGIC公式サイト 04/27 営業情報', 'TSUKUBA MONKEY MAGIC公式サイトの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-27 01:00:00.000+00'::timestamptz, '2026-04-27 02:00:00.000+00'::timestamptz, 'イミングに触れよう～見えない人編～目隠しでテープ課題にチャレンジ！&言… 続きを読む : パラクライミングに触れよう～見えない人編～ 5月の営業時間のお知らせ 2026年4月27日 月曜日・水曜日・木曜日・金曜日 13時〜22時土曜日・日…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('mibu-general-gymnasium', 'https://www.town.mibu.tochigi.jp/docs/2015021200047/#zac-2023-05-26-opening_change-1', 'official-site:mibu-general-gymnasium:2023-05-26:opening_change:1', 'opening_change', '壬生町総合運動場体育館 公式ページ 05/26 営業情報', '壬生町総合運動場体育館 公式ページの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2023-05-26 01:00:00.000+00'::timestamptz, '2023-05-26 02:00:00.000+00'::timestamptz, 'カテゴリ 分野 行政・まちづくり 町の施設 TOP カテゴリ 属性 案内・お知らせ TOP 組織 教育委員会事務局 スポーツ振興課 総合運動場 体育館 公開日 2023年05月26日 更新日 2025年04月01日 所在地 壬生町大字壬生…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('mibu-general-gymnasium', 'https://www.town.mibu.tochigi.jp/docs/2015021200047/#zac-2025-04-01-opening_change-2', 'official-site:mibu-general-gymnasium:2025-04-01:opening_change:2', 'opening_change', '壬生町総合運動場体育館 公式ページ 04/01 営業情報', '壬生町総合運動場体育館 公式ページの公式サイト上で営業情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-04-01 01:00:00.000+00'::timestamptz, '2025-04-01 02:00:00.000+00'::timestamptz, ' 町の施設 TOP カテゴリ 属性 案内・お知らせ TOP 組織 教育委員会事務局 スポーツ振興課 総合運動場 体育館 公開日 2023年05月26日 更新日 2025年04月01日 所在地 壬生町大字壬生甲３８２８番地 開館日 休業日 …', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('spole-climbing-gym', 'https://spoleclimbinggym.com/#zac-2026-04-29-private_booking-1', 'official-site:spole-climbing-gym:2026-04-29:private_booking:1', 'private_booking', 'SPOLE CLIMBING GYM公式サイト つくばユーワールド', 'SPOLE CLIMBING GYM公式サイトの公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-29 01:00:00.000+00'::timestamptz, '2026-04-29 02:00:00.000+00'::timestamptz, 'ての方はこちらへ！ ENGLISH リードクライミング ボルダリング 団体・貸切・メディア関係 プライバシーポリシー 会社案内 最新のお知らせ 5月カレンダー 2026/04/29 4月カレンダー 2026/03/31 ３月カレンダー 2…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('spole-climbing-gym', 'https://spoleclimbinggym.com/#zac-2026-03-31-private_booking-2', 'official-site:spole-climbing-gym:2026-03-31:private_booking:2', 'private_booking', 'SPOLE CLIMBING GYM公式サイト つくばユーワールド', 'SPOLE CLIMBING GYM公式サイトの公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-03-31 01:00:00.000+00'::timestamptz, '2026-03-31 02:00:00.000+00'::timestamptz, 'ードクライミング ボルダリング 団体・貸切・メディア関係 プライバシーポリシー 会社案内 最新のお知らせ 5月カレンダー 2026/04/29 4月カレンダー 2026/03/31 ３月カレンダー 2026/02/27 リンク 【つくばユ…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('spole-climbing-gym', 'https://spoleclimbinggym.com/#zac-2026-02-27-private_booking-3', 'official-site:spole-climbing-gym:2026-02-27:private_booking:3', 'private_booking', 'SPOLE CLIMBING GYM公式サイト つくばユーワールド', 'SPOLE CLIMBING GYM公式サイトの公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-02-27 01:00:00.000+00'::timestamptz, '2026-02-27 02:00:00.000+00'::timestamptz, '貸切・メディア関係 プライバシーポリシー 会社案内 最新のお知らせ 5月カレンダー 2026/04/29 4月カレンダー 2026/03/31 ３月カレンダー 2026/02/27 リンク 【つくばユーワールド】 SPA湯〜ワールド スポ…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('climbing-gym-ranbo', 'https://ranbo.jp/#zac-2025-11-03-competition-1', 'official-site:climbing-gym-ranbo:2025-11-03:competition:1', 'competition', 'クライミングジムランボ公式サイト 11/03 コンペ情報', 'クライミングジムランボ公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-11-03 01:00:00.000+00'::timestamptz, '2025-11-03 02:00:00.000+00'::timestamptz, 'yama cup25 メニュー Top Calendar News Price Contact akagiyama cup25 Welcome Welcome 2025年11月3日 by ranbo 北関東道・伊勢崎ICから車で約5分 フ…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('climbing-gym-ranbo', 'https://ranbo.jp/#zac-2026-04-29-competition-2', 'official-site:climbing-gym-ranbo:2026-04-29:competition:2', 'competition', 'クライミングジムランボ公式サイト 5月の営業カレンダー', 'クライミングジムランボ公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-29 01:00:00.000+00'::timestamptz, '2026-04-29 02:00:00.000+00'::timestamptz, '只中 今日は暑いから冷房入れてるよー #登ればきっと、心が動く #いつまでもあ 【5月の営業カレンダー】 営業カレンダーを更新したので ご確認ください！ 課題も4/29より更新さ さらに読み込む Instagram でフォロー Top C…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('climbing-gym-wall-street', 'https://wallst.jp/#zac-2026-04-05-competition-1', 'official-site:climbing-gym-wall-street:2026-04-05:competition:1', 'competition', 'クライミングジム・ウォールストリート公式サイト  JKBC2025 ', 'クライミングジム・ウォールストリート公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-05 01:00:00.000+00'::timestamptz, '2026-04-05 02:00:00.000+00'::timestamptz, 'ウォールストリートのファミリーエリアは年齢制限がありません！未就学児のお子様からクライミングに挑戦できます！予約等も必要ありませんのでお気軽にご来店ください！ 2026年4月5日(日) ウォールストリートにてボルダ ー 群馬カップ開催 し…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('climbing-gym-wall-street', 'https://wallst.jp/#zac-2025-12-07-competition-2', 'official-site:climbing-gym-wall-street:2025-12-07:competition:2', 'competition', 'クライミングジム・ウォールストリート公式サイト  JKBC2025 ', 'クライミングジム・ウォールストリート公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-12-07 01:00:00.000+00'::timestamptz, '2025-12-07 02:00:00.000+00'::timestamptz, '26年4月5日(日) ウォールストリートにてボルダ ー 群馬カップ開催 しました！ 詳しくは 群馬県山岳・スポーツクライミング連盟公式サイト をご覧ください！ 2025年12月7日(日) 小学生ボルダリング大会「 JKBC2025 」開催…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('climbing-gym-wall-street', 'https://wallst.jp/#zac-2025-04-13-competition-3', 'official-site:climbing-gym-wall-street:2025-04-13:competition:3', 'competition', 'クライミングジム・ウォールストリート公式サイト  JKBC2025 ', 'クライミングジム・ウォールストリート公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2025-04-13 01:00:00.000+00'::timestamptz, '2025-04-13 02:00:00.000+00'::timestamptz, 'ポーツクライミング連盟公式サイト をご覧ください！ 2025年12月7日(日) 小学生ボルダリング大会「 JKBC2025 」開催しました！ 詳細はこちらから 2025年4月13日(日) 「第13回ボルダー群馬カップ」がウォールストリート…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-hachioji', 'https://www.d-b-c.jp/top/hachioji/#zac-2026-05-11-event-1', 'official-site:d-bouldering-hachioji:2026-05-11:event:1', 'event', 'D.Bouldering Hachioji公式サイト 05/11 イベント情報', 'D.Bouldering Hachioji公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-05-11 01:00:00.000+00'::timestamptz, '2026-05-11 02:00:00.000+00'::timestamptz, 'ール おすすめの楽しみ方 施設のご案内 お知らせ アクセス 施設紹介 店舗設備 お問い合わせ 全店TOPへ 閉じる SCROLL DOWN NEWS お知らせ 2026.05.11 割引適用範囲改定のお知らせ 2026.04.28 5月ボ…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-hachioji', 'https://www.d-b-c.jp/top/hachioji/#zac-2026-04-28-event-2', 'official-site:d-bouldering-hachioji:2026-04-28:event:2', 'event', 'D.Bouldering Hachioji公式サイト 04/28 イベント情報', 'D.Bouldering Hachioji公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-28 01:00:00.000+00'::timestamptz, '2026-04-28 02:00:00.000+00'::timestamptz, 'アクセス 施設紹介 店舗設備 お問い合わせ 全店TOPへ 閉じる SCROLL DOWN NEWS お知らせ 2026.05.11 割引適用範囲改定のお知らせ 2026.04.28 5月ボルダリングスクール体験会日程 2026.03.30…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-hachioji', 'https://www.d-b-c.jp/top/hachioji/#zac-2026-03-30-event-3', 'official-site:d-bouldering-hachioji:2026-03-30:event:3', 'event', 'D.Bouldering Hachioji公式サイト もう一手', 'D.Bouldering Hachioji公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-03-30 01:00:00.000+00'::timestamptz, '2026-03-30 02:00:00.000+00'::timestamptz, '閉じる SCROLL DOWN NEWS お知らせ 2026.05.11 割引適用範囲改定のお知らせ 2026.04.28 5月ボルダリングスクール体験会日程 2026.03.30 4月ボルダリングスクール体験会日程 全ての記事をみる A…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('exciting-sancha', 'https://exciting-sancha.com/about/#zac-2020-12-22-private_booking-1', 'official-site:exciting-sancha:2020-12-22:private_booking:1', 'private_booking', 'スポーツクライミングジム エキサイティング三茶公式サイト 12/22 貸切情報', 'スポーツクライミングジム エキサイティング三茶公式サイトの公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2020-12-22 01:00:00.000+00'::timestamptz, '2020-12-22 02:00:00.000+00'::timestamptz, 'ュー 利用料金 貸切 店舗情報 お知らせ/Announcement スターターレッスン予約 利用料金 店舗情報 言語切り替え English 日本語 店舗情報 2020.12.22 完全予約制 ※ ※初回利用の方、事前予約 をお願いします…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('exciting-sancha', 'https://exciting-sancha.com/about/#zac-2026-04-03-private_booking-2', 'official-site:exciting-sancha:2026-04-03:private_booking:2', 'private_booking', 'スポーツクライミングジム エキサイティング三茶公式サイト 04/03 貸切情報', 'スポーツクライミングジム エキサイティング三茶公式サイトの公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-03 01:00:00.000+00'::timestamptz, '2026-04-03 02:00:00.000+00'::timestamptz, '利用いただくと、各課題をクリアしたかなどの記録もつけることができるためより便利です！ Satellite Satellite お知らせ キッズスクールのお休み 2026.04.03 セッティングのお知らせ 2026.03.29 貸切営業（…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('exciting-sancha', 'https://exciting-sancha.com/about/#zac-2026-03-29-private_booking-3', 'official-site:exciting-sancha:2026-03-29:private_booking:3', 'private_booking', 'スポーツクライミングジム エキサイティング三茶公式サイト 03/29 貸切情報', 'スポーツクライミングジム エキサイティング三茶公式サイトの公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-03-29 01:00:00.000+00'::timestamptz, '2026-03-29 02:00:00.000+00'::timestamptz, 'もつけることができるためより便利です！ Satellite Satellite お知らせ キッズスクールのお休み 2026.04.03 セッティングのお知らせ 2026.03.29 貸切営業（3月21日土曜日12時〜13時半） 2026.…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('madrock-climbing-gym', 'https://www.bouldering-climbinggym-madrock.com/#zac-2026-05-29-competition-1', 'official-site:madrock-climbing-gym:2026-05-29:competition:1', 'competition', 'クライミングジム マッドロック公式サイト 5月の営業に関して', 'クライミングジム マッドロック公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-05-29 01:00:00.000+00'::timestamptz, '2026-05-29 02:00:00.000+00'::timestamptz, 'HOP ONLINE SHOP ONLINE SHOP ONLINE SHOP Remora Pro HV 発売開始しました！！ 【5月の営業に関して】 ​ ​5月29日（金）30日（土）は5週目のため ​キッズスクールの開催はありません…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('madrock-climbing-gym', 'https://www.bouldering-climbinggym-madrock.com/#zac-2026-05-02-competition-2', 'official-site:madrock-climbing-gym:2026-05-02:competition:2', 'competition', 'クライミングジム マッドロック公式サイト 5月の営業に関して', 'クライミングジム マッドロック公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-05-02 01:00:00.000+00'::timestamptz, '2026-05-02 02:00:00.000+00'::timestamptz, 'ました！！ 【5月の営業に関して】 ​ ​5月29日（金）30日（土）は5週目のため ​キッズスクールの開催はありません。 ​ ​ ​ 【GWの営業に関して】​ 5/2（土）～6（水）の5日間は 営業時間を変更致します ​​​ ​​ OP…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('madrock-climbing-gym', 'https://www.bouldering-climbinggym-madrock.com/#zac-2026-05-27-competition-3', 'official-site:madrock-climbing-gym:2026-05-27:competition:3', 'competition', 'クライミングジム マッドロック公式サイト TAMAX 2026', 'クライミングジム マッドロック公式サイトの公式サイト上でコンペ情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-05-27 01:00:00.000+00'::timestamptz, '2026-05-27 02:00:00.000+00'::timestamptz, '～6（水）の5日間は 営業時間を変更致します ​​​ ​​ OPEN 12：00 CLOSE 22：00 ​ セルフジャッジミニコンペ VOL４ 開催!! 期間 5/27-6/23 TAMAX 2026 開催決定！ 多摩エリアのボルダリン…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-plus-lead-kaihin-makuhari', 'https://www.d-b-c.jp/top/kaihin-makuhari/#zac-2026-04-27-private_booking-1', 'official-site:d-bouldering-plus-lead-kaihin-makuhari:2026-04-27:private_booking:1', 'private_booking', 'D.Bouldering Plus Lead 海浜幕張公式サイト 04/27 貸切情報', 'D.Bouldering Plus Lead 海浜幕張公式サイトの公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-27 01:00:00.000+00'::timestamptz, '2026-04-27 02:00:00.000+00'::timestamptz, 'E 料金案内 はじめての方へ お子さまのご利用 キッズスクール 施設のご紹介 ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース & キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-plus-lead-kaihin-makuhari', 'https://www.d-b-c.jp/top/kaihin-makuhari/#zac-2026-04-26-private_booking-2', 'official-site:d-bouldering-plus-lead-kaihin-makuhari:2026-04-26:private_booking:2', 'private_booking', 'D.Bouldering Plus Lead 海浜幕張公式サイト 04/26 貸切情報', 'D.Bouldering Plus Lead 海浜幕張公式サイトの公式サイト上で貸切情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-04-26 01:00:00.000+00'::timestamptz, '2026-04-26 02:00:00.000+00'::timestamptz, 'ご紹介 ニュース＆キャンペーン 貸切・団体利用 お問い合わせ ニュース & キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026.04.26 &#x1f38f;５月のカレンダー&#x1f38f; 2…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.'),
    ('d-bouldering-plus-lead-kaihin-makuhari', 'https://www.d-b-c.jp/top/kaihin-makuhari/#zac-2026-03-31-event-3', 'official-site:d-bouldering-plus-lead-kaihin-makuhari:2026-03-31:event:3', 'event', 'D.Bouldering Plus Lead 海浜幕張公式サイト 03/31 イベント情報', 'D.Bouldering Plus Lead 海浜幕張公式サイトの公式サイト上でイベント情報に関連する日付候補を検出。Adminで情報源ページを確認して公開可否を判断してください。', '2026-03-31 01:00:00.000+00'::timestamptz, '2026-03-31 02:00:00.000+00'::timestamptz, 'キャンペーン 2026.04.27 5月のキッズスクール体験会日程が決まりました！ 2026.04.26 &#x1f38f;５月のカレンダー&#x1f38f; 2026.03.31 &#x1f338;４月のカレンダー&#x1f338; R…', 0.60::numeric, 'pending', 'Potential calendar candidate from official site text; human review required before publishing.')
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
  '2026-05-16 15:07:43.112+00'::timestamptz,
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
