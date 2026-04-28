# Zac v5 削除・退会・匿名化設計

作成日: 2026-04-28  
目的: 退会、削除、非表示、匿名化、監査ログ保持の境界を固定する。

---

## 1. 基本方針

Zacでは、ユーザーの予定・記録・投稿・画像を高リスク情報として扱う。  
退会時は本人の個人情報とprivateデータを削除し、公開UGCも通常画面から非表示にする。

MVPでは、退会後に公開投稿を残してコミュニティ文脈を維持するより、プライバシーと安全を優先する。

---

## 2. 削除種別

| 種別 | 内容 | 実装 |
|---|---|---|
| soft delete | 通常画面から非表示 | `deleted_at` |
| hard delete | DBから削除 | 個人情報/privateデータ |
| anonymize | 個人識別を外して最小保持 | audit/安全対応用 |
| moderation hide | 管理者非表示 | `moderation_actions` |

---

## 3. ユーザー退会時の処理

| データ | 処理 |
|---|---|
| `users.email` | 削除または不可逆匿名化 |
| `user_profiles` | hard delete |
| `user_settings` | hard delete |
| Supabase Auth user/identities | Supabase Auth側で削除 |
| device tokens | MVPでは保持しない。Push導入時にhard delete対象として追加 |
| `follows` | hard delete |
| `blocks` | hard delete |
| private `session_plans` | soft delete後、必要に応じてhard delete |
| public/followers `session_plans` | soft delete |
| private `climbing_logs` | hard delete |
| public/followers `climbing_logs` | soft delete |
| `posts` | soft delete |
| `comments` | soft delete |
| `notifications` | hard deleteまたは匿名化 |
| `reports` | reporterを匿名化して必要最小限保持 |
| `moderation_actions` | actor/targetを必要最小限保持 |
| `audit_logs` | 法務/安全目的で必要最小限保持 |

---

## 4. 画像削除

| 画像 | 処理 |
|---|---|
| プロフィール画像 | 退会時に削除対象 |
| 記録画像 | private logは削除対象、soft deleted logは通常APIで非返却 |
| 投稿画像 | soft delete後、非同期削除対象 |
| ジム公開画像 | ユーザー退会では削除しない |

画像削除は即時同期処理にしない。`media_deletion_jobs` を作り、非同期に削除する。

---

## 5. 通常削除

ユーザー本人の削除:

- 投稿: soft delete
- コメント: soft delete
- 予定: 作成者のみキャンセルまたはsoft delete
- 記録: privateはhard delete可、公開済みはsoft delete

管理者削除:

- 原則soft deleteまたはmoderation hide
- 操作は `audit_logs` と `moderation_actions` に残す

---

## 6. API挙動

- 削除済みデータは通常APIで返さない。
- 削除済み詳細取得は `404`。
- 退会ユーザーのプロフィール詳細は `404`。
- 管理者APIのみ、必要な範囲で削除済み/非表示データを参照できる。

---

## 7. テスト必須ケース

- 退会後、プロフィールが見えない。
- 退会後、private logが本人以外にも管理画面通常一覧にも出ない。
- soft deleted postがfeedに出ない。
- 削除済み画像URLが通常APIから返らない。
- 管理者削除操作がaudit logに残る。
- 通報済み対象を削除してもreport履歴が壊れない。
