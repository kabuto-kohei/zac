# Zac v5 システム設計

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`

---

## 1. 基本方針

MVPは、TypeScriptを中心にしてユーザー向けWeb、管理画面、API、型定義をできるだけ一貫させる。モバイルアプリはWeb版検証後の後続フェーズとする。

推奨構成は次の通り。

```text
[User Web App: Next.js]
        |
        v
[API/BFF: Hono + TypeScript]
        |
        +--> [Supabase Postgres + PostGIS-ready]
        +--> [Supabase Storage]
        +--> [Supabase Auth]
        +--> [PostHog]
        +--> [Sentry]
        |
        v
[Admin Web: Next.js]
```

---

## 2. コンポーネント

| コンポーネント | 役割 | MVP判断 |
|---|---|---|
| User Web App | 一般ユーザー向けWebアプリ | 必須 |
| Admin Web | 運営管理画面 | 必須 |
| API/BFF | 認証後API、公開範囲制御、フィード生成 | 必須 |
| PostgreSQL | 永続データ | 必須 |
| PostGIS | 位置検索 | 初期は拡張前提。近隣検索開始時に有効化 |
| Supabase Storage | 画像保存 | 必須 |
| Supabase Auth | ユーザー認証 | 必須 |
| Analytics | KPI計測 | 必須 |
| Error Monitoring | 障害検知 | 必須 |

---

## 3. 推奨技術選定

### 3.1 固定構成

| レイヤー | 技術 |
|---|---|
| User Web | Next.js + TypeScript |
| Admin Web | Next.js + TypeScript |
| API | Hono + TypeScript |
| API hosting | Vercel |
| DB | Supabase Postgres |
| ORM/Migration | Drizzle ORM + drizzle-kit |
| Validation | Zod |
| OpenAPI | `@hono/zod-openapi` |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Analytics | PostHog |
| Error Monitoring | Sentry |

### 3.2 固定理由

Auth、DB、StorageはSupabaseに寄せる。これにより、認証済みユーザー、private media、PostgreSQLの関係性データを1つの運用境界で扱える。APIはHonoで薄いBFFを作り、公開範囲、ブロック、管理者権限をサーバー側に集約する。

---

## 4. 境界設計

### 4.1 User Web App

- APIを直接呼び出す。
- DBへ直接アクセスしない。
- 公開範囲判定をUIだけに依存しない。
- APIレスポンスで表示可能なデータだけを受け取る。

### 4.2 Admin Web

- 管理者APIのみを呼び出す。
- 管理者権限はサーバー側で検証する。
- 管理者操作は必ず `audit_logs` に記録する。

### 4.3 API/BFF

- 認証、認可、公開範囲、ブロックを必ずサーバー側で判定する。
- フィード生成ロジックを集約する。
- DBスキーマの内部表現をそのままクライアントへ漏らさない。
- エラー形式を統一する。

### 4.4 DB

- UGCはソフトデリートを基本にする。
- 認証情報や削除要求対象の個人情報は匿名化/削除方針を別途適用する。
- 公開範囲はDBカラムとして必ず保持する。

---

## 5. 主要ドメイン

| ドメイン | 主なテーブル | 主要API |
|---|---|---|
| User | `users`, `user_profiles`, `user_settings` | `/v1/me`, `/v1/users` |
| Social | `follows`, `blocks` | `/v1/users/{id}/follow`, `/v1/users/{id}/block` |
| Gym | `gyms`, `gym_images`, `gym_saves` | `/v1/gyms` |
| Plan | `session_plans`, `session_plan_participants` | `/v1/session-plans` |
| Log | `climbing_logs`, `climbing_log_images` | `/v1/logs` |
| Post | `posts`, `post_images`, `comments` | `/v1/posts` |
| Safety | `reports`, `moderation_actions` | `/v1/reports`, `/v1/admin/reports` |
| Notification | `notifications`, `announcements` | `/v1/notifications`, `/v1/announcements` |

---

## 6. データフロー

### 6.1 予定作成

```text
User Web App
  -> POST /v1/session-plans
  -> API validates input/auth/visibility
  -> DB inserts session_plans
  -> DB inserts creator as participant
  -> API returns plan
  -> Analytics records session_plan_created
```

### 6.2 予定から記録

```text
User Web App
  -> POST /v1/session-plans/{planId}/convert-to-log
  -> API checks participant/owner permissions
  -> DB inserts climbing_logs linked to session_plan_id
  -> session_plans optionally marked completed
  -> API returns log
  -> Analytics records log_created
```

### 6.3 記録から投稿

```text
User Web App
  -> POST /v1/logs/{logId}/convert-to-post
  -> API checks log ownership
  -> DB inserts posts with source_type=climbing_log
  -> API returns post
  -> Analytics records log_converted_to_post and post_created
```

---

## 7. 内部AI基盤との分離

`org-os-zac` は、プロダクト本体とは別リポジトリで管理する。

| 項目 | Zac本体 | org-os-zac |
|---|---|---|
| 目的 | ユーザー向けClimb Life OS | 開発/運営AI基盤 |
| データ | ユーザー、予定、記録、投稿 | Issue、PR、ログ、タスク |
| 本番影響 | 直接あり | human-gate経由 |
| リポジトリ | 本体repo | 別repo |

MVP実装では `org-os-zac` を本体実装のブロッカーにしない。
