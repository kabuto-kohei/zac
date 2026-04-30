# Zac v5 非UI完成度棚卸し

作成日: 2026-04-29

目的: UX/UIの最終調整を除き、MVP完成に必要な設計・設定・API・DB・品質ゲートの現状を整理する。

---

## 1. 完了扱いにできるもの

| 領域 | 状態 | 根拠 |
|---|---|---|
| Monorepo構成 | 完了 | `apps/web`, `apps/admin`, `packages/api`, `packages/db`, `packages/shared` が存在 |
| Node/pnpm固定 | 完了 | `.node-version`, `.nvmrc`, `packageManager` |
| アイコン配置 | 完了 | `apps/web/public/icons/zac/` と `zac-icons.tsx` |
| Web主要ルート | 完了 | home/explore/plans/logs/posts/gyms/events/me/settings |
| Admin画面骨格 | 完了 | dashboard/users/gyms/events/posts/reports/audit-logs/announcements |
| API基本ルート | 完了 | health, integrations, gyms, events, plans, logs, posts, feed, reports, announcements |
| コアループAPI | 完了 | 予定作成/参加/完了/記録変換、記録作成/投稿変換、投稿/コメント/保存/いいね |
| DB schema基盤 | 完了 | Drizzle schemaとmigrationにMVP主要テーブルを定義 |
| RLS防御方針 | 完了 | `0001_enable_rls_defense.sql` と追加テーブルRLS |
| seed | 完了 | disciplines/categories/初期ジム |
| Secret scan | 完了 | `scripts/secret-scan.mjs` |
| 設定監査 | 完了 | `scripts/config-audit.mjs` |
| OpenAPI成果物 | 完了 | `openapi/zac-openapi.json` とcheck/generate |
| CI | 完了 | `.github/workflows/check.yml` |
| 品質ゲート | 完了 | `pnpm check` にlint/typecheck/test/OpenAPI/config/build/secret scanを統合 |

---

## 2. 実装済みだが外部設定待ちのもの

| 領域 | 状態 | 次に必要なこと |
|---|---|---|
| Supabase Auth | 接続コードあり | 実env設定、メール認証設定、認証必須化範囲の確定 |
| Supabase Postgres | DB接続コードあり | migration適用、seed適用、接続確認 |
| Supabase Storage | bucket名設定あり | bucket作成、policy確認、signed upload API実装 |
| PostHog | client/server送信コードあり | project key設定、送信内容のPII確認 |
| Sentry | client/server初期化あり | DSN/token設定、source map運用確認 |
| Vercel | project metadataあり | production/development envの最終確認 |

---

## 3. Human Gate対象

次は承認なしに進めない。

- 本番または共有Supabaseへのmigration実行
- Supabase Auth/role/RLS policyの本番変更
- Storage bucket/policyの本番変更
- Secretの閲覧、表示、差し替え
- 退会、削除、モデレーション非表示など破壊的/準破壊的操作
- deploy、release、push

---

## 4. 公開前ゲート

| リスク | 内容 | 対応 |
---|---|---|
| production fallback | production-likeではfixture/memory fallbackを公開データとして返さない | `docs/35_mvp_design_code_audit.md` で確認済み |
| feed visibility | visibility-serviceとblocklist-serviceは実装済み | 本番相当環境でユーザーA/B検証を行う |
| media | signed upload URL、添付、削除ジョブを実装済み | 本番Storage bucket/policyを外部ゲートで確認 |
| admin | admin API、requireAdmin、audit log、イベント/お知らせ作成編集を実装済み | 初期Admin登録を外部ゲートで実施 |
| notification | Webアプリ内通知APIを実装済み | 本番DB接続後に通知作成トリガーを確認 |
| migration journal | 追加migrationは手書き | 次回Drizzle生成時にmeta整合を確認 |

---

## 5. 次の非UI優先順位

1. Supabase接続環境でmigration/seedを適用する前のdry run確認。
2. 本番相当環境でStorage signed upload、添付、削除ジョブを確認する。
3. 本番相当環境でvisibility-serviceとblocklist-serviceのユーザーA/B検証を行う。
4. 初期Admin登録を承認済み運用作業として実施する。
5. Web版UX/UI完成後に実ブラウザE2Eを実施する。

UX/UIの最終調整は、この後に実施する。
