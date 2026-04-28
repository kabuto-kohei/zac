# Zac v5 技術選定書

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`

---

## 1. 選定方針

Zac MVPでは、開発速度、保守性、型安全、将来の拡張性を優先する。初期段階はモバイルアプリではなくWebアプリとして実装し、Web、管理画面、API、DB schemaの間で型と仕様がずれにくい構成を選ぶ。

---

## 2. 推奨スタック

| 領域 | 比較対象 | 固定採用 | 理由 |
|---|---|---|---|
| User Web | Next.js / Vite SPA / Remix | Next.js + TypeScript | 初期MVPをWebで高速に検証し、管理画面/APIと運用を揃えやすい |
| Admin | Next.js / Remix / Vite SPA | Next.js + TypeScript | 管理画面、認証、API周辺との相性がよい |
| API | Hono / Fastify / Next.js API | Hono + TypeScript | 軽量、OpenAPI/Zod連携、BFFに向く |
| API hosting | Vercel / Fly.io / Render / Cloudflare | Vercel | AdminとAPIを同じ運用に寄せられる |
| DB | PostgreSQL / MySQL / Firestore | Supabase Postgres | 予定、SNS、検索、関係性データに強く、Auth/Storageと統合しやすい |
| Spatial | PostGIS / 外部地図DB | PostGIS-ready | 将来の近隣ジム検索に対応しやすい |
| ORM | Prisma / Drizzle / SQL migrations | Drizzle ORM + drizzle-kit | TypeScript連携、SQL寄りの明示性、軽量さのため |
| Auth | Supabase Auth / Auth.js / Firebase Auth | Supabase Auth | Web/Admin/APIで同じ認証基盤を使える |
| Storage | S3互換 / Supabase Storage / Firebase Storage | Supabase Storage | Auth/DBと統合し、private bucketとsigned URLを扱える |
| Analytics | PostHog / GA4 / Firebase Analytics | PostHog | ファネル、リテンション、イベント分析に向く |
| Error Monitoring | Sentry / Firebase Crashlytics | Sentry | Web/Admin/API横断で使いやすい |

---

## 3. 採用判断

### 3.1 TypeScript統一

採用する。

- Web、Admin、API、shared schemaを同じ言語で扱える。
- API schemaとクライアント型のずれを減らせる。
- MVP後のチーム開発でも引き継ぎやすい。

### 3.2 Supabase Postgres

採用する。

- `session_plans`, `climbing_logs`, `posts`, `follows`, `blocks` のようなリレーションが多い。
- 公開範囲、ブロック、フィード生成をSQLで扱いやすい。
- 将来PostGISを追加できる。

### 3.3 Web-first

採用する。

- 初期MVPではApp Store/Google Play審査を避け、Webでコアループを早く検証できる。
- Next.jsをUser WebとAdminで共通利用できる。
- モバイルアプリはWeb版の検証後にExpo + React Nativeで別フェーズ実装する。

---

## 4. 比較と不採用理由

| 技術 | 不採用理由 |
|---|---|
| Swift/Kotlinネイティブ | 初期MVPでは開発・審査・配布コストが高い |
| Flutter | 初期MVPではWeb/Admin/APIのTypeScript統一を優先 |
| Firestore中心設計 | SNS/予定/公開範囲/検索の関係性が複雑になりやすい |
| MySQL | 悪くないが、PostGIS拡張とJSON/検索の柔軟性でPostgreSQLを優先 |
| 自前認証 | セキュリティ運用コストが高い |
| Prisma | 型安全性は高いが、MVPではDrizzleのSQL寄りの明示性と軽量さを優先 |
| Auth.js | Web中心の認証には強いが、Supabase Auth/Postgres/Storageの統合を優先 |
| Firebase Auth/Storage | 良い選択肢だが、DBをPostgreSQLに固定するためSupabaseへ寄せる |

---

## 5. 固定事項

| 項目 | 固定 |
|---|---|
| Auth Provider | Supabase Auth |
| ORM/Migration | Drizzle ORM + drizzle-kit |
| Storage | Supabase Storage |
| API hosting | Vercel |
| DB hosting | Supabase |
| Package manager | pnpm |
| Node.js | Node.js 22 LTS |
| File naming | kebab-case |

---

## 6. 推奨の最終構成案

```text
User Web: Next.js + TypeScript
Admin: Next.js + TypeScript
API: Hono + TypeScript
API hosting: Vercel
DB: Supabase Postgres + PostGIS-ready
Schema/Validation: Zod
ORM: Drizzle ORM + drizzle-kit
OpenAPI: @hono/zod-openapi
Auth: Supabase Auth
Storage: Supabase Storage
Analytics: PostHog
Monitoring: Sentry
Package manager: pnpm
Repo: monorepo
Node.js: 22 LTS
Mobile future phase: Expo + React Native + TypeScript
```
