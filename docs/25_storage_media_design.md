# Zac v5 Storage・画像アップロード設計

作成日: 2026-04-28  
目的: Supabase Storageのbucket、path、署名付きURL、画像制限、削除方針を固定する。

---

## 1. 基本方針

MVPでは画像のみ扱う。動画アップロードは実装しない。  
ユーザー由来画像はprivate bucket、管理者承認済みジム画像はpublic bucketに分ける。

---

## 2. Buckets

| bucket | public | 用途 |
|---|---:|---|
| `user-media` | false | プロフィール、投稿、記録画像 |
| `gym-public` | true | 管理者が登録したジム画像 |

---

## 3. Path設計

```text
user-media/
  users/{user_id}/avatar/{image_id}.jpg
  posts/{post_id}/{image_id}.jpg
  logs/{log_id}/{image_id}.jpg

gym-public/
  gyms/{gym_id}/{image_id}.jpg
```

pathにはメールアドレス、表示名、元ファイル名を含めない。

---

## 4. アップロード制限

| 項目 | 制限 |
|---|---|
| 画像形式 | jpg, png, webp |
| 1ファイル上限 | 5MB |
| 投稿画像 | 最大4枚 |
| 記録画像 | 最大4枚 |
| プロフィール画像 | 1枚 |
| ジム画像 | 管理者のみ、最大10枚 |

---

## 5. アップロードフロー

```text
Browser
  -> APIへアップロード許可要求
  -> APIが認可確認
  -> APIがsigned upload URLを発行
  -> BrowserがSupabase Storageへupload
  -> APIへ完了通知
  -> DBへimage rowを保存
```

DB rowが作成されていない画像は孤児ファイルとして削除対象にする。

---

## 6. 表示フロー

### user-media

- APIが対象コンテンツの閲覧権限を確認する。
- 権限がある場合のみsigned URLを発行する。
- signed URLの有効期限はMVPでは60分。

### gym-public

- public URLを返す。
- 削除済み/非公開ジムの画像はAPIで返さない。

---

## 7. 削除方針

- UGC削除時、画像は通常APIで返さない。
- 物理削除は `media_deletion_jobs` で非同期実行する。
- 削除失敗時はretryする。
- 管理者が削除した画像は監査ログに残す。

---

## 8. セキュリティ

- service role keyはAPIのみ保持。
- signed URLは権限確認後に発行。
- ユーザーは他人のpathへアップロードできない。
- MIME typeと拡張子を検証する。
- 画像本文やEXIFの取り扱いは安全側に倒し、可能ならEXIFを除去する。

---

## 9. テスト必須ケース

- 他人の投稿画像アップロードURLを取得できない。
- 非公開ログ画像のsigned URLを第三者が取得できない。
- 削除済み投稿画像がfeed APIから返らない。
- 5MB超の画像を拒否する。
- 5枚目の投稿画像を拒否する。
