# Zac Icons

Zacの固定UIアイコンはこのディレクトリに置く。

- 追加PNGは `apps/web/public/icons/zac/` に保存する。
- アプリで使うアイコンは `apps/web/src/features/home/zac-icons.tsx` の `ZacIconKey` と `zacIcons` に登録する。
- 画像パスは `/icons/zac/<file-name>.png` として参照する。
- ユーザー投稿画像、プロフィール画像、ジム写真など運用中に増減するメディアはSupabase Storageへ置く。
