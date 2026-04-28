# Zac v5 ドメイン責務・サービス境界設計

作成日: 2026-04-28  
目的: API実装時に責務が散らばらないよう、route、service、query、transaction、event計測の境界を固定する。

---

## 1. 基本方針

route handlerには薄いHTTP処理だけを置く。  
認可、公開範囲、ブロック、状態遷移、DB transactionはservice層へ集約する。

```text
route
  -> schema validation
  -> auth middleware
  -> domain service
  -> query/repository
  -> DB
```

---

## 2. レイヤー責務

| レイヤー | 責務 | 禁止 |
|---|---|---|
| route | HTTP method/path、request/response、status code | 複雑なDB query、公開範囲判定 |
| middleware | auth、admin auth、rate limit、error handling | ドメイン状態変更 |
| schema | Zod validation、OpenAPI schema | DBアクセス |
| service | 認可、状態遷移、transaction、analytics発火 | HTTP固有処理 |
| query/repository | SQL/Drizzle query | 認可判断 |
| shared | enum、入力schema、共通型 | service role key、DB内部事情の露出 |

---

## 3. ドメインサービス

| service | 主な責務 |
|---|---|
| `auth-service` | Supabase Auth連携、Zac user初期化 |
| `profile-service` | profile/settings/onboarding |
| `gym-service` | gym一覧/詳細/保存、gym update |
| `session-plan-service` | 予定作成、参加、完了、記録変換 |
| `climbing-log-service` | 記録作成、編集、削除、投稿変換 |
| `post-service` | 投稿作成、カテゴリ、いいね、保存 |
| `comment-service` | 対象visibility継承、コメント作成/削除 |
| `feed-service` | mixed feed生成、表示抑制 |
| `visibility-service` | visibility判定 |
| `blocklist-service` | block/follow表示抑制 |
| `media-service` | signed upload URL、signed read URL、削除job |
| `moderation-service` | report、moderation action |
| `admin-service` | admin権限、audit log |
| `notification-service` | Webアプリ内通知 |
| `analytics-service` | PostHogイベント発火 |

---

## 4. Transaction境界

### 4.1 必ずtransactionにする処理

| 処理 | 同時に行うこと |
|---|---|
| ユーザー初期化 | `users`, `user_profiles`, `user_settings` 作成 |
| 予定作成 | `session_plans` 作成、作成者をparticipantに追加、analytics |
| 予定参加 | participant upsert、notification、analytics |
| 予定から記録 | log作成、plan status更新、analytics |
| 記録から投稿 | post作成、post_categories、analytics |
| 退会 | user/profile/settings/UGC削除、media jobs、audit |
| 通報対応 | report更新、moderation_action、audit |
| 管理者更新 | 対象更新、audit |

### 4.2 transaction外でよい処理

- PostHog送信のretry
- Sentry通知
- media物理削除
- 将来のメール送信

transaction外処理は失敗しても主処理を巻き戻さない。ただし必要ならjobとして再実行する。

---

## 5. 状態遷移

`session_plans.status`:

```text
draft -> scheduled -> active -> completed
                 \-> cancelled
```

禁止:

- `completed -> scheduled`
- `cancelled -> active`
- `deleted_at is not null` の対象更新

---

## 6. Idempotency

MVPで冪等にする処理:

- follow
- unfollow
- block
- unblock
- gym save/unsave
- event save/unsave
- post like/unlike
- post save/unsave
- session plan join/cancel

重複作成を避けるため、DBのunique/primary key制約を正とする。

---

## 7. Analytics発火位置

analyticsはrouteではなくserviceで発火する。  
DB変更が成功した後に発火し、analytics送信失敗でAPI本体を失敗扱いにしない。

---

## 8. エラー方針

service層は内部例外をそのまま投げず、domain errorへ変換する。

| domain error | HTTP |
|---|---:|
| `NotAuthenticated` | 401 |
| `Forbidden` | 403 |
| `NotVisible` | 404 |
| `NotFound` | 404 |
| `ValidationFailed` | 422 |
| `Conflict` | 409 |

表示不可は原則 `NotVisible -> 404`。
