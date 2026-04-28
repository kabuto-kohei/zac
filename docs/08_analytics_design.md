# Zac v5 KPI・イベント計測設計

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`

---

## 1. North Star Metric

Zac v5のNorth Star Metric:

```text
Weekly Completed Climb Sessions
```

1週間あたり、ユーザーがZac上で予定または記録として完了したクライミングセッション数。

---

## 2. KPI

| 分類 | KPI |
|---|---|
| Activation | 登録後24時間以内のジム保存率、初回予定作成率、初回ログ作成率 |
| Engagement | WAU、週次ログ数、週次予定数、コメント数、保存数 |
| Retention | D7/D30継続率、週次再ログ率、予定再作成率 |
| Social | フォロー数、参加予定数、コメント発生率、2人以上の予定割合 |
| Discovery | ジム検索数、ジム保存率、保存ジムからの予定作成率 |
| Safety | 通報率、通報対応時間、ブロック率、削除件数 |
| Supply | 登録ジム数、イベント数、ジム情報更新数 |

---

## 3. 初期イベント

| event | 発火タイミング |
|---|---|
| `sign_up_completed` | 登録完了 |
| `onboarding_completed` | オンボーディング完了 |
| `gym_viewed` | ジム詳細閲覧 |
| `gym_searched` | ジム検索 |
| `gym_saved` | ジム保存 |
| `session_plan_created` | 予定作成 |
| `session_plan_joined` | 予定参加 |
| `session_plan_completed` | 予定完了 |
| `log_created` | 記録作成 |
| `log_converted_to_post` | 記録から投稿 |
| `post_created` | 投稿作成 |
| `comment_created` | コメント作成 |
| `user_followed` | フォロー |
| `user_blocked` | ブロック |
| `report_submitted` | 通報 |

---

## 4. イベントプロパティ

### 4.1 共通

| property | 内容 |
|---|---|
| `user_id` | ユーザーID |
| `occurred_at` | 発火時刻 |
| `platform` | `ios`, `android`, `web` |
| `app_version` | アプリバージョン |

### 4.2 gym系

| property | 内容 |
|---|---|
| `gym_id` | ジムID |
| `area` | エリア |
| `discipline_ids` | 対応種目 |
| `source` | `search`, `feed`, `saved`, `recommendation` |

### 4.3 session_plan系

| property | 内容 |
|---|---|
| `plan_id` | 予定ID |
| `gym_id` | ジムID |
| `visibility` | 公開範囲 |
| `join_policy` | 参加ポリシー |
| `participant_count` | 参加者数 |
| `source` | `gym_detail`, `plans_tab`, `feed`, `manual` |

### 4.4 log系

| property | 内容 |
|---|---|
| `log_id` | 記録ID |
| `session_plan_id` | 元予定ID |
| `gym_id` | ジムID |
| `visibility` | 公開範囲 |
| `has_image` | 画像有無 |
| `source` | `manual`, `from_plan` |

### 4.5 safety系

| property | 内容 |
|---|---|
| `target_type` | 対象種別 |
| `target_id` | 対象ID |
| `category` | 通報カテゴリ |

---

## 5. ファネル

### 5.1 Activation

```text
sign_up_completed
  -> onboarding_completed
  -> gym_viewed
  -> gym_saved
  -> session_plan_created or log_created
```

### 5.2 Climb Life Loop

```text
gym_saved
  -> session_plan_created
  -> session_plan_completed
  -> log_created
  -> log_converted_to_post
  -> session_plan_created
```

### 5.3 Social Loop

```text
post_created
  -> comment_created
  -> user_followed
  -> session_plan_joined
```

---

## 6. ダッシュボード初期項目

- DAU/WAU
- 登録数
- オンボーディング完了率
- ジム保存率
- 週次予定作成数
- 週次記録数
- 予定から記録への変換率
- 記録から投稿への変換率
- 通報数
- ブロック数

---

## 7. 注意事項

- 現在地の正確な緯度経度を分析イベントに送らない。
- 公開範囲がprivateのログ本文やメモを分析イベントに送らない。
- 投稿本文、コメント本文を分析イベントに送らない。
- ユーザーのメールアドレスを分析イベントに送らない。
