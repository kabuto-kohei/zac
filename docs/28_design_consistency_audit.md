# Zac v5 設計書整合性監査

作成日: 2026-04-28  
対象: `docs/*.md` 全文書  
目的: コード実装開始前に、統一性、整合性、矛盾、設計の穴を確認する。

---

## 1. 監査結果

2026-04-28時点で、初期MVP実装を妨げる重大な矛盾は解消済み。

初期MVPの前提は次で統一する。

- 初期段階はWebアプリ。
- モバイルアプリはWeb版検証後の後続フェーズ。
- 認証はSupabase Authのメール/パスワード。
- OAuthはMVP対象外。Web版検証後にGoogle OAuthから追加。
- Push通知はMVP対象外。Webアプリ内通知を先行。
- APIはHono。
- DBはSupabase Postgres。
- ORM/MigrationはDrizzle ORM + drizzle-kit。
- StorageはSupabase Storage。
- API service層で認可/公開範囲/ブロックを判定し、RLSは防御層として使う。
- route/service/queryの責務境界を分離する。
- User Web/AdminはNext.js App Routerで実装し、Hono APIだけを呼ぶ。
- PR/CI/release gateでlint、typecheck、test、build、migration、OpenAPI、secret漏れを確認する。

---

## 2. 修正済みの不整合

| 領域 | 問題 | 対応 |
|---|---|---|
| Web/Mobile | 初期MVPがMobile前提の文書が残っていた | User Web App / Next.js前提へ統一 |
| OAuth | 要件ではOAuthあり、外部設定では後続扱いだった | MVPではOAuthなし、後続でGoogle OAuthと固定 |
| Push | MVP外なのに構成図にPush Providerがあった | 初期構成図から除外し、将来フェーズへ移動 |
| DB | `admin_memberships` が認可設計で参照されるがDBに無かった | DB設計へ追加 |
| DB | `media_deletion_jobs` がStorage/削除設計で参照されるがDBに無かった | DB設計へ追加 |
| DB/API | events APIがあるがDBテーブルが不足していた | `events`, `event_images`, `event_saves` を追加 |
| DB/API | notifications APIがあるがDBテーブルが不足していた | `notifications`, `announcements` を追加 |
| Feed | gym updatesが要件にあるがDB/APIが不足していた | `gym_updates` とAPIを追加 |
| Directory | events/media/announcementsのroute/schema配置が不足 | ディレクトリ構成へ追加 |
| UUID | DB側UUID生成方針とSQL例の表記がずれていた | `users.id` はSupabase Auth ID、それ以外は `gen_random_uuid()` 方針に整理 |
| 投稿カテゴリ | UI/APIに投稿カテゴリがあるがDB関連が不足していた | `post_categories` を追加 |
| コメント認可 | 汎用コメントの公開範囲継承ルールが曖昧だった | 対象リソースのvisibilityを継承すると明記 |
| 実装責務 | route/service/query/transaction境界が薄かった | `29_domain_service_contracts.md` を追加 |
| Web構造 | Web App Router、状態管理、form/error/responsive方針が薄かった | `30_web_frontend_architecture.md` を追加 |
| 品質ゲート | CI、migration、OpenAPI、secret、release gateが薄かった | `31_quality_gate_ci_cd.md` を追加 |

---

## 3. 実装前に外部で必要な確認

文書上の設計は固定済みだが、実サービス側で次を完了する必要がある。

- GitHub repository作成
- Supabase project作成
- Supabase Auth Email/password設定
- Supabase Storage bucket作成
- Vercel project作成
- PostHog project作成
- Sentry project作成
- 初期管理者メールアドレス決定
- 初期ジム3〜5件の決定
- 利用規約/プライバシーポリシー正式化

---

## 4. 残る設計リスク

コード開始を止めるレベルの穴ではないが、実装時に重点確認する。

| リスク | 対応方針 |
|---|---|
| 公開範囲漏れ | `visibility-service` に集約し、単体/APIテスト必須 |
| service role key漏れ | Browser envへ入らないことをCI/レビューで確認 |
| 退会処理の副作用 | `24_deletion_retention_design.md` に沿って対象別テストを作る |
| Storage孤児ファイル | `media_deletion_jobs` と定期削除で対応 |
| 管理者操作の監査漏れ | admin API middlewareで `audit_logs` を強制 |

---

## 5. 判定

設計書としては、コード実装開始前に必要な主要事項は揃っている。  
次工程は、外部サービス設定とモノレポ初期化。
