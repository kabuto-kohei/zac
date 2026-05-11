# DB復旧と公式ソースseed運用

目的: Supabase Free plan の休止やローカルAPIのenv未読込で、画面がfixtureを表示しているだけの状態を見落とさないようにする。

## 状態確認

APIの統合状態は `/v1/integrations` で確認する。

```json
{
  "database": true,
  "databaseReachable": true
}
```

- `database`: `DATABASE_URL` が設定されている。
- `databaseReachable`: 実際にDBへ `select 1` が通る。

`database: true` かつ `databaseReachable: false` の場合、envは読めているがDBへ届いていない。Supabase project休止、DBパスワード不一致、pooler不調を疑う。

## Supabase休止復帰後

Supabase Dashboardでprojectを復帰させたあと、CLIで状態を見る。

```bash
supabase projects list -o json
```

`status` が `ACTIVE_HEALTHY` になってからDB操作へ進む。`COMING_UP` の間はpoolerが `tenant/user ... not found` を返すことがある。

## Migration適用

既存の初期migrationはSupabase CLI標準履歴ではなく `infra/migrations` にあるため、現在は以下のスクリプトで適用する。

```bash
pnpm db:apply:remote
```

このコマンドは不足していた運用テーブル、公式ソースカラム、`event_sources` を作る。

## Seed適用

ジム、イベント、Instagram/公式情報取得源をDBへ入れる。

```bash
pnpm db:seed:remote
```

seedは冪等にし、既存行は `ON CONFLICT` で更新する。公開UIでは全文転載・画像再配布をせず、要約と情報源リンクだけを出す。

## 件数確認

```bash
pnpm db:verify:remote
```

2026-05-10時点のMVP目安:

```json
{
  "databaseReachable": true,
  "gyms": 190,
  "events": 17,
  "eventSources": 123
}
```

## 取得源更新キュー

公式サイト/Instagramを確認する前に、DBから更新対象を棚卸しする。

```bash
pnpm sources:plan-refresh
```

このコマンドは `data/intake/source-refresh-plan.json` を生成する。外部サイトへ
アクセスせず、DB内の `event_sources`, `gyms`, `events` だけを見て以下のキューを作る。

- `dailyApprovedSources`: 毎日確認する承認済み公式サイト/公式Instagram
- `candidateInstagramVerification`: コンペバイブル起点など、公式性の確認が必要なInstagram候補
- `gymInstagramBackfill`: ジムDBにはあるが公式Instagram未登録のジム
- `upcomingEventReview`: 近日公開イベントの再確認対象

Computer UseでInstagramを確認するときは、このJSONのキュー順に見る。公開UIへは
タイトル、要約、カテゴリ、日時、短い引用、情報源リンクだけを反映し、画像・動画・
本文全文は再配布しない。

## Instagram候補照合

コンペバイブル起点などのInstagram候補をジムDBに機械照合する。

```bash
pnpm sources:match-instagram
```

このコマンドは `data/intake/instagram-source-match-report.json` を生成する。スコアは
確認順を決めるためのもので、自動承認には使わない。公式サイト、Instagram
プロフィール、またはジム公式導線で確認できたものだけを
`data/intake/instagram-profile-verification.jsonl` に記録し、seedへ昇格する。

2026-05-10時点では、Base Camp系4件、NOBOROCK系2件、ROCKY系2件を公式サイト上のInstagram欄で確認し、
`infra/seeds/0005_verified_instagram_sources.sql` で `event_sources.status =
approved` とジム側の `instagram_handle` / `instagram_url` に反映済み。

## 定期巡回ランナー

6時間ごとの自動巡回では以下を直列実行する。

```bash
pnpm db:verify:remote
pnpm sources:plan-refresh
pnpm sources:match-instagram
pnpm sources:monitor
```

`pnpm sources:monitor` は `data/intake/source-monitor-run.json` と
`data/intake/source-monitor-run.md` を生成する。これはその回で見るべき承認済み
ソース、候補ソース、近日イベント再確認対象の運用パケットであり、Instagramの
画像・動画・全文キャプションを保存しない。

Supabase pooler の接続数に触れやすいため、DB接続系のコマンドは並列実行しない。

## ローカルAPI

`pnpm dev:api` は `.env.local` を読み込む。起動ログの `database=on` は設定値の有無だけなので、疎通判断は `/v1/integrations` の `databaseReachable` を見る。

```bash
pnpm dev:api
curl -i http://localhost:8787/v1/integrations
```

## 次の改善

`infra/migrations` をSupabase CLI標準の `supabase/migrations` へ寄せるか、Drizzle migrationとSupabase remote historyの扱いを一本化する。今は手元のSQL適用スクリプトが復旧導線のsource of truth。
