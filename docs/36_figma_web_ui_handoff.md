# Zac Web UI Figma Handoff

作成日: 2026-05-01

## 1. 目的

Web実装で固めたMVP導線をFigmaへ移すための画面仕様を固定する。
Figmaでは実装済み画面を正とし、レビュー・修正提案・コンポーネント整理の場として使う。

## 2. Figma化の対象範囲

初回Figma化はWeb版の主要5画面に絞る。

| 優先 | 画面 | route | 目的 |
|---|---|---|---|
| 1 | Home | `/home` | ゲスト閲覧、ログイン誘導、公開フィード、次アクションを確認する |
| 2 | Explore | `/explore` | ジム/イベント検索、種目フィルタ、公開情報探索を確認する |
| 3 | Plan Create | `/plans/new` | ログイン必須導線と作成フォームを確認する |
| 4 | Me | `/me` | ゲスト時のマイページ誘導とログイン後の管理面を確認する |
| 5 | Notifications | `/notifications` | ゲスト時の通知制限とログイン誘導を確認する |

## 3. 画面共通レイアウト

### Shell

- 最大幅: `760px`
- 背景: `#f7f8f4`
- Surface: `#ffffff`
- 角丸: `8px`
- 境界線: `#dde4de`
- Primary: `#0f766e`
- Accent: `#f59e0b`
- Danger/Count: `#b45309`
- Text: `#1e2522`
- Muted text: `#68736f`

### Header

- 左: Zacロゴ + `Zac` eyebrow + `次のセッションを決める`
- 右: 認証状態で出し分け
  - ゲスト: `ログイン`, `予定作成`
  - ログイン済み: `通知`, `予定作成`
- モバイルでは縦積み、CTAは横2列で表示する。

### Navigation

- Desktop: Header直下のカード型ナビ
- Mobile: Bottom fixed nav
- Tabs: `ホーム`, `探す`, `予定`, `記録`, `マイ`
- Active state: `#ecfdf5` background + primary text

## 4. Home画面

### 4.1 構成

1. Header
2. Navigation
3. Metric strip
4. Guest value banner
5. Guest composer / Authenticated composer
6. Home shortcuts
7. Topic rail
8. Today digest
9. Public feed header
10. Feed tabs
11. Feed cards

### 4.2 Guest value banner

目的: メールアドレス必須の入口ではなく、公開閲覧できることを先に伝える。

表示文:

- eyebrow: `Guest mode`
- title: `公開情報はこのまま閲覧できます`
- body: `ジム、イベント、公開予定、投稿を見てから、保存や参加が必要になったタイミングでログインできます。`
- CTA: `保存を始める`, `ログイン`

### 4.3 Guest composer

目的: 保存・参加・作成はログイン後に解放されることを、作成UIの文脈で示す。

- message: `保存、参加、作成はログイン後に使えます`
- links: `ログイン`, `新規登録`, `探す`

### 4.4 Home shortcuts

3カード構成。

| Card | 表示 |
|---|---|
| Next plan | 次に参加できる予定 |
| Event | 直近イベント |
| Gym | 注目ジム |

Desktopは3列、mobileは1列。

### 4.5 Feed

- Section kicker: `Feed`
- title: `公開フィード`
- CTA: `投稿`
- tabs: `すべて`, `予定`, `記録`, `投稿`
- 各tabに件数badgeを表示する。

### 4.6 Feed cards

共通構造:

- 左: icon visual
- 中央: kind, title/link, meta/body
- 右: primary action

カード種別:

| Type | Kind | Action |
|---|---|---|
| Plan | `予定 · visibility` | `参加` / `参加中` |
| Log | `記録` | なし |
| Post | `投稿 · visibility` | `いいね` / `いいね済み` |

未ログインaction時はinline messageを出す。

## 5. Explore画面

### 5.1 構成

1. Header
2. Navigation
3. Metric strip
4. Explore hero
5. Search panel
6. Events section
7. Gyms section

### 5.2 Explore hero

- eyebrow: `Explore`
- title: `登る場所と予定を探す`
- body: `エリア、ジム名、種目、イベント名で公開情報を横断できます。`
- counts: `イベント`, `ジム`

### 5.3 Search panel

- keyword input placeholder: `秋葉原、B-PUMP、ボルダー`
- filters: `すべて`, `ボルダー`, `リード`
- no result:
  - title: `イベントが見つかりません` or `ジムが見つかりません`
  - body: `検索語を短くするか、種目フィルタを「すべて」に戻してください。`

## 6. Plan Create画面

### 6.1 構成

1. Header
2. Navigation
3. Form panel
4. Auth required note
5. Fields

### 6.2 Guest state

- eyebrow: `ログインが必要です`
- title: `予定作成はログイン後に保存できます`
- body: `公開情報はゲストで閲覧できます。保存や作成はメールリンクでログインすると使えます。`
- CTA: `ログイン`, `ゲストで戻る`

## 7. Me画面

### 7.1 Guest state

- eyebrow: `ゲスト閲覧中`
- title: `ログインするとマイページを使えます`
- body: `保存したジム、参加予定、記録、投稿をひとつの場所で管理できます。`
- CTA: `新規登録`, `ログイン`

### 7.2 Activity

- tabs: `予定`, `ジム`, `記録`, `保存`
- compact listで日付/場所/タイトルを表示する。

## 8. Notifications画面

### Guest state

- section title: `通知`
- unread count: `0件未読`
- note:
  - eyebrow: `ログインが必要です`
  - title: `通知はログイン後に確認できます`
  - body: `参加予定、保存、運営からのお知らせを自分の状態に合わせて表示します。`
  - CTA: `ログイン`

## 9. Figmaコンポーネント候補

| Component | Variants |
|---|---|
| AppHeader | guest, authenticated |
| MainNav | desktop, mobile, active tab |
| MetricStrip | default |
| AuthRequiredNote | plan, log, post, report, notifications |
| GuestBanner | default |
| Composer | guest, authenticated |
| ShortcutCard | plan, event, gym |
| SearchPanel | default, filtered, empty |
| ContentCard | plan, event, gym, log, post |
| TabRail | feed, activity, filter |
| EmptyState | compact, full |

## 10. Figma作成順

1. Foundations page
   - colors, typography, spacing, radius, shadows
2. Components page
   - shell, nav, buttons, chips, cards, forms
3. Screens page
   - Desktop 1440px artboards
   - Mobile 390px artboards
4. Review page
   - Before/after notes
   - User feedback comments area

## 11. Figma MCP実行に必要な入力

Figmaへ直接書き込むには、次のどちらかが必要。

- 既存Figma file URL
- Figma file key

受領後、`Home`, `Explore`, `Plan Create`, `Me`, `Notifications` のdesktop/mobile画面を作成する。
