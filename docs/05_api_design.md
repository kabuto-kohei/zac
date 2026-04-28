# Zac v5 API設計

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`

---

## 1. 基本方針

- API prefixは `/v1`。
- REST APIを基本にする。
- OpenAPIで仕様を管理する。
- 入力バリデーションはZod等で共通化する。
- 認可、公開範囲、ブロックはサーバー側で必ず判定する。
- 管理者APIは `/v1/admin` に分離する。

---

## 2. 認証

### 2.1 認証方式

認証はSupabase Authに固定する。APIはBearer Tokenを受け取り、サーバー側でSupabase JWTを検証してユーザーIDと権限を解決する。

```http
Authorization: Bearer <token>
```

### 2.2 権限

| 権限 | 説明 |
|---|---|
| anonymous | 未ログイン |
| user | 通常ユーザー |
| admin | 管理者 |
| suspended | 停止ユーザー |

---

## 3. 共通レスポンス

### 3.1 成功

```json
{
  "data": {}
}
```

一覧系:

```json
{
  "data": [],
  "page": {
    "limit": 20,
    "cursor": "next_cursor",
    "hasNext": true
  }
}
```

### 3.2 エラー

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request.",
    "details": {}
  }
}
```

主なエラーコード:

| code | HTTP | 意味 |
|---|---:|---|
| `unauthorized` | 401 | 未認証 |
| `forbidden` | 403 | 権限不足 |
| `not_found` | 404 | 存在しない、または表示不可 |
| `validation_error` | 422 | 入力不正 |
| `conflict` | 409 | 重複、状態不整合 |
| `rate_limited` | 429 | レート制限 |
| `internal_error` | 500 | サーバーエラー |

表示不可のリソースは、情報漏えいを避けるため `403` ではなく `404` を返す場合がある。

---

## 4. 公開API

```http
GET /v1/gyms
GET /v1/gyms/{gymId}
GET /v1/events
GET /v1/events/{eventId}
```

公開APIでも、削除済み・非公開・モデレーション対象のデータは返さない。

---

## 5. 認証API

```http
POST   /v1/auth/register
POST   /v1/auth/login
POST   /v1/auth/logout
POST   /v1/auth/password/reset
GET    /v1/me
PATCH  /v1/me/profile
PATCH  /v1/me/settings
DELETE /v1/me
```

Auth Providerを使う場合、`register/login/reset` はProvider SDKへ委譲し、Zac APIではプロフィール初期化とユーザー状態管理を担う。

---

## 6. ユーザー/関係性API

```http
GET    /v1/users/{userId}
GET    /v1/users/{userId}/posts
GET    /v1/users/{userId}/logs
POST   /v1/users/{userId}/follow
DELETE /v1/users/{userId}/follow
POST   /v1/users/{userId}/block
DELETE /v1/users/{userId}/block
GET    /v1/me/blocks
```

ブロック時の挙動:

- フォロー関係を解除する。
- 相互にフィード、検索、予定、投稿、コメントで表示しない。
- 既存コメントは通常画面では相互に非表示にする。監査・通報対応に必要な最小データは管理者権限でのみ参照する。

---

## 7. ジムAPI

```http
GET    /v1/gyms
GET    /v1/gyms/{gymId}
POST   /v1/gyms/{gymId}/save
DELETE /v1/gyms/{gymId}/save
GET    /v1/gyms/{gymId}/updates
GET    /v1/gyms/{gymId}/posts
GET    /v1/gyms/{gymId}/plans
GET    /v1/events
GET    /v1/events/{eventId}
POST   /v1/events/{eventId}/save
DELETE /v1/events/{eventId}/save
```

主なクエリ:

```http
GET /v1/gyms?q=pump&area=tokyo&discipline=boulder&cursor=...
```

---

## 8. 予定API

```http
GET    /v1/session-plans
POST   /v1/session-plans
GET    /v1/session-plans/{planId}
PATCH  /v1/session-plans/{planId}
DELETE /v1/session-plans/{planId}
POST   /v1/session-plans/{planId}/join
DELETE /v1/session-plans/{planId}/join
POST   /v1/session-plans/{planId}/comments
GET    /v1/session-plans/{planId}/comments
POST   /v1/session-plans/{planId}/complete
POST   /v1/session-plans/{planId}/convert-to-log
```

