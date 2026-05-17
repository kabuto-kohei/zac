# Official Source Data Architecture

Zac の MVP データは、投稿を横に足すのではなく、`gyms` と `events`
そのものを公式情報の正規データとして扱う。

## 方針

- 公開価値は「ジムの公式発信を短く、探しやすく、元情報へ戻れる形にする」こと。
- DB の主役は `gyms` と `events`。外部投稿は、それらを更新するための入力ソースであり、公開 UI の主役にはしない。
- 公開側はタイトル、要約、構造化項目、短い引用、出典リンクだけを表示する。
- 画像・動画・本文全文の再配布はしない。
- 原文全文に近い `source_raw_text` は内部監査・再生成用で、公開 API/UI には出さない。

## Canonical Tables

### `gyms`

ジムの基本情報を保持する。公式ページ、Instagram、検証日、出典表記をジム本体に織り込む。

- `website_url`: 公式店舗ページ
- `instagram_handle`, `instagram_url`: 公式SNS導線
- `source_type`: `official_site`, `official_instagram`, `manual` など
- `source_url`: 現在の公開情報の根拠
- `source_attribution`: UIで出せる出典名
- `source_verified_at`: 最後に人間または収集ジョブが確認した日時
- `source_policy`: 原則 `summary_with_link`

### `events`

イベント、講習、ルートセット、営業変更、コンペ、求人など、来店判断に影響する公式発信を保持する。

- `category`: `event`, `lesson`, `route_set`, `notice`, `competition`, `recruit`
- `summary`: 公開用の短い要約
- `capacity_text`: 定員、予約要否、営業変更などの短い補足
- `source_url`, `source_account`: 元情報への導線
- `source_quote`: 必要最小限の短い引用
- `source_raw_text`: 内部専用の原文保持欄
- `extraction_confidence`: 自動抽出の信頼度
- `review_status`, `reviewed_at`: 自動公開を防ぐレビュー状態

### `event_sources`

イベント情報の取得源候補を保持する。Instagramのフォロー一覧や公式サイトを
直接イベントとして扱わず、まず「どのアカウント/サイトを監視対象にするか」を
管理する。

- `platform`: `instagram`, `web`
- `handle`: Instagram handle または内部識別子
- `source_url`: 元アカウント/ページ
- `source_type`: `aggregator_instagram`, `official_instagram`, `official_site`, `media_summary`
- `relationship_source_handle`: コンペバイブルなど、発見元アカウント
- `discovery_source`: `user_request`, `comp_bible_following_import`, `manual_crosscheck`
- `ingestion_policy`: 原則 `summary_with_link`
- `status`: `candidate`, `approved`, `paused`, `rejected`

`event_sources` は公開UIの主役ではない。Admin/運用側で取得源を確認し、
承認済みソースから `events` へ構造化する。

## Comp Bible Intake

コンペバイブルのフォロー中アカウントは、イベント発見に有用な候補ソースとして扱う。
ただしInstagramの非公式スクレイピングでフォロー一覧、画像、投稿全文を大量取得しない。

安全な流れ:

1. ユーザー確認済みのフォロー一覧を、1行1handleのテキストにする。
2. `node scripts/generate-instagram-source-seed.mjs <handles.txt> comp_bible` で seed を生成する。
3. 生成された seed を `event_sources` に投入する。
4. 各handleを公式アカウントか確認し、`status = approved` に昇格する。
5. 投稿や公式ページからイベント候補を抽出し、`events.review_status = pending` で保存する。
6. 公開側には要約、短い引用、出典リンクだけを出す。

## Refresh Cadence

Zac のカレンダーは、以下の2階層で更新する。

1. ジム公式ソース: `gyms.instagram_handle` / `gyms.instagram_url` を持つジムは必ず `event_sources` に登録する。ジム自身の発信なので、コンペバイブルなどの集約アカウントより優先度を高く扱う。
2. 発見ソース: コンペバイブルのフォロー一覧などは候補ソースとして登録し、公式性・対象地域・クライミング関連性を確認してから `approved` に昇格する。

推奨頻度:

- 毎日朝: 承認済み `event_sources` の新着公開情報を確認し、イベント/コンペ/講習/セット替え/工事/営業変更を抽出する。
- 毎日夕方: 当日から30日以内のイベントと営業変更を再確認する。
- 週1回: ジム公式Instagram未登録のジムを洗い出し、公式サイト・Instagram・Google Business Profile・系列店舗一覧で再探索する。
- 月1回: 閉店、移転、名称変更、アカウント変更を再確認する。

公開更新ルール:

- カレンダーに出すのは `events` の正規化済みデータだけ。
- Instagram投稿本文、画像、動画は公開UIに出さない。
- 複数日にまたがるイベント/セット/工事は開始日だけをカレンダーにマークし、期間は詳細ページに表示する。
- `route_set` と `notice` はイベントではなく「セット・営業変更」側として扱う。
- 取得元リンクは詳細ページの `情報源` に置く。

非公開/内部で保持してよいもの:

- 投稿URL
- 短い引用
- 構造化した日付、場所、カテゴリ
- 再確認用の限定的な原文メモ

公開してはいけないもの:

- Instagram投稿本文全文
- 画像・動画コピー
- 元投稿の代替になる一覧表示

## MVP Seed

MVP seed は、以下を公式ソース付きで投入する。

- B-PUMP Tokyo
- Rocky Shinagawa
- Noborock Shibuya
- B-PUMP Tokyo のビギナー道場
- B-PUMP Tokyo の 4F ROOF TOP セット営業変更
- Noborock Shibuya のルートセット営業変更
- WESTROCK / TAMAX / BLoC / BASE CAMP TOKYO 江戸川橋のイベント初期バッチ
- コンペバイブル起点の `event_sources` 初期候補

日付付きイベントは、来店前に必ず `source_url` へ戻れる設計にする。

## Public API Rule

公開 API が返してよいもの:

- `title`
- `summary`
- `description`
- `category`
- `startsAt`, `endsAt`
- `capacity`
- `sourceUrl`
- `sourceLabel`
- `sourceQuote`

公開 API が返してはいけないもの:

- `source_raw_text`
- 画像・動画のコピー
- キャプション全文
- 管理者レビュー前の未承認抽出結果

## Ingestion Shape

将来の収集ジョブは、外部投稿を直接 UI に出さず、以下の流れで正規テーブルに反映する。

1. 公式ソースを取得する。
2. 取得元 URL、投稿日時、短い根拠抜粋だけを保存する。キャプション全文、HTML 全文、画像、動画は保存しない。
3. `category`, `title`, `summary`, `starts_at`, `ends_at`, `capacity_text`, `source_quote`, `decision_note` を抽出する。
4. カレンダー候補はカテゴリ別の整形型に通してから `review_status = pending` で保存する。
5. 人間またはルールベース検査で承認後、公開 API に出す。

カテゴリ別の整形型は `competition`, `event`, `route_set`,
`opening_change`, `private_booking`, `construction` を基本単位にする。
各型はタイトル接尾辞、要約名、Admin が確認すべき観点、容量/申込欄の
初期値を持つ。これにより、Instagram 由来・公式サイト由来・候補昇格後の
表示が同じ粒度になる。

これにより、Zac は Instagram の代替表示ではなく、ジム公式情報へのナビゲーションと予定判断のための構造化レイヤーになる。
