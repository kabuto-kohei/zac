# Zac v5 ディレクトリ構成案

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`

---

## 1. 方針

Zacは初期MVPではユーザー向けWebアプリ、管理画面、API、共通型を持つため、モノレポ構成を推奨する。モバイルアプリはWeb版検証後に `apps/mobile` として追加する。

目的は次の通り。

- TypeScript型を共有しやすくする。
- API、DB、アプリ、管理画面の変更を1つのPRで追えるようにする。
- MVP段階の速度を優先する。
- 将来、必要になったらアプリやAPIを分離できるように境界を保つ。

---

## 2. 推奨ルート構成

```text
zac/
  Zac_planning_v5.md
  docs/
    00_design_inventory.md
    01_requirements.md
    02_system_architecture.md
    03_directory_structure.md
    04_database_design.md
    05_api_design.md
    06_security_privacy_design.md
    07_ux_flow_design.md
    08_analytics_design.md
    09_admin_operations_design.md
    10_implementation_readiness.md
  apps/
    web/
    admin/
  packages/
    api/
    db/
    shared/
    config/
  infra/
    migrations/
    seeds/
  openapi/
    openapi.yaml
  scripts/
  .github/
    workflows/
```

---

## 3. 各ディレクトリの責務

| パス | 役割 |
|---|---|
| `apps/web` | ユーザー向けNext.js Webアプリ |
| `apps/admin` | Next.js管理画面 |
| `packages/api` | REST API、認可、フィード、ドメインサービス |
| `packages/db` | DBスキーマ、クエリ、マイグレーション補助 |
| `packages/shared` | 共通型、Zod schema、定数 |
| `packages/config` | ESLint、TypeScript、環境設定の共通化 |
| `infra/migrations` | DBマイグレーション |
| `infra/seeds` | 初期ジム、カテゴリ、種目データ |
| `openapi` | API仕様 |
| `scripts` | 開発補助スクリプト |
| `.github/workflows` | CI |

---

## 4. User Web App構成

```text
apps/web/
  app/
    (auth)/
    (tabs)/
      home/
      explore/
      plans/
      logs/
      me/
    onboarding/
  src/
    components/
    features/
      auth/
      gyms/
      plans/
      logs/
      posts/
      profile/
      safety/
    lib/
      api/
      analytics/
      auth/
      storage/
    theme/
    types/
```

画面単位ではなく、主要ドメイン単位で `features` を切る。Next.js App Routerを使い、`app` にルーティングを置き、実装は `src/features` に寄せる。

---

## 5. Admin App構成

```text
apps/admin/
  app/
    login/
    dashboard/
    users/
    gyms/
    events/
    posts/
    reports/
    audit-logs/
  src/
    components/
    features/
      users/
      gyms/
      events/
      posts/
      reports/
      moderation/
    lib/
      api/
      auth/
```

管理画面は、見た目よりも安全な操作、検索、監査を優先する。

---

## 6. API構成

```text
packages/api/
  src/
    index.ts
    routes/
      auth.ts
      me.ts
      users.ts
      gyms.ts
      events.ts
      sessionPlans.ts
      logs.ts
      posts.ts
      feed.ts
      notifications.ts
      media.ts
      reports.ts
      announcements.ts
      admin/
        users.ts
        gyms.ts
        gymUpdates.ts
        events.ts
        posts.ts
        reports.ts
        auditLogs.ts
    services/
      visibility.ts
      blocklist.ts
      feed.ts
      moderation.ts
      notifications.ts
      media.ts
    middleware/
      auth.ts
      adminAuth.ts
      rateLimit.ts
      errorHandler.ts
    schemas/
    errors/
```

公開範囲、ブロック、管理者権限の判定は `services` または `middleware` に集約し、各routeに散らさない。

---

## 7. DB構成

```text
packages/db/
  src/
    schema/
      users.ts
      gyms.ts
      events.ts
      sessionPlans.ts
      logs.ts
      posts.ts
      safety.ts
      notifications.ts
      admin.ts
      jobs.ts
    queries/
      users.ts
      gyms.ts
      events.ts
      sessionPlans.ts
      logs.ts
      feed.ts
    client.ts
```

DBアクセスはAPI routeから直接SQLを散らさず、ドメインごとのquery/serviceへ寄せる。

---

## 8. 共通型構成

```text
packages/shared/
  src/
    constants/
      visibility.ts
      planStatus.ts
      reportCategories.ts
    schemas/
      user.ts
      gym.ts
      event.ts
      sessionPlan.ts
      climbingLog.ts
      post.ts
      category.ts
      report.ts
    types/
```

クライアントとAPIで共有する入力schemaはここに置く。ただし、DB内部型や管理者専用型を無制限に共有しない。

---

## 9. 初期化時に作るべき設定

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `eslint.config.js`
- `.env.example`
- `.gitignore`
- `README.md`
- CI: typecheck, lint, test
- DB migration command
- OpenAPI generation command

---

## 10. 命名規則

| 対象 | ルール |
|---|---|
| DBテーブル | snake_case plural |
| API path | kebab-case |
| TypeScript file | kebab-case |
| React component | PascalCase |
| enum-like value | lower_snake_case |

例:

- DB: `session_plans`
- API: `/v1/session-plans`
- TS type: `SessionPlan`
- value: `participants`
