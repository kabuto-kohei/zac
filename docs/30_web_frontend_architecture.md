# Zac v5 Webフロントエンド構造設計

作成日: 2026-04-28  
目的: User WebとAdmin Webの実装方針、routing、状態管理、フォーム、エラー、アクセシビリティ、レスポンシブ方針を固定する。

---

## 1. 基本方針

初期MVPはNext.js App Routerで実装する。  
User WebとAdmin Webは別アプリとして分けるが、共通UI/型/schemaは `packages/shared` に置く。

```text
apps/web    : 一般ユーザー向け
apps/admin  : 管理者向け
packages/shared : schema, constants, types
packages/api    : Hono API
```

---

## 2. Routing方針

### User Web

```text
/
/login
/register
/onboarding
/
/home
/explore
/gyms
/gyms/[gymId]
/plans
/plans/new
/plans/[planId]
/logs
/logs/new
/logs/[logId]
/posts/[postId]
/me
/settings
/settings/privacy
/settings/blocks
/settings/delete-account
```

### Admin

```text
/admin/login
/admin/dashboard
/admin/users
/admin/gyms
/admin/events
/admin/posts
/admin/reports
/admin/audit-logs
/admin/announcements
```

---

## 3. Server/Client Component方針

- 認証状態が必要な初期表示はserver側で判定する。
- 入力フォーム、タブ、モーダル、画像アップロードはclient componentにする。
- API responseをそのまま深い子コンポーネントへばらまかず、feature単位でview modelへ整える。
- service role keyやDB URLはserverにもclientにも露出させない。APIだけが保持する。

---

## 4. Data Fetching

- BrowserからDBへ直接アクセスしない。
- User Web/AdminはHono APIを呼ぶ。
- 一覧はcursor paginationを使う。
- mutation後は対象queryを再取得する。
- optimistic updateはMVPでは最小限にする。公開範囲や参加状態が絡む処理ではサーバー結果を正とする。

---

## 5. 状態管理

MVPではグローバル状態管理ライブラリを追加しない。

| 状態 | 管理場所 |
|---|---|
| 認証状態 | Supabase client + server session確認 |
| API data | feature hook / server fetch |
| form state | React Hook Form相当。導入時は既存依存と相談 |
| UI state | component local state |
| toast/modal | app-level provider |

新規依存は、実装時に必要性が明確な場合だけ追加する。

---

## 6. Form/Validation

- 入力schemaは `packages/shared` のZod schemaを使う。
- client validationとserver validationを揃える。
- server validationを正とする。
- 必須エラー、文字数エラー、形式エラーをfield単位で表示する。
- submit中は二重送信を防ぐ。

---

## 7. Error UI

| 状態 | 表示 |
|---|---|
| 401 | ログインへ誘導 |
| 403 | 権限がない旨を表示 |
| 404 | 存在しない、または表示できない旨を表示 |
| 422 | field errorを表示 |
| 429 | 時間を置くよう表示 |
| 500 | 再試行CTAと問い合わせ導線 |

公開範囲外の詳細は、情報漏えいを避けるため「存在しない、または表示できない」と表現する。

---

## 8. Responsive

MVPはWebアプリだが、スマートフォン幅での利用を前提にする。

- 主要導線は375px幅で破綻しない。
- ボトムナビはmobile/tablet幅で表示する。
- desktop幅では中央最大幅を設ける。
- 管理画面はdesktop優先。ただしtablet幅で崩れないようにする。

---

## 9. Accessibility

- button/linkの役割を正しく使う。
- form labelを省略しない。
- error messageをfieldと関連付ける。
- keyboard操作で主要導線を使える。
- 色だけで状態を表現しない。
- 画像には適切なaltを持たせる。UGC画像は空alt可否をUI文脈で判断する。

---

## 10. 認証ガード

| route | guard |
|---|---|
| `/login`, `/register` | 未ログイン向け |
| `/onboarding` | ログイン済み、未完了 |
| `/`, `/home`, `/explore`, `/gyms`, `/events` | ゲスト閲覧可 |
| `/plans`, `/plans/[planId]`, `/logs`, `/logs/[logId]`, `/posts/[postId]`, `/me`, `/plans/new`, `/logs/new`, `/posts/new`, 保存、参加、コメント、通報、通知、設定、マイページの個人データ | ログイン必須 |
| `/admin/*` | admin必須 |

guardはUIだけでなくAPI側でも必ず検証する。公開閲覧はジム/イベントに限ってanonymousを許可し、予定、記録、投稿、feed、作成、保存、参加、コメント、個人設定はAPI側で認証を必須にする。

ヘッダーのグローバルアクションも認証状態で分岐する。ゲストは公開閲覧を妨げない `Login` のみを右上に出し、`予定作成` や詳細画面の文脈アクションはログイン後だけ表示する。ゲストが `/plans/new` などの保護routeへ直接入った場合は、画面内の `AuthRequiredNote` でログインとゲスト復帰を提示する。

`/` はrouteを分けず、client側の認証状態で `GuestHomeExperience` と `MemberHomeExperience` を切り替える。ゲスト版はジム、イベント、探索ショートカットを中心にし、予定、記録、投稿は出さない。初期HTML/RSC payloadにも予定、記録、投稿、feedを含めず、ログイン後に必要な活動データだけを認証付きAPIで取得する。作成・保存・参加・コメントのAPI guardはこのUI分岐に依存せず維持する。

メインナビも認証状態で切り替える。ゲストは `ホーム` と `探す` のみ、ログイン済みは `予定`、`記録`、`マイ` を追加する。ジム/イベント詳細はゲスト閲覧可だが、予定/記録/投稿の一覧・詳細・コメント・feed APIはログイン後だけ返す。

サマリー指標も同じ境界で分ける。ゲストにはイベント数、ジム数、公開閲覧範囲だけを表示し、`今週の予定`、`保存ジム`、`記録` のような個人活動指標はログイン後に認証付きAPIから取得した値だけを表示する。ジム/イベント詳細では、ゲストに個人活動指標や関連予定/投稿を先出ししない。

保護routeの直アクセスでは、入力フォームや個人設定UIを表示せず `AuthRequiredNote` のみを出す。API側の認証必須に加えて、UI側でもゲストが管理・作成画面を閲覧対象と誤解しない構造にする。
