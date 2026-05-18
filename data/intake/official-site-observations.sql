-- Official-site observations generated from official-site fallback queues.
-- Generated: 2026-05-18T02:35:28.000Z
-- Policy: store source links, short summaries, and short quotes only; do not store full page text or media.

WITH checked_sources (handle, source_url) AS (
  VALUES
    ('noborock-mizonokuchi', 'https://noborock-climbing.com/program/mizonokuchi/'),
    ('b-pump-yokohama', 'https://pump-climbing.com/gym/bpump2/'),
    ('base-camp-higashimurayama', 'https://b-camp.jp/higashimurayama/'),
    ('urban-base-camp-shinjuku', 'https://b-camp.jp/shinjuku/'),
    ('base-camp-hanno', 'https://b-camp.jp/hanno')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-18 02:35:28.000+00'::timestamptz,
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
    ('noborock-mizonokuchi', 'https://noborock-climbing.com/program/mizonokuchi/#zac-2026-05-12-route_set-1', 'official-site:noborock-mizonokuchi:2026-05-12:route_set:1', 'route_set', 'NOBOROCK 溝ノ口店 ルートセット', 'NOBOROCK 溝ノ口店の公式情報に基づく2026/05/12のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-05-12 01:00:00.000+00'::timestamptz, '2026-05-12 02:00:00.000+00'::timestamptz, '店 高田馬場店 渋谷店 池袋店 町田店 溝ノ口店 大宮店 カレンダー 撮影について ホーム 店舗案内 店舗 溝ノ口店 店舗 溝ノ口店 お知らせ 【ルートセット】 5/12 ルートセット完了！ 6/14(日) 17:00 close 6/1…', 0.60::numeric, 'pending', 'NOBOROCK 溝ノ口店 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/05/12。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: 店 高田馬場店 渋谷店 池袋店 町田店 溝ノ口店 大宮店 カレンダー 撮影について ホーム 店舗案内 店舗 溝ノ口店 店舗 溝ノ口店 お知らせ 【ルートセット】 5/12 ルートセット完了！ 6/14(日) 17:00 close 6/1…'),
    ('noborock-mizonokuchi', 'https://noborock-climbing.com/program/mizonokuchi/#zac-2026-06-14-route_set-2', 'official-site:noborock-mizonokuchi:2026-06-14:route_set:2', 'route_set', 'NOBOROCK 溝ノ口店 ルートセット', 'NOBOROCK 溝ノ口店の公式情報に基づく2026/06/14のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-06-14 01:00:00.000+00'::timestamptz, '2026-06-14 02:00:00.000+00'::timestamptz, '町田店 溝ノ口店 大宮店 カレンダー 撮影について ホーム 店舗案内 店舗 溝ノ口店 店舗 溝ノ口店 お知らせ 【ルートセット】 5/12 ルートセット完了！ 6/14(日) 17:00 close 6/15(月) close 6/16(…', 0.60::numeric, 'pending', 'NOBOROCK 溝ノ口店 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/06/14。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: 町田店 溝ノ口店 大宮店 カレンダー 撮影について ホーム 店舗案内 店舗 溝ノ口店 店舗 溝ノ口店 お知らせ 【ルートセット】 5/12 ルートセット完了！ 6/14(日) 17:00 close 6/15(月) close 6/16(…'),
    ('noborock-mizonokuchi', 'https://noborock-climbing.com/program/mizonokuchi/#zac-2026-06-15-route_set-3', 'official-site:noborock-mizonokuchi:2026-06-15:route_set:3', 'route_set', 'NOBOROCK 溝ノ口店 ルートセット', 'NOBOROCK 溝ノ口店の公式情報に基づく2026/06/15のセット・ホールド替え情報です。対象エリアや利用制限は公式情報で確認してください。', '2026-06-15 01:00:00.000+00'::timestamptz, '2026-06-15 02:00:00.000+00'::timestamptz, '撮影について ホーム 店舗案内 店舗 溝ノ口店 店舗 溝ノ口店 お知らせ 【ルートセット】 5/12 ルートセット完了！ 6/14(日) 17:00 close 6/15(月) close 6/16(火) 18:30 open！ 施設案内…', 0.60::numeric, 'pending', 'NOBOROCK 溝ノ口店 公式サイトからセット・ホールド替え候補を検出。日付候補は2026/06/15。Adminで対象エリア、作業期間、利用制限を確認してください。根拠抜粋: 撮影について ホーム 店舗案内 店舗 溝ノ口店 店舗 溝ノ口店 お知らせ 【ルートセット】 5/12 ルートセット完了！ 6/14(日) 17:00 close 6/15(月) close 6/16(火) 18:30 open！ 施設案内…'),
    ('b-pump-yokohama', 'https://pump-climbing.com/gym/bpump2/#zac-2026-04-01-construction-1', 'official-site:b-pump-yokohama:2026-04-01:construction:1', 'construction', 'B-PUMP YOKOHAMA BAMBI’S BOULDER SCHOOL', 'B-PUMP YOKOHAMAの公式情報に基づく2026/04/01の工事・メンテナンス情報です。対象エリアや営業影響は公式情報で確認してください。', '2026-04-01 01:00:00.000+00'::timestamptz, '2026-04-01 02:00:00.000+00'::timestamptz, 'B-PUMP横浜は、 クライマーが成長し続けられる環境を追求し続けます。 Routes 100-120 routes New 1F 全面改装完了！ Next （4/1）2F 緩傾斜＆X-Wall PICK UP NEWS BAMBI’s …', 0.60::numeric, 'pending', 'B-PUMP YOKOHAMA 公式サイトから工事・メンテナンス候補を検出。日付候補は2026/04/01。Adminで工事期間、対象エリア、営業影響を確認してください。根拠抜粋: B-PUMP横浜は、 クライマーが成長し続けられる環境を追求し続けます。 Routes 100-120 routes New 1F 全面改装完了！ Next （4/1）2F 緩傾斜＆X-Wall PICK UP NEWS BAMBI’s …'),
    ('b-pump-yokohama', 'https://pump-climbing.com/gym/bpump2/#zac-2026-05-01-construction-2', 'official-site:b-pump-yokohama:2026-05-01:construction:2', 'construction', 'B-PUMP YOKOHAMA BAMBI’S BOULDER SCHOOL', 'B-PUMP YOKOHAMAの公式情報に基づく2026/05/01の工事・メンテナンス情報です。対象エリアや営業影響は公式情報で確認してください。', '2026-05-01 01:00:00.000+00'::timestamptz, '2026-05-01 02:00:00.000+00'::timestamptz, '1F 全面改装完了！ Next （4/1）2F 緩傾斜＆X-Wall PICK UP NEWS BAMBI’s Boulder School 5月カレンダー 2026.05.01 DAILY BP2 PICK UP School 『BAM…', 0.60::numeric, 'pending', 'B-PUMP YOKOHAMA 公式サイトから工事・メンテナンス候補を検出。日付候補は2026/05/01。Adminで工事期間、対象エリア、営業影響を確認してください。根拠抜粋: 1F 全面改装完了！ Next （4/1）2F 緩傾斜＆X-Wall PICK UP NEWS BAMBI’s Boulder School 5月カレンダー 2026.05.01 DAILY BP2 PICK UP School 『BAM…'),
    ('b-pump-yokohama', 'https://pump-climbing.com/gym/bpump2/#zac-2026-04-03-construction-3', 'official-site:b-pump-yokohama:2026-04-03:construction:3', 'construction', 'B-PUMP YOKOHAMA この日なら行けるのに…！', 'B-PUMP YOKOHAMAの公式情報に基づく2026/04/03の工事・メンテナンス情報です。対象エリアや営業影響は公式情報で確認してください。', '2026-04-03 01:00:00.000+00'::timestamptz, '2026-04-03 02:00:00.000+00'::timestamptz, 'ました🤗 「この日なら行けるのに…！」という日程のご相談もOKですので、 [&hellip;] BAMBI’s Boulder School 4月カレンダー 2026.04.03 INFO PICK UP School 皆様、改装後のB…', 0.60::numeric, 'pending', 'B-PUMP YOKOHAMA 公式サイトから工事・メンテナンス候補を検出。日付候補は2026/04/03。Adminで工事期間、対象エリア、営業影響を確認してください。根拠抜粋: ました🤗 「この日なら行けるのに…！」という日程のご相談もOKですので、 [&hellip;] BAMBI’s Boulder School 4月カレンダー 2026.04.03 INFO PICK UP School 皆様、改装後のB…'),
    ('base-camp-higashimurayama', 'https://b-camp.jp/higashimurayama/#zac-2026-02-01-opening_change-1', 'official-site:base-camp-higashimurayama:2026-02-01:opening_change:1', 'opening_change', 'Boulder Park Base Camp 東村山 02/01 営業変更', 'Boulder Park Base Camp 東村山の公式情報に基づく2026/02/01の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-02-01 01:00:00.000+00'::timestamptz, '2026-02-01 02:00:00.000+00'::timestamptz, '月スキルアップレッスンスケジュール 2026年03月31日 4月スキルアップレッスンスケジュール 2026年02月25日 3月スキルアップレッスンスケジュール 2026年02月01日 2月スキルアップレッスンスケジュール 2026年01月…', 0.60::numeric, 'pending', 'Boulder Park Base Camp 東村山 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/02/01。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 月スキルアップレッスンスケジュール 2026年03月31日 4月スキルアップレッスンスケジュール 2026年02月25日 3月スキルアップレッスンスケジュール 2026年02月01日 2月スキルアップレッスンスケジュール 2026年01月…'),
    ('base-camp-higashimurayama', 'https://b-camp.jp/higashimurayama/#zac-2026-01-11-opening_change-2', 'official-site:base-camp-higashimurayama:2026-01-11:opening_change:2', 'opening_change', 'Boulder Park Base Camp 東村山 01/11 営業変更', 'Boulder Park Base Camp 東村山の公式情報に基づく2026/01/11の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-01-11 01:00:00.000+00'::timestamptz, '2026-01-11 02:00:00.000+00'::timestamptz, '月スキルアップレッスンスケジュール 2026年02月25日 3月スキルアップレッスンスケジュール 2026年02月01日 2月スキルアップレッスンスケジュール 2026年01月11日 １月 スキルアップレッスン スケジュール ピックアップ…', 0.60::numeric, 'pending', 'Boulder Park Base Camp 東村山 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/01/11。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 月スキルアップレッスンスケジュール 2026年02月25日 3月スキルアップレッスンスケジュール 2026年02月01日 2月スキルアップレッスンスケジュール 2026年01月11日 １月 スキルアップレッスン スケジュール ピックアップ…'),
    ('base-camp-higashimurayama', 'https://b-camp.jp/higashimurayama/#zac-2026-04-01-opening_change-3', 'official-site:base-camp-higashimurayama:2026-04-01:opening_change:3', 'opening_change', 'Boulder Park Base Camp 東村山 04/01 営業変更', 'Boulder Park Base Camp 東村山の公式情報に基づく2026/04/01の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-04-01 01:00:00.000+00'::timestamptz, '2026-04-01 02:00:00.000+00'::timestamptz, 'ル 2026年01月11日 １月 スキルアップレッスン スケジュール ピックアップ情報一覧 ルート情報 ROUTE INFO NEW 4月セットスケジュール ＊4/1(水)21:00～KWLのホールド外し 4/2(木)14:00 OPEN…', 0.60::numeric, 'pending', 'Boulder Park Base Camp 東村山 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/04/01。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: ル 2026年01月11日 １月 スキルアップレッスン スケジュール ピックアップ情報一覧 ルート情報 ROUTE INFO NEW 4月セットスケジュール ＊4/1(水)21:00～KWLのホールド外し 4/2(木)14:00 OPEN…'),
    ('urban-base-camp-shinjuku', 'https://b-camp.jp/shinjuku/#zac-2026-05-08-opening_change-1', 'official-site:urban-base-camp-shinjuku:2026-05-08:opening_change:1', 'opening_change', 'Urban Base Camp 新宿 Body movin&#8217;', 'Urban Base Camp 新宿の公式情報に基づく2026/05/08の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-05-08 01:00:00.000+00'::timestamptz, '2026-05-08 02:00:00.000+00'::timestamptz, 'っぷりとご紹介します アクセス アクセスマップはこちらから 事前登録のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月08日 NEW 料金改定とお得なキャンペーンのお知らせ 202…', 0.60::numeric, 'pending', 'Urban Base Camp 新宿 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/05/08。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: っぷりとご紹介します アクセス アクセスマップはこちらから 事前登録のお願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月08日 NEW 料金改定とお得なキャンペーンのお知らせ 202…'),
    ('urban-base-camp-shinjuku', 'https://b-camp.jp/shinjuku/#zac-2026-03-29-opening_change-2', 'official-site:urban-base-camp-shinjuku:2026-03-29:opening_change:2', 'opening_change', 'Urban Base Camp 新宿 Body movin&#8217;', 'Urban Base Camp 新宿の公式情報に基づく2026/03/29の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-03-29 01:00:00.000+00'::timestamptz, '2026-03-29 02:00:00.000+00'::timestamptz, '願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月08日 NEW 料金改定とお得なキャンペーンのお知らせ 2026年03月29日 ゴールデンウイーク営業時間のご案内 2026年03月1…', 0.60::numeric, 'pending', 'Urban Base Camp 新宿 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/03/29。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: 願い 事前の登録でご来店時の受付がスムーズになります ピックアップ情報 PICK UP 2026年05月08日 NEW 料金改定とお得なキャンペーンのお知らせ 2026年03月29日 ゴールデンウイーク営業時間のご案内 2026年03月1…'),
    ('urban-base-camp-shinjuku', 'https://b-camp.jp/shinjuku/#zac-2026-03-12-opening_change-3', 'official-site:urban-base-camp-shinjuku:2026-03-12:opening_change:3', 'opening_change', 'Urban Base Camp 新宿 Body movin&#8217;', 'Urban Base Camp 新宿の公式情報に基づく2026/03/12の営業変更情報です。営業時間や営業影響は公式情報で確認してください。', '2026-03-12 01:00:00.000+00'::timestamptz, '2026-03-12 02:00:00.000+00'::timestamptz, 'アップ情報 PICK UP 2026年05月08日 NEW 料金改定とお得なキャンペーンのお知らせ 2026年03月29日 ゴールデンウイーク営業時間のご案内 2026年03月12日 リソール受付について 2026年02月13日 第5回【…', 0.60::numeric, 'pending', 'Urban Base Camp 新宿 公式サイトから営業時間・休業変更候補を検出。日付候補は2026/03/12。Adminで変更日、営業時間、休業/短縮営業の範囲を確認してください。根拠抜粋: アップ情報 PICK UP 2026年05月08日 NEW 料金改定とお得なキャンペーンのお知らせ 2026年03月29日 ゴールデンウイーク営業時間のご案内 2026年03月12日 リソール受付について 2026年02月13日 第5回【…'),
    ('base-camp-hanno', 'https://b-camp.jp/hanno#zac-2018-08-08-competition-1', 'official-site:base-camp-hanno:2018-08-08:competition:1', 'competition', 'Boulder Park Base Camp 飯能店 08/08 コンペ', 'Boulder Park Base Camp 飯能店の公式情報に基づく2018/08/08のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2018-08-08 01:00:00.000+00'::timestamptz, '2018-08-08 02:00:00.000+00'::timestamptz, 'ただけます！元世界チャンピオンの平山ユージがベースキャンプのオーナーです。 --> --> --> --> --> ピックアップ情報 PICK UP MORE 2018年08月08日 Bouldering Japan Cup 2019 J…', 0.60::numeric, 'pending', 'Boulder Park Base Camp 飯能店 公式サイトからコンペ・大会候補を検出。日付候補は2018/08/08。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: ただけます！元世界チャンピオンの平山ユージがベースキャンプのオーナーです。 --> --> --> --> --> ピックアップ情報 PICK UP MORE 2018年08月08日 Bouldering Japan Cup 2019 J…'),
    ('base-camp-hanno', 'https://b-camp.jp/hanno#zac-2026-05-11-competition-2', 'official-site:base-camp-hanno:2026-05-11:competition:2', 'competition', 'Boulder Park Base Camp 飯能店 05/11 コンペ', 'Boulder Park Base Camp 飯能店の公式情報に基づく2026/05/11のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-11 01:00:00.000+00'::timestamptz, '2026-05-11 02:00:00.000+00'::timestamptz, 'UP MORE 2018年08月08日 Bouldering Japan Cup 2019 JMSCA公認予選 Base Camp Tokyo大会 特設ページ 2026年05月11日 NEW 料金改定とお得なキャンペーンのお知らせ 202…', 0.60::numeric, 'pending', 'Boulder Park Base Camp 飯能店 公式サイトからコンペ・大会候補を検出。日付候補は2026/05/11。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: UP MORE 2018年08月08日 Bouldering Japan Cup 2019 JMSCA公認予選 Base Camp Tokyo大会 特設ページ 2026年05月11日 NEW 料金改定とお得なキャンペーンのお知らせ 202…'),
    ('base-camp-hanno', 'https://b-camp.jp/hanno#zac-2026-05-01-competition-3', 'official-site:base-camp-hanno:2026-05-01:competition:3', 'competition', 'Boulder Park Base Camp 飯能店 05/01 コンペ', 'Boulder Park Base Camp 飯能店の公式情報に基づく2026/05/01のコンペ・大会情報です。開催日や申込方法は公式情報で確認してください。', '2026-05-01 01:00:00.000+00'::timestamptz, '2026-05-01 02:00:00.000+00'::timestamptz, 'Cup 2019 JMSCA公認予選 Base Camp Tokyo大会 特設ページ 2026年05月11日 NEW 料金改定とお得なキャンペーンのお知らせ 2026年05月01日 6月臨時休業と営業時間変更のお知らせ 2026年04月1…', 0.60::numeric, 'pending', 'Boulder Park Base Camp 飯能店 公式サイトからコンペ・大会候補を検出。日付候補は2026/05/01。Adminで開催日、対象店舗、参加条件、申込要否を確認してください。根拠抜粋: Cup 2019 JMSCA公認予選 Base Camp Tokyo大会 特設ページ 2026年05月11日 NEW 料金改定とお得なキャンペーンのお知らせ 2026年05月01日 6月臨時休業と営業時間変更のお知らせ 2026年04月1…')
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
  '2026-05-18 02:35:28.000+00'::timestamptz,
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
