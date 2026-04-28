# Zac v5 初期seedデータ設計

作成日: 2026-04-27  
目的: コード実装開始時に投入する最小マスターデータを固定する。

---

## 1. disciplines

| key | 表示名 | sort_order |
|---|---|---:|
| `boulder` | ボルダー | 10 |
| `lead` | リード | 20 |
| `top_rope` | トップロープ | 30 |
| `outdoor` | 外岩 | 40 |
| `training` | トレーニング | 50 |

---

## 2. categories

| key | 表示名 | sort_order |
|---|---|---:|
| `partner` | 仲間探し | 10 |
| `log` | 記録 | 20 |
| `event` | イベント | 30 |
| `competition` | コンペ | 40 |
| `gym_discovery` | ジム開拓 | 50 |
| `training` | トレーニング | 60 |

---

## 3. report_categories

| key | 表示名 | sort_order |
|---|---|---:|
| `harassment` | ハラスメント | 10 |
| `spam` | スパム | 20 |
| `inappropriate_image` | 不適切画像 | 30 |
| `dangerous_activity` | 危険行為の助長 | 40 |
| `personal_information` | 個人情報の晒し | 50 |
| `copyright` | 著作権侵害 | 60 |
| `impersonation` | なりすまし | 70 |
| `other` | その他 | 80 |

---

## 4. 初期ジム

初期ジムは3〜5件をユーザーが指定する。最低限必要な項目:

| 項目 | 必須 | 備考 |
|---|---:|---|
| name | 必須 | ジム名 |
| area | 必須 | 例: 渋谷、新宿、横浜 |
| address | 推奨 | 公開情報のみ |
| latitude | 推奨 | 地図MVP外でも将来用に保持 |
| longitude | 推奨 | 地図MVP外でも将来用に保持 |
| website_url | 任意 | 公式サイト |
| opening_hours_text | 任意 | 自由入力 |
| disciplines | 必須 | disciplines keyの配列 |
| status | 必須 | 初期は `published` または `draft` |

---

## 5. 初期管理者

初期管理者はSupabase Authで作成したユーザーをadminとして紐づける。

必要:

- 管理者メールアドレス
- Supabase Auth user id
- MFA有効化。ベータ/本番前に必須

---

## 6. seed実装方針

- seedは冪等にする。
- keyが一致する場合は更新、なければ作成する。
- 本番seedと開発seedを分ける。
- 実ジム情報は公開情報または許諾済み情報だけを使う。