### 8.1 作成リクエスト

```json
{
  "title": "火曜夜にB-PUMPで登る",
  "gymId": "uuid",
  "placeName": null,
  "disciplineId": "uuid",
  "startAt": "2026-05-01T10:00:00+09:00",
  "endAt": "2026-05-01T12:00:00+09:00",
  "visibility": "followers",
  "joinPolicy": "open",
  "maxParticipants": 4,
  "note": "軽めに登ります"
}
```

制約:

- `startAt < endAt`
- `gymId` または `placeName` のどちらか必須
- `visibility=private` の場合、参加者追加は作成者のみ

---

## 9. 記録API

```http
GET    /v1/logs
POST   /v1/logs
GET    /v1/logs/{logId}
PATCH  /v1/logs/{logId}
DELETE /v1/logs/{logId}
POST   /v1/logs/{logId}/images
DELETE /v1/log-images/{imageId}
POST   /v1/logs/{logId}/convert-to-post
```

作成制約:

- `climbedOn` は必須。
- `gymId` または `placeName` のどちらか必須。
- デフォルト公開範囲はユーザー設定に従う。

---

## 10. 投稿/フィードAPI

```http
GET    /v1/feed?tab=following|nearby|plans|latest
POST   /v1/posts
GET    /v1/posts/{postId}
PATCH  /v1/posts/{postId}
DELETE /v1/posts/{postId}
POST   /v1/posts/{postId}/like
DELETE /v1/posts/{postId}/like
POST   /v1/posts/{postId}/save
DELETE /v1/posts/{postId}/save
POST   /v1/posts/{postId}/comments
GET    /v1/posts/{postId}/comments
DELETE /v1/comments/{commentId}
```

フィードは次を除外する。

- ブロック済みユーザーのコンテンツ
- 通報中でレビュー待ちのコンテンツ
- 削除済みコンテンツ
- 公開範囲外コンテンツ
- 過度に連投された同一ユーザー投稿

コメントの表示可否は、コメント単体ではなく対象リソースの公開範囲を継承する。たとえば非公開ログへのコメントは、当該ログを閲覧できるユーザーにだけ返す。

---

## 11. 通知/通報API

```http
GET    /v1/notifications
PATCH  /v1/notifications/{notificationId}/read
POST   /v1/reports
GET    /v1/announcements
```

通報対象:

- `post`
- `comment`
- `session_plan`
- `climbing_log`
- `user`

---

## 12. メディアAPI

画像アップロードはAPIで認可確認後、Supabase Storageのsigned upload URLを発行する。

```http
POST   /v1/media/upload-urls
POST   /v1/media/complete
DELETE /v1/media/{mediaId}
```

制約:

- ユーザーUGC画像は `user-media` bucket。
- ジム画像は管理者のみ `gym-public` bucket。
- 投稿/記録画像は最大4枚。
- 1ファイル上限は5MB。
- signed URLは対象リソースへの権限確認後に発行する。

---

## 13. 管理者API

```http
GET    /v1/admin/users
GET    /v1/admin/posts
GET    /v1/admin/gyms
POST   /v1/admin/gyms
PATCH  /v1/admin/gyms/{gymId}
POST   /v1/admin/gyms/{gymId}/updates
PATCH  /v1/admin/gym-updates/{updateId}
GET    /v1/admin/events
POST   /v1/admin/events
PATCH  /v1/admin/events/{eventId}
GET    /v1/admin/announcements
POST   /v1/admin/announcements
PATCH  /v1/admin/announcements/{announcementId}
GET    /v1/admin/reports
PATCH  /v1/admin/reports/{reportId}
POST   /v1/admin/moderation-actions
GET    /v1/admin/audit-logs
```

管理者APIはすべて:

- admin権限必須
- 監査ログ必須
- ページネーション必須

---

## 14. OpenAPI化するときの注意

- Request/Response schemaは `packages/shared` と重複させない。
- APIエラー形式を全endpointに適用する。
- 認証必須/任意/管理者必須を明示する。
- 公開範囲によって `404` になるケースを説明に書く。
