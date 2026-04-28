# Zac v5 認可・RLS詳細設計

作成日: 2026-04-28  
目的: Supabase Auth、API認可、RLS、管理者権限、service roleの使い分けを固定する。

---

## 1. 基本方針

MVPでは、クライアントからDBへ直接アクセスしない。  
User Web/AdminはHono APIだけを呼び、APIがSupabase JWTを検証してDBへアクセスする。

```text
Browser
  -> Hono API
  -> Supabase Auth JWT検証
  -> API service層で認可/公開範囲/ブロック判定
  -> Supabase Postgres
```

RLSは「主たる認可」ではなく「防御層」として使う。  
service role keyはAPIサーバーだけが保持し、Browser/Adminのクライアントには絶対に渡さない。

---

## 2. 権限モデル

| 権限 | 説明 | 判定場所 |
|---|---|---|
| anonymous | 未ログイン | API middleware |
| user | 通常ログインユーザー | Supabase JWT + `users.status` |
| suspended | 停止ユーザー | `users.status` |
| admin | 管理者 | `admin_memberships` |

管理者権限はJWT custom claimだけに依存しない。APIでDB上の管理者レコードを確認する。

---

## 3. API認可の固定ルール

### 3.1 Middleware

| middleware | 役割 |
|---|---|
| `requireAuth` | Bearer token検証、user id解決 |
| `requireActiveUser` | `users.status = active` の確認 |
| `requireAdmin` | admin membership確認 |
| `requireVisibleTarget` | 対象コンテンツの公開範囲/ブロック確認 |

### 3.2 Service層

公開範囲、ブロック、参加者判定はrouteに散らさず、次に集約する。

- `visibility-service`
- `blocklist-service`
- `membership-service`
- `admin-auth-service`

---

## 4. RLS方針

### 4.1 原則

- 全テーブルでRLSを有効化する。
- BrowserからのDB直接操作は許可しない。
- APIは原則service roleでDBへ接続し、API service層で認可する。
- RLS policyは誤接続時の防御層として、anon/authenticated roleの直接アクセスをdenyする。

### 4.2 テーブル別方針

| テーブル種別 | RLS方針 |
|---|---|
| UGC | anon/authenticatedから直接select/insert/update/delete禁止 |
| マスターデータ | public readをAPI経由に限定 |
| admin系 | admin API経由のみ |
| audit_logs | API service roleのみwrite/read |
| storage objects | bucket policyで制限 |

---

## 5. service role keyの扱い

許可:

- Hono APIのサーバー環境変数
- migration/seed実行環境
- CIのSecret

禁止:

- User Webの `NEXT_PUBLIC_*`
- Admin Webの `NEXT_PUBLIC_*`
- ブラウザbundle
- ログ出力
- Issue/PR/チャットへの貼り付け

---

## 6. 公開範囲判定

表示可否は次の順で判定する。

1. 対象が存在する
2. `deleted_at is null`
3. 対象がモデレーション非表示でない
4. ブロック関係がない
5. visibility条件を満たす
6. 対象別の追加条件を満たす

コメントは対象リソースのvisibilityを継承する。`comments.target_type/target_id` の対象を先に解決し、その対象が閲覧可能な場合にのみコメント一覧を返す。

visibility:

| visibility | 表示可能 |
|---|---|
| `public` | ブロック関係なし |
| `followers` | 作成者本人、または作成者をフォローしているユーザー |
| `participants` | 作成者本人、または対象予定/記録の参加者 |
| `private` | 作成者本人 |

表示不可の場合、APIは原則 `404` を返す。

---

## 7. 管理者権限

管理者テーブル:

```text
admin_memberships
  user_id
  role
  enabled
  created_at
  updated_at
```

管理者APIでは必ず:

- `requireAuth`
- `requireActiveUser`
- `requireAdmin`
- `audit_logs` write

を通す。

---

## 8. テスト必須ケース

- 非公開予定を第三者が取得できない。
- ブロック済みユーザーの公開投稿が表示されない。
- 参加者限定予定を非参加者が取得できない。
- 停止ユーザーが投稿/コメント/予定作成できない。
- 一般ユーザーがadmin APIを呼べない。
- service role keyがBrowser bundleに含まれない。
