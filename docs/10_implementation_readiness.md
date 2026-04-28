# Zac v5 実装準備チェックリスト

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`

---

## 1. 実装開始前の固定事項

| 項目 | 状態 | 固定 |
|---|---|---|
| リポジトリ構成 | 固定 | モノレポ |
| Package manager | 固定 | pnpm |
| Node.js | 固定 | Node.js 22 LTS |
| User Web | 固定 | Next.js + TypeScript |
| Admin | 固定 | Next.js + TypeScript |
| API | 固定 | Hono + TypeScript |
| API hosting | 固定 | Vercel |
| DB | 固定 | Supabase Postgres |
| ORM/Migration | 固定 | Drizzle ORM + drizzle-kit |
| Auth | 固定 | Supabase Auth |
| Storage | 固定 | Supabase Storage |
| Analytics | 固定 | PostHog |
| Error Monitoring | 固定 | Sentry |
| OpenAPI | 固定 | `@hono/zod-openapi` |

---

## 2. 実装順序

### Step 1: 基盤

- モノレポ初期化
- TypeScript設定
- Lint/format設定
- DB接続
- migration基盤
- OpenAPI生成方針
- `.env.example`

### Step 2: 認証/ユーザー

- Auth Provider接続
- `users`
- `user_profiles`
- `user_settings`
- オンボーディング

### Step 3: ジム

- `gyms`
- `gym_images`
- `gym_disciplines`
- `gym_saves`
- ジム一覧/詳細
- 管理画面でジム作成/編集

### Step 4: 予定

- `session_plans`
- `session_plan_participants`
- `session_plan_comments`
- 予定作成/一覧/詳細
- 参加/キャンセル
- 公開範囲/ブロック反映

### Step 5: 記録

- `climbing_logs`
- `climbing_log_images`
- 記録作成/一覧/詳細/編集/削除
- 予定から記録

### Step 6: 投稿/フィード

- `posts`
- `post_images`
- `comments`
- `post_likes`
- `post_saves`
- 記録から投稿
- フィード

### Step 7: 安全/運営

- `blocks`
- `reports`
- `moderation_actions`
- `audit_logs`
- 管理画面の通報対応

### Step 8: 計測/通知

- PostHogイベント
- Webアプリ内通知
- Push通知。初期MVPではWebアプリ内通知まで。PushはWeb版検証後に追加する。

---

## 3. 初期seed

実装開始時に必要なseed:

- disciplines
  - ボルダー
  - リード
  - トップロープ
  - 外岩
  - トレーニング
- categories
  - 仲間探し
  - 記録
  - イベント
  - コンペ
  - ジム開拓
  - トレーニング
- 初期ジム3〜5件
- 管理者ユーザー1件

---

## 4. 最初に作る縦スライス

最初の実装は、広く作らず次の縦スライスにする。

```text
登録
  -> オンボーディング
  -> ジム一覧
  -> ジム保存
  -> 予定作成
  -> 予定完了
  -> 記録作成
```

この縦スライスが通れば、Zacの中核である `plan_to_log_conversion_rate` を検証できる。

---

## 5. Definition of Ready

コード着手前に次が揃っていること。

- 技術スタックが1案に固定されている。
- DBマイグレーション方式が決まっている。
- Auth Providerが決まっている。
- `.env.example` に必要な環境変数が書ける。
- 公開範囲仕様が実装可能な粒度になっている。
- 最初のseedデータが決まっている。
- 最初の縦スライスの画面が決まっている。

---

## 6. Definition of Done

各機能の完了条件:

- APIに入力バリデーションがある。
- APIに認証/認可チェックがある。
- 公開範囲とブロックが反映される。
- 主要成功/失敗ケースのテストがある。
- 管理者操作は監査ログに残る。
- 分析イベントが必要な箇所で発火する。
- 削除済みデータが通常画面に出ない。

---

## 7. リスク

| リスク | 対策 |
|---|---|
| MVPが大きい | 最初は縦スライスで検証し、投稿/通知/管理画面を段階実装 |
| 公開範囲漏れ | API service層にvisibility判定を集約 |
| ジムデータ不足 | seedで3〜5件を先に整備 |
| 通報対応不足 | 通報/非表示/監査ログをMVPに含める |
| 記録が重い | 最小入力だけで保存できるUIにする |

---

## 8. 実装前の最終固定リスト

| 項目 | 固定内容 |
|---|---|
| Auth Provider | Supabase Auth |
| API framework | Hono |
| ORM/Migration | Drizzle ORM + drizzle-kit |
| Storage | Supabase Storage |
| 退会時のUGC | 通常画面から非表示。個人情報とprivateデータは削除、公開UGCは削除扱いにして匿名化メタデータのみ必要最小限保持 |
| 未成年利用 | MVPは18歳以上のみ |
| 管理者2FA | 本番/ベータ運用前に必須 |
| 地図表示 | MVPでは含めない。ジム一覧/検索と緯度経度保存のみ |
| Push通知 | 初期MVPでは含めない。Webアプリ内通知を先行 |
| OAuthログイン | 初期MVPでは含めない。Web版検証後にGoogle OAuthから追加 |
| モバイルアプリ | 初期MVPでは含めない。Web版検証後の後続フェーズ |
| 動画アップロード | MVPでは含めない |
| 画像アクセス | ユーザーUGCはprivate bucket + signed URL、ジム公開画像はpublic bucket |

---

## 9. 実装開始推奨判断

企画の方向性、主要機能、技術選定、DB/API/画面/非機能/テスト/運用の初版は揃っている。  
コード着手前に必要な外部アカウント、CLI、環境変数は `docs/20_required_tools_and_settings.md` と `docs/21_environment_variables.md` に従って準備する。

準備完了後、`session_plans` と `climbing_logs` を中心にMVP基盤の実装へ進める。
