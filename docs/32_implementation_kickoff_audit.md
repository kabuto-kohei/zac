# Zac v5 Implementation Kickoff Audit

作成日: 2026-04-28

## 判定

実装開始に必要な企画・設計・品質ゲートは揃っている。  
現時点では認証、課金、secret、migration、本番運用に触れず、Web Appの非認証画面骨格から着手する。

## 確認済み

- `org-os-zac` と `zac` は別repoとして分離済み。
- `org-os-zac/config/project.config.json` は `../zac` をtarget repoとして参照している。
- `zac` はpnpm workspaceのmonorepoとして初期化済み。
- `docs/` にZac v5設計書32件を保管済み。
- `pnpm check` は初期monorepoで成功済み。

## Human Gate対象として避けるもの

- 認証、認可、ロール管理
- 課金、決済
- secret、環境変数の実値
- migration、破壊的DB変更
- 本番release、deploy

## 次の実装範囲

- User Webの画面骨格
- ホーム、探す、予定、記録、マイページの基本導線
- モックデータによるジム、予定、記録カード
- 認証/API接続前提のUI境界

