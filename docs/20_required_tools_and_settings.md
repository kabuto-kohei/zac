# Zac v5 必要ツール・外部設定

作成日: 2026-04-27  
目的: コード実装前にユーザー側で準備・確認が必要なツール、アカウント、設定を列挙する。

---

## 1. ローカル開発ツール

| ツール | 必須 | 用途 | 備考 |
|---|---:|---|---|
| Node.js 22 LTS | 必須 | TypeScript/Next.js/Hono | Volta, mise, nvm等で固定 |
| pnpm | 必須 | monorepo package manager | `corepack enable` 推奨 |
| Git | 必須 | バージョン管理 | GitHub連携前提 |
| Supabase CLI | 必須 | local DB/migration/型生成 | Supabase project連携に使用 |
| Docker Desktop | 推奨 | Supabase local開発 | local Supabaseを使う場合 |

---

## 2. 外部アカウント/プロジェクト

| サービス | 必須 | 用途 | ユーザー側で必要な設定 |
|---|---:|---|---|
| GitHub | 必須 | repository, CI, PR | Zac用repository作成 |
| Supabase | 必須 | Auth, Postgres, Storage | project作成、region選択 |
| Vercel | 必須 | Admin/API hosting | project作成、env設定 |
| PostHog | 必須 | product analytics | project作成、API key発行 |
| Sentry | 必須 | error monitoring | Web/Admin/API project作成 |
| Expo account | 後続 | EAS build/update | モバイル版着手時 |
| Apple Developer | 後続 | iOS TestFlight/App Store | モバイル版ベータ配布前 |
| Google Play Console | 後続 | Android internal test/Play Store | モバイル版ベータ配布前 |

---

## 3. Supabase設定

### 3.1 Project

- Region: 日本ユーザー向けに近いリージョンを選ぶ。
- Database passwordを安全に保管する。
- API keysを `.env.local` に設定し、リポジトリには含めない。

### 3.2 Auth

MVP固定:

- Email/password: ON
- OAuth: MVPではOFF。Web版検証後にGoogle OAuthから追加する。
- Email confirmation: ON
- Admin MFA: ベータ/本番前に必須
- 退会導線: アプリ内に実装

### 3.3 Storage

Buckets:

| bucket | public | 用途 |
|---|---:|---|
| `user-media` | false | 投稿/記録/プロフィール画像 |
| `gym-public` | true | 管理者が承認したジム画像 |

方針:

- `user-media` はsigned URLで配信する。
- 削除済みUGCの画像は通常APIで返さない。
- 将来、非同期削除ジョブを追加する。

---

## 4. Vercel設定

Projects:

- `zac-web`
- `zac-admin`
- `zac-api`

初期は同一monorepoから3 projectとして切る。

Canonical production routing:

| Project | Production URL | 用途 | Local link |
|---|---|---|---|
| `zac-web` | `https://zac-web.vercel.app` | ユーザー向けWeb本番 | `apps/web/.vercel/project.json` |
| `zac-admin` | `https://zac-admin.vercel.app` | 管理画面本番 | `apps/admin/.vercel/project.json` |
| `zac-api` | `https://zac-api.vercel.app` | API本番 | `packages/api/.vercel/project.json` |

Deploy commands:

- Web: `pnpm vercel:deploy:web`
- Admin: `pnpm vercel:deploy:admin`
- API: `pnpm vercel:deploy:api`

本番確認は上記3つのcanonical URLだけを見る。旧/重複project
`zac` は2026-05-12に削除済み。`zac-seven.vercel.app`
などの旧URLが再作成された場合でも、ユーザー向け確認・本番導線・自動化の
参照先にしない。

必要設定:

- Production/Preview environment variables
- GitHub連携
- build command
- install command: `pnpm install --frozen-lockfile`
- Node.js version: 22

---

## 5. PostHog設定

必要:

- Project API key
- Host URL

イベント本文、コメント本文、メールアドレス、正確な現在地は送らない。

---

## 6. Sentry設定

Projects:

- `zac-web`
- `zac-admin`
- `zac-api`

必要:

- DSN
- auth token
- organization
- project names

PII送信は最小化する。

---

## 7. GitHub設定

必要:

- repository作成
- branch protection
- CI secrets設定
- PR review rule

推奨CI:

- lint
- typecheck
- test
- build
- migration check

---

## 8. ユーザーに提示が必要なもの

実装開始前に、ユーザーから次を確認または準備してもらう。

1. Supabase project URL
2. Supabase anon key
3. Supabase service role key
4. Supabase database URL
5. Vercel project作成可否
6. PostHog project key
7. Sentry DSN
8. GitHub repository URL
9. 初期管理者メールアドレス
10. 初期seedに入れるジム3〜5件

秘密情報はチャットに貼らず、`.env.local` や各サービスのSecret Managerに設定する。
