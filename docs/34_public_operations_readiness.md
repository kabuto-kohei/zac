# Zac MVP 公開運用Runbook

> Current V1 note: the active V1 public scope is narrower than the original MVP
> described below. For the current controlled launch checklist, use
> `docs/42_v1_controlled_launch_runbook.md` first. This document remains as the
> broader public-operations reference for V2 or later social/activity features.

作成日: 2026-04-30

## 目的

一般公開後の安定運用に必要な実地確認、管理者登録、RLS確認、監視、定期ジョブ、法務導線を、公開前チェックとして実行できる形にする。

## 公開前E2Eチェック

本番または本番相当環境で、テスト用メールアドレスを2つ用意して実行する。実ユーザーの個人情報は使わない。

1. ユーザーAでメールリンク認証を完了する。
2. `/onboarding` でプロフィールを保存する。
3. `/settings/profile` で表示名、経験、エリア、初期公開範囲を変更し、再読み込み後も復元されることを確認する。
4. `/plans/new` で予定を作成する。
5. `/logs/new` で記録を作成する。
6. 記録詳細から投稿へ変換する、または `/posts/new` で投稿する。
7. `/settings/privacy` で公開範囲を変更する。
8. ユーザーBでログインし、ユーザーAの `private` データがAPI・画面のどちらからも見えないことを確認する。
9. Adminでログインし、イベントとお知らせを下書き作成、公開、再編集できることを確認する。
10. Sentryに新規エラーが出ていないこと、PostHogでsignup/plan/log/post相当のイベントが流れていることを確認する。

## 初期Admin登録

Admin UIはSupabase認証後、API側で `admin_memberships.enabled = true` を確認する。初期登録は人間ゲート対象の本番DB操作として扱う。

1. 初期管理者候補のメールアドレスを決める。
2. 候補者がWebまたはAdminでメールリンク認証を一度完了し、`users` に行が作成されていることを確認する。
3. 本番DBで対象 `users.id` を確認する。メールアドレスやUUIDをチャットへ貼らない。
4. 承認済みの運用作業として `admin_memberships` に `user_id`, `role = 'admin'`, `enabled = true` を登録する。
5. 対象者がAdminにログインし、`/users`, `/events`, `/announcements`, `/audit-logs` にアクセスできることを確認する。
6. 直後に監査ログと本番エラーを確認する。

## RLS / 認可 実地検証

本番相当環境でユーザーA/Bを使って確認する。

| 対象 | ユーザーA | ユーザーBで期待する結果 |
|---|---|---|
| private plan | 作成できる | 一覧・詳細で見えない |
| followers plan | 作成できる | フォロー関係がなければ見えない |
| private log | 作成できる | 一覧・詳細で見えない |
| public post | 作成できる | 見える |
| Admin API | adminで操作できる | 非adminは403 |

HTTP確認は、各ユーザーのアクセストークンをローカルのシークレット管理から読み込み、レスポンス本文に他ユーザーの非公開タイトルが含まれないことだけを確認する。トークンやレスポンス全文をログに残さない。

## 本番DB必須ガード

APIは production-like mode で `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` がない場合、起動時に失敗する。ローカル・testではfixture/memory fallbackを維持する。

確認コマンド:

```sh
pnpm config:audit
pnpm --filter @zac/api test
```

## イベント・お知らせ運用

Admin UIの `/events` と `/announcements` で以下を実行できる。

- 下書き作成
- 公開状態への切り替え
- タイトル、日時、本文、状態の再編集
- 操作の監査ログ記録

公開前には、下書きがUser Webの公開一覧へ出ないことを確認する。

## 監視・アラート

公開後24時間は以下を確認する。

| 対象 | 条件 | 初動 |
|---|---|---|
| API 5xx | 5分で3件以上 | Sentry issueと直近deployを確認 |
| 認証失敗 | 複数ユーザーから報告 | Supabase Auth設定とredirect URLを確認 |
| 投稿/画像保存失敗 | 2件以上 | Storage bucket、署名URL、DB接続を確認 |
| 非公開データ露出疑い | 1件 | P0として公開停止判断、証跡保全、原因調査 |

## メディア削除ジョブ

未紐付けアップロードは `media_deletion_jobs` に登録される。定期実行は以下を使う。

```sh
pnpm media:cleanup
```

運用設定:

- 15〜60分間隔で実行する。
- `MEDIA_CLEANUP_LIMIT` は初期値25、最大100を目安にする。
- `failed` が増え続ける場合はStorage権限、bucket名、対象objectの存在を確認する。
- ジョブ実行ログにはobject path以上の個人情報を出さない。

## 法務導線

User Webに以下の公開ページを用意する。

- `/legal/terms`
- `/legal/privacy`

設定画面から両ページへ到達できる。正式公開前に法務レビュー済み文言へ差し替える。

## 後続候補

- カスタムドメイン設定
- Google OAuth
- Playwrightによる実ブラウザE2E自動化
- Admin初期登録の専用UIまたは承認ワークフロー
