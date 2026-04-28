# Zac v5 品質ゲート・CI/CD設計

作成日: 2026-04-28  
目的: コード開始後に品質基準が曖昧にならないよう、PR、CI、ビルド、migration、OpenAPI、Secret確認のゲートを固定する。

---

## 1. 基本方針

main branchへ直接pushしない。  
PR単位でlint、typecheck、test、build、migration checkを通す。

---

## 2. 必須スクリプト

repo rootに次のscriptを用意する。

```json
{
  "scripts": {
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "build": "pnpm -r build",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "openapi:generate": "pnpm --filter @zac/api openapi:generate",
    "check": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

実際のpackage名は実装時に合わせるが、rootから同等のコマンドを実行できる状態にする。

---

## 3. CI必須ジョブ

| job | 必須 | 内容 |
|---|---:|---|
| install | 必須 | `pnpm install --frozen-lockfile` |
| lint | 必須 | ESLint |
| typecheck | 必須 | TypeScript |
| unit test | 必須 | service/schema/visibility |
| build | 必須 | web/admin/api build |
| migration check | 必須 | migration生成漏れ確認 |
| OpenAPI check | 必須 | OpenAPI生成差分確認 |
| secret scan | 推奨 | secret混入検出 |
| e2e | Phase 2以降必須 | 最初の縦スライス |

---

## 4. PR Gate

PR merge条件:

- CI必須ジョブが成功している。
- DB schema変更時はmigrationが含まれている。
- API変更時はOpenAPI/schemaが更新されている。
- 公開範囲/ブロック/退会/削除に関わる変更はテストが追加されている。
- `.env` やSecretが含まれていない。
- 管理者操作を追加する場合はaudit logがある。

---

## 5. Migration Gate

DB変更時:

- 破壊的変更を避ける。
- rename/dropはMVP中でも明示レビュー対象。
- production適用前にbackupを確認する。
- migrationは冪等ではなく履歴として管理する。
- seedは冪等にする。

---

## 6. OpenAPI Gate

API route/schemaを変更したら:

- OpenAPIを更新する。
- Request/Response schemaを更新する。
- 認証必須/任意/admin必須を明示する。
- `404` がvisibility由来で返る可能性を説明に含める。

---

## 7. Security Gate

必ず確認:

- `SUPABASE_SERVICE_ROLE_KEY` がBrowser bundleに入っていない。
- `DATABASE_URL` がBrowser bundleに入っていない。
- PostHogに本文、メール、正確な現在地を送っていない。
- Sentryに過剰なPIIを送っていない。
- admin APIに `requireAdmin` がある。

---

## 8. Release Gate

公開前に次を満たす。

- `pnpm check` 相当が成功。
- 主要E2Eが成功。
- P0/P1既知不具合なし。
- Supabase backup確認済み。
- Sentry/PostHog疎通済み。
- 利用規約/プライバシーポリシー公開済み。
- 通報/ブロック/退会導線が動作確認済み。
