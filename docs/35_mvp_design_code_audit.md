# Zac MVP 設計・コード整合性監査

作成日: 2026-04-30

## 目的

UX/UI制作へ移る前に、MVPの設計、公開運用、認証境界、API、Web/Admin実装が矛盾なく接続されているかを確認する。

## 判定

ローカルコード、設計文書、API契約、品質ゲートの範囲では、UX/UI作業へ進む前提は完了している。

一方で、Supabase本番相当環境でのmigration/seed/Auth/Storage/RLS確認、Admin初期登録、法務文言レビュー、実ブラウザE2E確認は外部ゲートである。これらはUX/UI作業の前提ではなく、公開前ゲートとして `docs/34_public_operations_readiness.md` に従って実施する。

## 確認結果

| 領域 | 判定 | 内容 |
|---|---|---|
| 認証基盤 | 整合 | 設計・実装ともSupabase Auth前提。Firebase/Auth移行は現設計と衝突するため、別判断が必要 |
| OAuth | 整合 | MVPでは対象外。Google OAuthはWeb版検証後の後続候補 |
| ゲスト閲覧 | 整合化済み | 公開ジム、イベント、公開投稿、公開予定はゲスト閲覧可。保存、参加、作成、コメント、設定はログイン必須 |
| コアループ | 整合 | ジム閲覧、保存、予定作成/参加/完了、記録作成、投稿、コメントのAPIと画面が存在 |
| Admin運用 | 改善済み | イベント・お知らせの作成/編集、監査ログ、公開/下書き切替の導線を追加 |
| メディア | 改善済み | signed upload URL、添付、未紐付け削除ジョブが存在。cleanup limitの不正値を安全化 |
| 法務導線 | 改善済み | `/legal/terms`, `/legal/privacy` と設定画面からの導線を追加 |
| OpenAPI | 整合 | Admin content mutationとEvent descriptionをOpenAPIへ反映 |

## 修正した不整合

- 公開イベント/お知らせの詳細で、下書きがID直打ちにより見える可能性を防止した。
- Admin更新で存在しないUUIDを成功扱いする可能性を防止した。
- イベント説明文をAPI summary、Admin編集、Web詳細、OpenAPIで一貫して扱うようにした。
- 保存、参加、いいね、コメント作成が存在しない対象に対して成功扱いになる可能性を防止した。
- コメント一覧/作成が対象リソースの閲覧可否を確認するようにした。
- `MEDIA_CLEANUP_LIMIT` が不正値の場合も安全な既定値に丸めるようにした。
- production-like環境ではfixture/memory fallbackを公開データとして返さないようにした。
- production-like環境ではDB永続化失敗時にmemory fallbackで成功扱いにしないようにした。
- 設計文書の古い「/home以降ログイン必須」を、現方針の「ゲスト閲覧可、操作はログイン必須」へ更新した。

## 公開前ゲート

| ゲート | 状態 | 次の対応 |
|---|---|---|
| 本番RLS実効性 | 外部ゲート | 本番相当SupabaseでユーザーA/Bを使って非公開データが見えないことを確認 |
| Admin初期登録 | 外部ゲート | 承認済み本番DB操作として `admin_memberships` を登録 |
| 外部設定 | 外部ゲート | Supabase Auth redirect、Storage bucket、PostHog、Sentry、Vercel envを確認 |
| 法務文言 | 外部ゲート | `/legal/terms`, `/legal/privacy` を正式文言へ差し替え |
| 実ブラウザE2E | UX/UI工程内ゲート | Web版UX/UI完成後に主要導線を実ブラウザ確認 |
| 退会/削除 | 公開前の別実装ゲート | 破壊的操作のため人間承認後に実装 |

## UX/UI移行条件

次の条件で、Web版UX/UI作業へ移行する。

- Auth ProviderはSupabase Authのまま進める。
- Google OAuth/FirebaseはMVP後続候補として扱い、今回のUX/UI前提に入れない。
- ゲスト閲覧を第一導線にし、保存・参加・作成・コメント時にログイン誘導する。
- FigmaではZac固有の情報設計を作る。Zenn風の「読む/保存/ログイン後マイページ」導線は参考にするが、Zacの予定・記録・ジム保存を主軸にする。
