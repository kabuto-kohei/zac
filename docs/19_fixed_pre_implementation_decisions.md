# Zac v5 実装前固定事項

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`

---

## 1. 目的

この文書は、コードを書き始める前に固定すべき判断を1か所に集約する。  
他の設計書に将来案がある場合でも、MVP実装ではこの文書の固定事項を優先する。

---

## 2. プロダクト固定事項

| 項目 | 固定内容 |
|---|---|
| プロダクト定義 | クライマー向け Climb Life OS |
| MVPの核 | `session_plans` と `climbing_logs` |
| North Star Metric | Weekly Completed Climb Sessions |
| 初期市場 | 日本国内の都市部クライミングジム利用者 |
| 初期対象 | 週1〜3回ジムに行くボルダラー、仲間を増やしたい初心者〜中級者 |
| 初期対象外 | 外岩ガイド、ジム基幹SaaS、決済、予約、会員証 |

---

## 3. MVPスコープ固定事項

### 含める

- 認証
- プロフィール
- オンボーディング
- ジム一覧/詳細/保存
- 予定作成/参加/コメント/完了
- 記録作成/編集/削除
- 予定から記録
- 記録から投稿
- 投稿/フィード
- フォロー
- ブロック
- 通報
- 管理画面
- 監査ログ
- KPIイベント計測

### 含めない

- ルートDB
- ランキング
- 決済
- 会員証
- 予約
- DM
- 地図画面
- 動画アップロード
- Push通知
- OAuthログイン
- モバイルアプリ
- App Store / Google Play 公開
- ジムSaaS
- 高度AIコーチング
- 未成年利用

---

## 4. 技術固定事項

| 項目 | 固定 |
|---|---|
| Repository | monorepo |
| Package manager | pnpm |
| Node.js | 22 LTS |
| User Web | Next.js + TypeScript |
| Admin | Next.js + TypeScript |
| API | Hono + TypeScript |
| API hosting | Vercel |
| DB | Supabase Postgres |
| ORM/Migration | Drizzle ORM + drizzle-kit |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| OpenAPI | `@hono/zod-openapi` |
| Validation | Zod |
| Analytics | PostHog |
| Error monitoring | Sentry |
| File naming | kebab-case |

---

## 5. セキュリティ固定事項

| 項目 | 固定内容 |
|---|---|
| 位置情報 | デフォルトOFF |
| 現在地共有 | MVPでは実装しない |
| 予定公開範囲初期値 | `followers` |
| ログ公開範囲初期値 | `private` |
| ホームジム表示 | デフォルトOFF |
| ブロック | 公開範囲より優先 |
| ブロック後コメント | 通常画面では相互に非表示 |
| 管理者2FA | ベータ/本番前に必須 |
| 管理者操作 | `audit_logs` 必須 |
| UGC画像 | private bucket + signed URL |
| ジム公開画像 | public bucket |

### 5.1 ゲスト公開境界

MVPの未ログイン閲覧は、登録前に価値を確認するための公開導線に限定する。

| 対象 | 未ログイン | ログイン後 |
|---|---|---|
| ホーム/探す | 閲覧可。ジム/イベントだけを表示 | 閲覧可。活動サマリーとmember feedを追加 |
| ジム/イベント | 一覧/詳細を閲覧可 | 保存、予定作成への接続を追加 |
| 予定/記録/投稿/feed | API、初期HTML/RSC payload、画面表示のすべてで非公開 | 認証付きAPIで取得して表示 |
| 保存/参加/作成/コメント/通報/設定/通知/マイページ | ログイン誘導のみ | 利用可 |

公開範囲が `public` の予定/投稿であっても、MVPのゲスト公開対象には含めない。`public` はログイン済みユーザー間の可視性であり、anonymous公開とは別に扱う。

---

## 6. 法務/年齢固定事項

| 項目 | 固定内容 |
|---|---|
| MVP利用年齢 | 18歳以上 |
| 課金 | MVPでは実装しない |
| UGC | 通報、ブロック、削除、モデレーションを必須 |
| 退会 | 個人情報とprivateデータは削除。公開UGCは通常画面から非表示にし、必要最小限の匿名化メタデータのみ保持 |
| 利用規約 | 公開前に必須 |
| プライバシーポリシー | 公開前に必須 |

---

## 7. 実装開始条件

コード着手前に以下を満たす。

- Supabase projectが作成済み。
- Supabase Authのメール認証設定が完了している。
- Supabase Storage bucket方針が作成済み。
- Vercel projectが作成済み。
- PostHog projectが作成済み。
- Sentry projectが作成済み。
- `.env.local` に必要な環境変数を設定できる。
- Node.js 22 LTSとpnpmが利用できる。
- GitHub repositoryが用意されている。
- 初期MVPはWebアプリとして実装し、モバイルアプリはWeb版の検証後に別フェーズで着手する。

---

## 8. 最初に実装する縦スライス

```text
登録
  -> オンボーディング
  -> ジム一覧
  -> ジム保存
  -> 予定作成
  -> 予定完了
  -> 記録作成
```

投稿、フィード、通報、管理画面はこの縦スライスの後に段階実装する。
