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

- Shell幅: `min(viewport - horizontal padding, 760px)`
- Feed/Explore最大幅: `2200px`
- Detail/Form最大幅: `760px`
- 最小検証幅: `320px`
- 背景: `#071826`
- Surface: `#0b2236`
- Surface strong: `#0f2f4b`
- 角丸: `16px`、画像/visualは`20px`
- 境界線: `#1e3c57`
- Primary: `#38a8ff`
- Primary action: `#1477d4`
- Accent: `#f59e0b`
- Danger/Count: `#f59e0b`
- Text: `#f4f8fb`
- Muted text: `#98adc1`

UI方向性はZennのdark UIを参考にする。ただしZacでは記事ではなく、イベント、ジム、公開予定、記録を「まず閲覧できる」情報として見せる。
カードを強く囲いすぎず、暗いキャンバス上にリストと横並びの注目イベントを配置する。

### Responsive breakpoints

Figmaでは単一の固定カンプではなく、同じ情報設計が全サイズで破綻しないことを確認できるようにする。
初回レビュー対象は次の6幅とする。

| Width | 用途 | Shell / navigation | 主なレイアウト |
|---:|---|---|---|
| `320px` | 最小スマホstress | shell `288px`, bottom nav | すべて1列、CTAは折り返し、長い文言は複数行 |
| `390px` | iPhone標準 | shell `338px`, bottom nav | 1列、カードactionは下段full width |
| `430px` | 大きめスマホ | shell `378px`, bottom nav | 1列、topic/feed tabは横スクロール |
| `768px` | tablet portrait | shell `656px`, top nav | 注目イベントとfeedは1列、フォームは中央寄せ |
| `1024px` | tablet landscape / small desktop | shell `880px`, top nav | feedは1-2列、注目イベントは横並び候補 |
| `1440px` | desktop | shell `1240px`前後, top nav | Zenn風の広幅キャンバス、注目イベント横並び、feed 2列 |

Figma上の各screen frameはviewport幅を表す外側フレームを持ち、その中に `Shell` フレームを置く。
`Shell` はAuto Layout verticalで、horizontal resizingは `Fill container`、max width相当は幅別フレームで再現する。

### Responsive component rules

- `AppHeader`
  - `>= 768px`: brand左、actions右の横並び。
  - `< 768px`: brandとactionsを縦積み。actionsは横2列、`320px`では必要に応じて折り返す。
- `MainNav`
  - `>= 768px`: header直下のtop tab nav。アイコンではなく文字を主に見せる。
  - `< 768px`: bottom fixed nav想定。Figmaではviewport下部に固定位置の参照レイヤーを置く。
- `FeaturedEvents`
  - `>= 1024px`: 2-3列の横並び。
  - `< 1024px`: 1列。左にvisual、右にtag/title/meta。
- `MetricStrip`
  - Home/Exploreでは非表示。詳細画面やマイページでは補助情報として使う。
- `GuestBanner` / `AuthRequiredNote`
  - `>= 768px`: copy + actionsの2列。
  - `< 768px`: copy、actionsの縦積み。CTAはwrap可能な横並び。
- `Composer`
  - `>= 390px`: avatar + mainの2列。
  - `< 390px`: avatarを上段、input/actionsを下段に落とす。
- `ShortcutGrid`
  - `>= 768px`: 3列。
  - `< 768px`: 1列。
- `ExploreHero`
  - `>= 768px`: copy + countsの2列。
  - `< 768px`: copy、countsの縦積み。countsは2列を維持する。
- `ContentCard`
  - `>= 768px`: visual / bodyを基本にし、actionはbody下または右側に置く。
  - `< 768px`: visual / bodyの2列、actionは下段full width。
- `FeedGrid`
  - `>= 1024px`: 2列。
  - `< 1024px`: 1列。
- `TabRail` / `TopicRail`
  - 全幅で横スクロール可能。Figmaではoverflow領域を示すため右端に途中で切れるchipを1つ置く。
- Text
  - viewport幅でfont-sizeは変えない。
  - letter spacingは`0`。
  - 長い日本語はauto heightで折り返す。ボタン内で収まらない文言は短縮ではなく2行許容または幅を広げる。

### Figma responsive acceptance

- `320px`, `390px`, `430px`, `768px`, `1024px`, `1440px` の各幅で、主要テキスト、CTA、nav、カードactionが重ならない。
- Figmaの主要部品はAuto Layoutを使い、画面幅変更時に手動座標調整が不要な構造にする。
- 各screenは `Screen / {name} / {width}` で命名する。
- 同じ画面の幅違いは横並びに配置し、レビュー時に崩れ方を比較できるようにする。
- 実装との差分がある場合は、Figmaではなく実装済みWebを正とし、差分をコメントで明記してから修正する。

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
   - colors, typography, spacing, radius, shadows, responsive breakpoints
2. Components page
   - shell, nav, buttons, chips, cards, forms
   - componentごとのresponsive behavior notes
3. Screens + Review page
   - `320px`, `390px`, `430px`, `768px`, `1024px`, `1440px` artboards
   - Review notes
   - User feedback comments area

## 11. Figma MCP実行に必要な入力

Figmaへ直接書き込むには、次のどちらかが必要。

- 既存Figma file URL
- Figma file key

受領後、`Home`, `Explore`, `Plan Create`, `Me`, `Notifications` の各画面を `320px`, `390px`, `430px`, `768px`, `1024px`, `1440px` で作成する。
