-- Official-site observations generated from official-site fallback queues.
-- Generated: 2026-05-26T10:02:21.355Z
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

WITH checked_sources (handle, source_url) AS (
  VALUES
    ('base-camp-iruma', 'https://b-camp.jp/iruma'),
    ('base-camp-tokyo-edogawabashi', 'https://b-camp.jp/edogawabashi/'),
    ('madrock-climbing-gym', 'https://www.bouldering-climbinggym-madrock.com/'),
    ('bouldering-spot-landmark', 'https://boulderingspot-landmark.com/'),
    ('caramba', 'https://www.caramba.jp/'),
    ('craze-kawaguchi', 'https://craze-climbing.com/kawaguchi/'),
    ('fish-and-bird', 'https://fish-bird.co.jp/fishandbird/'),
    ('fits-climbing', 'https://www.fits-climbing.com/'),
    ('folk-bouldering-gym', 'https://folkboulderinggym.com/'),
    ('forge-bouldering', 'https://www.forge-bouldering.com/'),
    ('hokimaboulders', 'https://hokimaboulders.com/'),
    ('jetsetclimbing', 'https://www.jetsetclimbing.com/'),
    ('base-camp-tokyo-kinshicho', 'https://b-camp.jp/kinshicho/'),
    ('climbing-spider', 'https://climbing-spider.com/shop/')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-26 10:02:21.355+00'::timestamptz,
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
    ('base-camp-iruma', 'https://b-camp.jp/iruma#zac-2019-05-27-opening_change-1', 'official-site:base-camp-iruma:2019-05-27:opening_change:1', 'opening_change', 'Climb Park Base Camp 入間店 料金改定とサマーキャンペーンのお知らせ', 'Climb Park Base Camp 入間店の公式情報に基づく2019/05/27の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2019-05-27 01:00:00.000+00'::timestamptz, '2019-05-27 02:00:00.000+00'::timestamptz, 'つ平山ユージがベースキャンプのオーナーで、海外のお客様も来店するほどです。 --> --> --> --> --> ピックアップ情報 PICK UP MORE 2019年05月27日 Base Camp Rock Festival 201…', 0.60::numeric, 'pending', 'Climb Park Base Camp 入間店 公式サイトから営業時間・休業変更候補を検出。日付候補は2019/05/27。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: つ平山ユージがベースキャンプのオーナーで、海外のお客様も来店するほどです。 --> --> --> --> --> ピックアップ情報 PICK UP MORE 2019年05月27日 Base Camp Rock Festival 201…'),
    ('base-camp-iruma', 'https://b-camp.jp/iruma#zac-2026-05-08-opening_change-2', 'official-site:base-camp-iruma:2026-05-08:opening_change:2', 'opening_change', 'Climb Park Base Camp 入間店 料金改定とサマーキャンペーンのお知らせ', 'Climb Park Base Camp 入間店の公式情報に基づく2026/05/08の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-05-08 01:00:00.000+00'::timestamptz, '2026-05-08 02:00:00.000+00'::timestamptz, '-> --> --> ピックアップ情報 PICK UP MORE 2019年05月27日 Base Camp Rock Festival 2019 特設ページ 2026年05月08日 【料金改定とサマーキャンペーンのお知らせ】 2026年…', 0.60::numeric, 'pending', 'Climb Park Base Camp 入間店 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/05/08。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: -> --> --> ピックアップ情報 PICK UP MORE 2019年05月27日 Base Camp Rock Festival 2019 特設ページ 2026年05月08日 【料金改定とサマーキャンペーンのお知らせ】 2026年…'),
    ('base-camp-iruma', 'https://b-camp.jp/iruma#zac-2026-04-25-opening_change-3', 'official-site:base-camp-iruma:2026-04-25:opening_change:3', 'opening_change', 'Climb Park Base Camp 入間店 料金改定とサマーキャンペーンのお知らせ', 'Climb Park Base Camp 入間店の公式情報に基づく2026/04/25の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-25 01:00:00.000+00'::timestamptz, '2026-04-25 02:00:00.000+00'::timestamptz, '019年05月27日 Base Camp Rock Festival 2019 特設ページ 2026年05月08日 【料金改定とサマーキャンペーンのお知らせ】 2026年04月25日 【2026年のGW営業時間についてのご案内】 2026…', 0.60::numeric, 'pending', 'Climb Park Base Camp 入間店 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/25。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 019年05月27日 Base Camp Rock Festival 2019 特設ページ 2026年05月08日 【料金改定とサマーキャンペーンのお知らせ】 2026年04月25日 【2026年のGW営業時間についてのご案内】 2026…'),
    ('base-camp-tokyo-edogawabashi', 'https://b-camp.jp/edogawabashi/#zac-2026-05-20-opening_change-1', 'official-site:base-camp-tokyo-edogawabashi:2026-05-20:opening_change:1', 'opening_change', 'Base Camp Tokyo 江戸川橋 料金改定とサマーキャンペーンのお知らせ', 'Base Camp Tokyo 江戸川橋の公式情報に基づく2026/05/20の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-05-20 01:00:00.000+00'::timestamptz, '2026-05-20 02:00:00.000+00'::timestamptz, 'っぷりとご紹介します アクセス アクセスマップはこちらから 事前登録のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース …', 0.60::numeric, 'pending', 'Base Camp Tokyo 江戸川橋 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/05/20。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: っぷりとご紹介します アクセス アクセスマップはこちらから 事前登録のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース …'),
    ('base-camp-tokyo-edogawabashi', 'https://b-camp.jp/edogawabashi/#zac-2026-05-09-opening_change-2', 'official-site:base-camp-tokyo-edogawabashi:2026-05-09:opening_change:2', 'opening_change', 'Base Camp Tokyo 江戸川橋 料金改定とサマーキャンペーンのお知らせ', 'Base Camp Tokyo 江戸川橋の公式情報に基づく2026/05/09の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-05-09 01:00:00.000+00'::timestamptz, '2026-05-09 02:00:00.000+00'::timestamptz, '事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース 2026年05月09日 【料金改定とサマーキャンペーンのお知らせ】 2026年…', 0.60::numeric, 'pending', 'Base Camp Tokyo 江戸川橋 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/05/09。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース 2026年05月09日 【料金改定とサマーキャンペーンのお知らせ】 2026年…'),
    ('base-camp-tokyo-edogawabashi', 'https://b-camp.jp/edogawabashi/#zac-2026-04-27-opening_change-3', 'official-site:base-camp-tokyo-edogawabashi:2026-04-27:opening_change:3', 'opening_change', 'Base Camp Tokyo 江戸川橋 料金改定とサマーキャンペーンのお知らせ', 'Base Camp Tokyo 江戸川橋の公式情報に基づく2026/04/27の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-27 01:00:00.000+00'::timestamptz, '2026-04-27 02:00:00.000+00'::timestamptz, 'ICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース 2026年05月09日 【料金改定とサマーキャンペーンのお知らせ】 2026年04月27日 5月 ルートクライミングエリア工事のお知らせ 2026…', 0.60::numeric, 'pending', 'Base Camp Tokyo 江戸川橋 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/27。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース 2026年05月09日 【料金改定とサマーキャンペーンのお知らせ】 2026年04月27日 5月 ルートクライミングエリア工事のお知らせ 2026…'),
    ('madrock-climbing-gym', 'https://www.bouldering-climbinggym-madrock.com/#zac-2026-05-29-competition-1', 'official-site:madrock-climbing-gym:2026-05-29:competition:1', 'competition', 'クライミングジム マッドロック 5月の営業に関して', 'クライミングジム マッドロックの公式情報に基づく2026/05/29のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-29 01:00:00.000+00'::timestamptz, '2026-05-29 02:00:00.000+00'::timestamptz, 'HOP ONLINE SHOP ONLINE SHOP ONLINE SHOP Remora Pro HV 発売開始しました！！ 【5月の営業に関して】 ​ ​5月29日（金）30日（土）は5週目のため ​キッズスクールの開催はありません…', 0.60::numeric, 'pending', 'クライミングジム マッドロック公式サイトからコンペ・大会候補を検出。日付候補は2026/05/29。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: HOP ONLINE SHOP ONLINE SHOP ONLINE SHOP Remora Pro HV 発売開始しました！！ 【5月の営業に関して】 ​ ​5月29日（金）30日（土）は5週目のため ​キッズスクールの開催はありません…'),
    ('madrock-climbing-gym', 'https://www.bouldering-climbinggym-madrock.com/#zac-2026-05-02-competition-2', 'official-site:madrock-climbing-gym:2026-05-02:competition:2', 'competition', 'クライミングジム マッドロック 5月の営業に関して', 'クライミングジム マッドロックの公式情報に基づく2026/05/02のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-02 01:00:00.000+00'::timestamptz, '2026-05-02 02:00:00.000+00'::timestamptz, 'ました！！ 【5月の営業に関して】 ​ ​5月29日（金）30日（土）は5週目のため ​キッズスクールの開催はありません。 ​ ​ ​ 【GWの営業に関して】​ 5/2（土）～6（水）の5日間は 営業時間を変更致します ​​​ ​​ OP…', 0.60::numeric, 'pending', 'クライミングジム マッドロック公式サイトからコンペ・大会候補を検出。日付候補は2026/05/02。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: ました！！ 【5月の営業に関して】 ​ ​5月29日（金）30日（土）は5週目のため ​キッズスクールの開催はありません。 ​ ​ ​ 【GWの営業に関して】​ 5/2（土）～6（水）の5日間は 営業時間を変更致します ​​​ ​​ OP…'),
    ('madrock-climbing-gym', 'https://www.bouldering-climbinggym-madrock.com/#zac-2026-05-27-competition-3', 'official-site:madrock-climbing-gym:2026-05-27:competition:3', 'competition', 'クライミングジム マッドロック 2026/05/27 コンペ', 'クライミングジム マッドロックの公式情報に基づく2026/05/27のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-27 01:00:00.000+00'::timestamptz, '2026-05-27 02:00:00.000+00'::timestamptz, '～6（水）の5日間は 営業時間を変更致します ​​​ ​​ OPEN 12：00 CLOSE 22：00 ​ セルフジャッジミニコンペ VOL４ 開催!! 期間 5/27-6/23 TAMAX 2026 開催決定！ 多摩エリアのボルダリン…', 0.60::numeric, 'pending', 'クライミングジム マッドロック公式サイトからコンペ・大会候補を検出。日付候補は2026/05/27。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: ～6（水）の5日間は 営業時間を変更致します ​​​ ​​ OPEN 12：00 CLOSE 22：00 ​ セルフジャッジミニコンペ VOL４ 開催!! 期間 5/27-6/23 TAMAX 2026 開催決定！ 多摩エリアのボルダリン…'),
    ('bouldering-spot-landmark', 'https://boulderingspot-landmark.com/#zac-2026-05-17-route_set-1', 'official-site:bouldering-spot-landmark:2026-05-17:route_set:1', 'route_set', 'Bouldering Spot Landmark リソール受付のお知らせ', 'Bouldering Spot Landmarkの公式情報に基づく2026/05/17のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-17 01:00:00.000+00'::timestamptz, '2026-05-17 02:00:00.000+00'::timestamptz, '8級〜1級まで、全12課題！ 初級者から上 身体能力に脱帽！元気いっぱいな団体様紹介 粕川柔道クラブの皆さん @kasukawa_judo が、 130°壁、5月17日でホールド替え🔥 この課題たちを登れるのもあと少し。 ラストトライ、…', 0.60::numeric, 'pending', 'Bouldering Spot Landmark 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/17。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: 8級〜1級まで、全12課題！ 初級者から上 身体能力に脱帽！元気いっぱいな団体様紹介 粕川柔道クラブの皆さん @kasukawa_judo が、 130°壁、5月17日でホールド替え🔥 この課題たちを登れるのもあと少し。 ラストトライ、…'),
    ('bouldering-spot-landmark', 'https://boulderingspot-landmark.com/#zac-2026-05-15-event-2', 'official-site:bouldering-spot-landmark:2026-05-15:event:2', 'event', 'Bouldering Spot Landmark リソール受付のお知らせ', 'Bouldering Spot Landmarkの公式情報に基づく2026/05/15のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-15 01:00:00.000+00'::timestamptz, '2026-05-15 02:00:00.000+00'::timestamptz, '0°。 テクニカルさとフィジカル、どっちも必要な最高課題💥 気持ちいい完登🔥 Sette 【リソール受付のお知らせ】 クライミングシューズの リソール受付を 5月15日（金）まで行っていま さらに読み込む Instagram でフォロ…', 0.60::numeric, 'pending', 'Bouldering Spot Landmark 公式サイトからイベント候補を検出。日付候補は2026/05/15。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 0°。 テクニカルさとフィジカル、どっちも必要な最高課題💥 気持ちいい完登🔥 Sette 【リソール受付のお知らせ】 クライミングシューズの リソール受付を 5月15日（金）まで行っていま さらに読み込む Instagram でフォロ…'),
    ('bouldering-spot-landmark', 'https://boulderingspot-landmark.com/#zac-2026-05-23-event-3', 'official-site:bouldering-spot-landmark:2026-05-23:event:3', 'event', 'Bouldering Spot Landmark 新制度', 'Bouldering Spot Landmarkの公式情報に基づく2026/05/23のイベント情報です。内容や参加条件は公式情報で確認してください。', '2026-05-23 01:00:00.000+00'::timestamptz, '2026-05-23 02:00:00.000+00'::timestamptz, '】 クライミングシューズの リソール受付を 5月15日（金）まで行っていま さらに読み込む Instagram でフォロー 新着情報＆ブログ 一覧はこちらから 2026年5月23日 NEW! 6/27 三浦千紗子氏 講習会 2026年3月…', 0.60::numeric, 'pending', 'Bouldering Spot Landmark 公式サイトからイベント候補を検出。日付候補は2026/05/23。Adminで開催日、内容、参加条件を確認してください。根拠抜粋: 】 クライミングシューズの リソール受付を 5月15日（金）まで行っていま さらに読み込む Instagram でフォロー 新着情報＆ブログ 一覧はこちらから 2026年5月23日 NEW! 6/27 三浦千紗子氏 講習会 2026年3月…'),
    ('fits-climbing', 'https://www.fits-climbing.com/#zac-2026-01-27-opening_change-1', 'official-site:fits-climbing:2026-01-27:opening_change:1', 'opening_change', 'FITS CLIMBING GYM 01/27 営業変更', 'FITS CLIMBING GYMの公式情報に基づく2026/01/27の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-01-27 01:00:00.000+00'::timestamptz, '2026-01-27 02:00:00.000+00'::timestamptz, '！ スクール体験参加予約へ シンプルスタート（特典付き施設利用）予約へ 営業時間＆カレンダー 大切なお知らせ/最新のお知らせ 全てのお知らせへ 115度 セット 1月27日 地元 体験イベント開催しました 1月20日 2026/1/17（…', 0.60::numeric, 'pending', 'FITS CLIMBING GYM 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/01/27。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ！ スクール体験参加予約へ シンプルスタート（特典付き施設利用）予約へ 営業時間＆カレンダー 大切なお知らせ/最新のお知らせ 全てのお知らせへ 115度 セット 1月27日 地元 体験イベント開催しました 1月20日 2026/1/17（…'),
    ('fits-climbing', 'https://www.fits-climbing.com/#zac-2026-01-20-opening_change-2', 'official-site:fits-climbing:2026-01-20:opening_change:2', 'opening_change', 'FITS CLIMBING GYM 01/20 営業変更', 'FITS CLIMBING GYMの公式情報に基づく2026/01/20の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-01-20 01:00:00.000+00'::timestamptz, '2026-01-20 02:00:00.000+00'::timestamptz, '（特典付き施設利用）予約へ 営業時間＆カレンダー 大切なお知らせ/最新のお知らせ 全てのお知らせへ 115度 セット 1月27日 地元 体験イベント開催しました 1月20日 2026/1/17（土）営業時間短縮のお知らせ 2025年12月…', 0.60::numeric, 'pending', 'FITS CLIMBING GYM 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/01/20。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: （特典付き施設利用）予約へ 営業時間＆カレンダー 大切なお知らせ/最新のお知らせ 全てのお知らせへ 115度 セット 1月27日 地元 体験イベント開催しました 1月20日 2026/1/17（土）営業時間短縮のお知らせ 2025年12月…'),
    ('fits-climbing', 'https://www.fits-climbing.com/#zac-2026-01-17-opening_change-3', 'official-site:fits-climbing:2026-01-17:opening_change:3', 'opening_change', 'FITS CLIMBING GYM 01/17 営業変更', 'FITS CLIMBING GYMの公式情報に基づく2026/01/17の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-01-17 01:00:00.000+00'::timestamptz, '2026-01-17 02:00:00.000+00'::timestamptz, '利用）予約へ 営業時間＆カレンダー 大切なお知らせ/最新のお知らせ 全てのお知らせへ 115度 セット 1月27日 地元 体験イベント開催しました 1月20日 2026/1/17（土）営業時間短縮のお知らせ 2025年12月26日 Hom…', 0.60::numeric, 'pending', 'FITS CLIMBING GYM 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/01/17。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 利用）予約へ 営業時間＆カレンダー 大切なお知らせ/最新のお知らせ 全てのお知らせへ 115度 セット 1月27日 地元 体験イベント開催しました 1月20日 2026/1/17（土）営業時間短縮のお知らせ 2025年12月26日 Hom…'),
    ('folk-bouldering-gym', 'https://folkboulderinggym.com/#zac-2026-05-05-route_set-1', 'official-site:folk-bouldering-gym:2026-05-05:route_set:1', 'route_set', 'folk bouldering gym 05/05 セット', 'folk bouldering gymの公式情報に基づく2026/05/05のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-05 01:00:00.000+00'::timestamptz, '2026-05-05 02:00:00.000+00'::timestamptz, 'らへ Information ボルダリングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8…', 0.60::numeric, 'pending', 'folk bouldering gym 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/05。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: らへ Information ボルダリングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8…'),
    ('folk-bouldering-gym', 'https://folkboulderinggym.com/#zac-2026-05-08-route_set-2', 'official-site:folk-bouldering-gym:2026-05-08:route_set:2', 'route_set', 'folk bouldering gym 05/08 セット', 'folk bouldering gymの公式情報に基づく2026/05/08のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-08 01:00:00.000+00'::timestamptz, '2026-05-08 02:00:00.000+00'::timestamptz, 'formation ボルダリングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8(金)は全…', 0.60::numeric, 'pending', 'folk bouldering gym 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/08。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: formation ボルダリングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8(金)は全…'),
    ('folk-bouldering-gym', 'https://folkboulderinggym.com/#zac-2026-05-02-route_set-3', 'official-site:folk-bouldering-gym:2026-05-02:route_set:3', 'route_set', 'folk bouldering gym 05/02 セット', 'folk bouldering gymの公式情報に基づく2026/05/02のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-02 01:00:00.000+00'::timestamptz, '2026-05-02 02:00:00.000+00'::timestamptz, 'リングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8(金)は全面ホールド替えのため休業と…', 0.60::numeric, 'pending', 'folk bouldering gym 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/02。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: リングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8(金)は全面ホールド替えのため休業と…'),
    ('forge-bouldering', 'https://www.forge-bouldering.com/#zac-2020-06-17-opening_change-1', 'official-site:forge-bouldering:2020-06-17:opening_change:1', 'opening_change', 'Forge bouldering 06/17 営業変更', 'Forge boulderingの公式情報に基づく2020/06/17の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2020-06-17 01:00:00.000+00'::timestamptz, '2020-06-17 02:00:00.000+00'::timestamptz, '様のご来店お待ちしております。 ​ &#8203; &#8203; @forge.bouldering Load More forge bouldering ​2020年6月17日OPEN 横須賀市唯一の屋内ボルダリング専用施設 京急県立…', 0.60::numeric, 'pending', 'Forge bouldering 公式サイトから営業時間・休業変更候補を検出。日付候補は2020/06/17。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 様のご来店お待ちしております。 ​ &#8203; &#8203; @forge.bouldering Load More forge bouldering ​2020年6月17日OPEN 横須賀市唯一の屋内ボルダリング専用施設 京急県立…'),
    ('base-camp-tokyo-kinshicho', 'https://b-camp.jp/kinshicho/#zac-2026-05-08-construction-1', 'official-site:base-camp-tokyo-kinshicho:2026-05-08:construction:1', 'construction', 'Base Camp Tokyo 錦糸町 料金改定とサマーキャンペーンのお知らせ', 'Base Camp Tokyo 錦糸町の公式情報に基づく2026/05/08の工事・メンテナンス情報です。対象エリアや営業影響は公式情報で確認してください。', '2026-05-08 01:00:00.000+00'::timestamptz, '2026-05-08 02:00:00.000+00'::timestamptz, 'っぷりとご紹介します アクセス アクセスマップはこちらから 事前登録のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月08日 【料金改定とサマーキャンペーンのお知らせ】 2026年…', 0.60::numeric, 'pending', 'Base Camp Tokyo 錦糸町 公式サイトから工事・メンテナンス候補を検出。日付候補は2026/05/08。Adminで工事期間、対象エリア、営業影響を確認してください。根拠抜粋: っぷりとご紹介します アクセス アクセスマップはこちらから 事前登録のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月08日 【料金改定とサマーキャンペーンのお知らせ】 2026年…'),
    ('base-camp-tokyo-kinshicho', 'https://b-camp.jp/kinshicho/#zac-2026-04-28-construction-2', 'official-site:base-camp-tokyo-kinshicho:2026-04-28:construction:2', 'construction', 'Base Camp Tokyo 錦糸町 料金改定とサマーキャンペーンのお知らせ', 'Base Camp Tokyo 錦糸町の公式情報に基づく2026/04/28の工事・メンテナンス情報です。対象エリアや営業影響は公式情報で確認してください。', '2026-04-28 01:00:00.000+00'::timestamptz, '2026-04-28 02:00:00.000+00'::timestamptz, 'のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月08日 【料金改定とサマーキャンペーンのお知らせ】 2026年04月28日 ２階テラスのウッドデッキ改修工事が完了しました！ ２階…', 0.60::numeric, 'pending', 'Base Camp Tokyo 錦糸町 公式サイトから工事・メンテナンス候補を検出。日付候補は2026/04/28。Adminで工事期間、対象エリア、営業影響を確認してください。根拠抜粋: のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月08日 【料金改定とサマーキャンペーンのお知らせ】 2026年04月28日 ２階テラスのウッドデッキ改修工事が完了しました！ ２階…'),
    ('base-camp-tokyo-kinshicho', 'https://b-camp.jp/kinshicho/#zac-2026-04-28-opening_change-3', 'official-site:base-camp-tokyo-kinshicho:2026-04-28:opening_change:3', 'opening_change', 'Base Camp Tokyo 錦糸町 04/28 営業変更', 'Base Camp Tokyo 錦糸町の公式情報に基づく2026/04/28の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-28 01:00:00.000+00'::timestamptz, '2026-04-28 02:00:00.000+00'::timestamptz, 'これからの季節、ゆっくりとお寛ぎいただけます。どうぞご利用くださいませ。 ※喫煙スペースご利用のお願いを掲示しております。ご確認の上ご利用をお願いいたします。 2026年04月28日 ゴールデンウィーク営業時間のお知らせ 今年はカレンダー…', 0.60::numeric, 'pending', 'Base Camp Tokyo 錦糸町 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/28。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: これからの季節、ゆっくりとお寛ぎいただけます。どうぞご利用くださいませ。 ※喫煙スペースご利用のお願いを掲示しております。ご確認の上ご利用をお願いいたします。 2026年04月28日 ゴールデンウィーク営業時間のお知らせ 今年はカレンダー…'),
    ('climbing-spider', 'https://climbing-spider.com/shop/#zac-2024-09-15-opening_change-1', 'official-site:climbing-spider:2024-09-15:opening_change:1', 'opening_change', 'クライミングジムSPIDER 09/15 営業変更', 'クライミングジムSPIDERの公式情報に基づく2024/09/15の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2024-09-15 01:00:00.000+00'::timestamptz, '2024-09-15 02:00:00.000+00'::timestamptz, 'のご紹介（初段４個、１級１６個達成） クライミング,ボルダリング 2024/9/22 クライミングコラム 親子で習い事をするメリット （東京・港区・麻布十番） 2024/9/15 クライミングコラム 海外では、朝に運動をする習慣が広く普及…', 0.60::numeric, 'pending', 'クライミングジムSPIDER 公式サイトから営業時間・休業変更候補を検出。日付候補は2024/09/15。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: のご紹介（初段４個、１級１６個達成） クライミング,ボルダリング 2024/9/22 クライミングコラム 親子で習い事をするメリット （東京・港区・麻布十番） 2024/9/15 クライミングコラム 海外では、朝に運動をする習慣が広く普及…'),
    ('climbing-spider', 'https://climbing-spider.com/shop/#zac-2024-08-03-opening_change-2', 'official-site:climbing-spider:2024-08-03:opening_change:2', 'opening_change', 'クライミングジムSPIDER 08/03 営業変更', 'クライミングジムSPIDERの公式情報に基づく2024/08/03の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2024-08-03 01:00:00.000+00'::timestamptz, '2024-08-03 02:00:00.000+00'::timestamptz, 'ラム 親子で習い事をするメリット （東京・港区・麻布十番） 2024/9/15 クライミングコラム 海外では、朝に運動をする習慣が広く普及しています。[朝活] 2024/8/3 クライミングコラム 東京で夏休みにクライミングをして思い出つ…', 0.60::numeric, 'pending', 'クライミングジムSPIDER 公式サイトから営業時間・休業変更候補を検出。日付候補は2024/08/03。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ラム 親子で習い事をするメリット （東京・港区・麻布十番） 2024/9/15 クライミングコラム 海外では、朝に運動をする習慣が広く普及しています。[朝活] 2024/8/3 クライミングコラム 東京で夏休みにクライミングをして思い出つ…')
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
  '2026-05-26 10:02:21.355+00'::timestamptz,
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
