-- Official-site observations generated from official-site fallback queues.
-- Generated: 2026-05-20T15:41:10.959Z
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

WITH checked_sources (handle, source_url) AS (
  VALUES
    ('folk-bouldering-gym', 'https://folkboulderinggym.com/'),
    ('forge-bouldering', 'https://www.forge-bouldering.com/'),
    ('hokimaboulders', 'https://hokimaboulders.com/'),
    ('jetsetclimbing', 'https://www.jetsetclimbing.com/'),
    ('base-camp-edogawabashi', 'https://b-camp.jp/edogawabashi/'),
    ('westrock-climbing-event', 'https://www.westrock-climbing.com/event/')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-20 15:41:10.959+00'::timestamptz,
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
    ('folk-bouldering-gym', 'https://folkboulderinggym.com/#zac-2026-05-05-route_set-1', 'official-site:folk-bouldering-gym:2026-05-05:route_set:1', 'route_set', 'folk bouldering gym 05/05 セット', 'folk bouldering gymの公式情報に基づく2026/05/05のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-05 01:00:00.000+00'::timestamptz, '2026-05-05 02:00:00.000+00'::timestamptz, 'らへ Information ボルダリングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8…', 0.60::numeric, 'pending', 'folk bouldering gym 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/05。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: らへ Information ボルダリングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8…'),
    ('folk-bouldering-gym', 'https://folkboulderinggym.com/#zac-2026-05-08-route_set-2', 'official-site:folk-bouldering-gym:2026-05-08:route_set:2', 'route_set', 'folk bouldering gym 05/08 セット', 'folk bouldering gymの公式情報に基づく2026/05/08のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-08 01:00:00.000+00'::timestamptz, '2026-05-08 02:00:00.000+00'::timestamptz, 'formation ボルダリングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8(金)は全…', 0.60::numeric, 'pending', 'folk bouldering gym 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/08。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: formation ボルダリングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8(金)は全…'),
    ('folk-bouldering-gym', 'https://folkboulderinggym.com/#zac-2026-05-02-route_set-3', 'official-site:folk-bouldering-gym:2026-05-02:route_set:3', 'route_set', 'folk bouldering gym 05/02 セット', 'folk bouldering gymの公式情報に基づく2026/05/02のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-02 01:00:00.000+00'::timestamptz, '2026-05-02 02:00:00.000+00'::timestamptz, 'リングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8(金)は全面ホールド替えのため休業と…', 0.60::numeric, 'pending', 'folk bouldering gym 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/02。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: リングを体験したいと考える方へ最新情報を案内 folk bouldering gymに関する幅広い情報を確かめていただけます 5/5-5/8ホールド替え... 2026/05/02 5/5(火)〜5/8(金)は全面ホールド替えのため休業と…'),
    ('forge-bouldering', 'https://www.forge-bouldering.com/#zac-2020-06-17-opening_change-1', 'official-site:forge-bouldering:2020-06-17:opening_change:1', 'opening_change', 'Forge bouldering 06/17 営業変更', 'Forge boulderingの公式情報に基づく2020/06/17の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2020-06-17 01:00:00.000+00'::timestamptz, '2020-06-17 02:00:00.000+00'::timestamptz, '様のご来店お待ちしております。 ​ &#8203; &#8203; @forge.bouldering Load More forge bouldering ​2020年6月17日OPEN 横須賀市唯一の屋内ボルダリング専用施設 京急県立…', 0.60::numeric, 'pending', 'Forge bouldering 公式サイトから営業時間・休業変更候補を検出。日付候補は2020/06/17。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 様のご来店お待ちしております。 ​ &#8203; &#8203; @forge.bouldering Load More forge bouldering ​2020年6月17日OPEN 横須賀市唯一の屋内ボルダリング専用施設 京急県立…'),
    ('base-camp-edogawabashi', 'https://b-camp.jp/edogawabashi/#zac-2026-05-20-opening_change-1', 'official-site:base-camp-edogawabashi:2026-05-20:opening_change:1', 'opening_change', 'BASE CAMP TOKYO 江戸川橋 料金改定とサマーキャンペーンのお知らせ', 'BASE CAMP TOKYO 江戸川橋の公式情報に基づく2026/05/20の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-05-20 01:00:00.000+00'::timestamptz, '2026-05-20 02:00:00.000+00'::timestamptz, 'っぷりとご紹介します アクセス アクセスマップはこちらから 事前登録のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース …', 0.60::numeric, 'pending', 'BASE CAMP TOKYO 江戸川橋 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/05/20。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: っぷりとご紹介します アクセス アクセスマップはこちらから 事前登録のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース …'),
    ('base-camp-edogawabashi', 'https://b-camp.jp/edogawabashi/#zac-2026-05-09-opening_change-2', 'official-site:base-camp-edogawabashi:2026-05-09:opening_change:2', 'opening_change', 'BASE CAMP TOKYO 江戸川橋 料金改定とサマーキャンペーンのお知らせ', 'BASE CAMP TOKYO 江戸川橋の公式情報に基づく2026/05/09の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-05-09 01:00:00.000+00'::timestamptz, '2026-05-09 02:00:00.000+00'::timestamptz, '事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース 2026年05月09日 【料金改定とサマーキャンペーンのお知らせ】 2026年…', 0.60::numeric, 'pending', 'BASE CAMP TOKYO 江戸川橋 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/05/09。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース 2026年05月09日 【料金改定とサマーキャンペーンのお知らせ】 2026年…'),
    ('base-camp-edogawabashi', 'https://b-camp.jp/edogawabashi/#zac-2026-04-27-opening_change-3', 'official-site:base-camp-edogawabashi:2026-04-27:opening_change:3', 'opening_change', 'BASE CAMP TOKYO 江戸川橋 料金改定とサマーキャンペーンのお知らせ', 'BASE CAMP TOKYO 江戸川橋の公式情報に基づく2026/04/27の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-27 01:00:00.000+00'::timestamptz, '2026-04-27 02:00:00.000+00'::timestamptz, 'ICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース 2026年05月09日 【料金改定とサマーキャンペーンのお知らせ】 2026年04月27日 5月 ルートクライミングエリア工事のお知らせ 2026…', 0.60::numeric, 'pending', 'BASE CAMP TOKYO 江戸川橋 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/27。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ICK UP 2026年05月20日 NEW BCTルートクライミングスクールミドルコース 2026年05月09日 【料金改定とサマーキャンペーンのお知らせ】 2026年04月27日 5月 ルートクライミングエリア工事のお知らせ 2026…'),
    ('westrock-climbing-event', 'https://www.westrock-climbing.com/event/#zac-2026-05-18-competition-1', 'official-site:westrock-climbing-event:2026-05-18:competition:1', 'competition', 'WESTROCK 公式イベント情報 東京都内', 'WESTROCK 公式イベント情報の公式情報に基づく2026/05/18のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-18 01:00:00.000+00'::timestamptz, '2026-05-18 02:00:00.000+00'::timestamptz, 'ithin a few seconds. イベント情報 - クライミングジム ウエストロック【東京都内】 ウエストロック > イベント情報 イベント情報 一覧 2026/05/18 STONE CIRCUIT Plus+ 2026 Sea…', 0.60::numeric, 'pending', 'WESTROCK 公式イベント情報の公式サイトからコンペ・大会候補を検出。日付候補は2026/05/18。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: ithin a few seconds. イベント情報 - クライミングジム ウエストロック【東京都内】 ウエストロック > イベント情報 イベント情報 一覧 2026/05/18 STONE CIRCUIT Plus+ 2026 Sea…'),
    ('westrock-climbing-event', 'https://www.westrock-climbing.com/event/#zac-2026-05-09-competition-2', 'official-site:westrock-climbing-event:2026-05-09:competition:2', 'competition', 'WESTROCK 公式イベント情報 2026/05/09 コンペ', 'WESTROCK 公式イベント情報の公式情報に基づく2026/05/09のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-09 01:00:00.000+00'::timestamptz, '2026-05-09 02:00:00.000+00'::timestamptz, '】 ウエストロック > イベント情報 イベント情報 一覧 2026/05/18 STONE CIRCUIT Plus+ 2026 Season2 Result 2026/05/09 【B-SCORE 7th SEASON】April Re…', 0.60::numeric, 'pending', 'WESTROCK 公式イベント情報の公式サイトからコンペ・大会候補を検出。日付候補は2026/05/09。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: 】 ウエストロック > イベント情報 イベント情報 一覧 2026/05/18 STONE CIRCUIT Plus+ 2026 Season2 Result 2026/05/09 【B-SCORE 7th SEASON】April Re…'),
    ('westrock-climbing-event', 'https://www.westrock-climbing.com/event/#zac-2026-04-24-competition-3', 'official-site:westrock-climbing-event:2026-04-24:competition:3', 'competition', 'WESTROCK 公式イベント情報 2026/04/24 コンペ', 'WESTROCK 公式イベント情報の公式情報に基づく2026/04/24のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-04-24 01:00:00.000+00'::timestamptz, '2026-04-24 02:00:00.000+00'::timestamptz, 'E CIRCUIT Plus+ 2026 Season2 Result 2026/05/09 【B-SCORE 7th SEASON】April Result 2026/04/24 STONE CIRCUIT Plus＋ 2026 Sea…', 0.60::numeric, 'pending', 'WESTROCK 公式イベント情報の公式サイトからコンペ・大会候補を検出。日付候補は2026/04/24。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: E CIRCUIT Plus+ 2026 Season2 Result 2026/05/09 【B-SCORE 7th SEASON】April Result 2026/04/24 STONE CIRCUIT Plus＋ 2026 Sea…')
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
  '2026-05-20 15:41:10.959+00'::timestamptz,
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
