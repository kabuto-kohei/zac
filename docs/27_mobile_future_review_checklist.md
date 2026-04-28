# Zac v5 将来モバイル版・ストア審査チェックリスト

作成日: 2026-04-28  
目的: 初期MVPはWebアプリだが、将来モバイル版へ移行する際に詰まる点を先に整理する。

---

## 1. 方針

初期MVPではモバイルアプリを作らない。  
Web版で「予定 -> 記録 -> 次の予定」のコアループを検証した後、Expo + React Nativeでモバイル版を検討する。

---

## 2. モバイル版で必要な外部サービス

| サービス | 用途 |
|---|---|
| Expo / EAS | build, submit, update |
| Apple Developer Program | TestFlight / App Store |
| Google Play Console | Internal test / Play Store |
| Sentry Mobile project | crash monitoring |
| Push provider | Expo Notifications / FCM / APNs |

---

## 3. UGCアプリの審査要件

モバイル版では、以下が実装済みであることを確認する。

- 通報導線
- ブロック導線
- 退会導線
- モデレーション方針
- 利用規約
- プライバシーポリシー
- 問い合わせ先
- 年齢制限
- 不適切コンテンツ削除フロー

---

## 4. iOS確認項目

- [ ] Apple Developer Program加入
- [ ] Bundle ID作成
- [ ] Sign in with Appleの要否確認
- [ ] Privacy Nutrition Label作成
- [ ] App Tracking Transparencyの要否確認
- [ ] TestFlight配布設定
- [ ] 退会導線の審査要件確認
- [ ] UGC moderation導線確認

---

## 5. Android確認項目

- [ ] Google Play Console登録
- [ ] package name確定
- [ ] Data Safety section作成
- [ ] Internal testing設定
- [ ] target API level確認
- [ ] 退会導線の審査要件確認
- [ ] UGC moderation導線確認

---

## 6. モバイル版へ進む条件

- Web版でクローズドベータを実施済み。
- `plan_to_log_conversion_rate` を評価済み。
- 通報/ブロック/退会/削除がWebで安定している。
- 利用規約/プライバシーポリシーが正式化済み。
- Push通知を入れる価値が確認されている。
