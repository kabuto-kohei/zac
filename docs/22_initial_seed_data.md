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

初期ジムは MVP の公開価値そのものなので、サンプルではなく公式情報または
確認済みディレクトリ情報を `gyms` に直接織り込む。現時点の seed は以下の2層。

- `0000_mvp_master_data.sql`: 公式確認済みの重点3件
- `0001_kanto_gym_directory.sql`: 関東圏の存在確認ベースライン187件

- B-PUMP Tokyo
- Rocky Shinagawa
- Noborock Shibuya

最低限必要な項目:

| 項目 | 必須 | 備考 |
|---|---:|---|
| name | 必須 | ジム名 |
| area | 必須 | 例: 渋谷、新宿、横浜 |
| address | 推奨 | 公開情報のみ |
| latitude | 推奨 | 地図MVP外でも将来用に保持 |
| longitude | 推奨 | 地図MVP外でも将来用に保持 |
| website_url | 任意 | 公式サイト |
| instagram_handle | 任意 | 公式SNSが確認できる場合のみ |
| instagram_url | 任意 | 公式SNSへの導線 |
| opening_hours_text | 任意 | 自由入力 |
| disciplines | 必須 | disciplines keyの配列 |
| source_external_id | 推奨 | 外部ソース由来の安定ID。例: `rockgym:tokyo:...` |
| source_type | 必須 | `official_site`, `official_instagram`, `directory_crosscheck`, `manual` |
| source_url | 必須 | 現在の根拠URL |
| source_attribution | 必須 | UIに出せる出典名 |
| source_verified_at | 必須 | 最終確認日 |
| source_policy | 必須 | 原則 `summary_with_link` |
| status | 必須 | 初期は `published` または `draft` |

---

## 5. 初期イベント

イベント、講習、ルートセット、営業変更は `events` に保存する。外部投稿を
別テーブルで主役化せず、来店判断に必要な構造化情報として扱う。

MVP seed は以下を投入する。

- B-PUMP Tokyo: ビギナー道場
- B-PUMP Tokyo: 4F ROOF TOP セット営業変更
- Noborock Shibuya: ルートセット営業変更

公開 API/UI に出すのは `title`, `summary`, `category`, `starts_at`,
`ends_at`, `capacity_text`, `source_url`, `source_account`, `source_quote`
まで。`source_raw_text` は内部監査・再生成用で公開しない。

---

## 6. 初期管理者

初期管理者はSupabase Authで作成したユーザーをadminとして紐づける。

必要:

- 管理者メールアドレス
- Supabase Auth user id
- MFA有効化。ベータ/本番前に必須

---

## 7. seed実装方針

- seedは冪等にする。
- keyが一致する場合は更新、なければ作成する。
- 本番seedと開発seedを分ける。
- 実ジム情報は公開情報または許諾済み情報だけを使う。
- 公式情報は必ず `source_url` と一緒に保存する。
- ディレクトリ由来の行は存在確認ベースラインとして扱い、公式確認で順次上書きする。
- 閉店確認済みのジムは `status = closed` とし、通常公開一覧には出さない。
- 画像・動画・本文全文は公開しない。
