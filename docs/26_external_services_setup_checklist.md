# Zac v5 外部サービス設定チェックリスト

作成日: 2026-04-28  
目的: 実装・運用開始時に外部サービス設定漏れで詰まらないようにする。

---

## 1. GitHub

- [ ] Repositoryを作成した
- [ ] main branch protectionを設定した
- [ ] PR必須運用を決めた
- [ ] GitHub Actions Secretsを設定できる
- [ ] CIでlint/typecheck/test/buildを実行する方針を決めた

---

## 2. Supabase

- [ ] Projectを作成した
- [ ] Regionを決めた
- [ ] Database passwordを安全に保管した
- [ ] Supabase URLを取得した
- [ ] anon keyを取得した
- [ ] service role keyを取得した
- [ ] database URLを取得した
- [ ] Email/password AuthをONにした
- [ ] Email confirmationをONにした
- [ ] 管理者MFAの運用方針を確認した
- [ ] `user-media` private bucketを作成した
- [ ] `gym-public` public bucketを作成した
- [ ] Storage policyを確認した

---

## 3. Vercel

- [ ] `zac-web` projectを作成した
- [ ] `zac-admin` projectを作成した
- [ ] `zac-api` projectを作成した
- [ ] GitHub repositoryと連携した
- [ ] Node.js 22を設定した
- [ ] install commandを `pnpm install --frozen-lockfile` にした
- [ ] Production envを設定した
- [ ] Preview envを設定した
- [ ] service role keyがWebのpublic envへ入っていないことを確認した

---

## 4. PostHog

- [ ] Projectを作成した
- [ ] Project API keyを取得した
- [ ] Host URLを確認した
- [ ] 本文、メール、正確な現在地を送らない方針を確認した
- [ ] 初期イベント一覧を登録/共有した

---

## 5. Sentry

- [ ] `zac-web` projectを作成した
- [ ] `zac-admin` projectを作成した
- [ ] `zac-api` projectを作成した
- [ ] DSNを取得した
- [ ] auth tokenを取得した
- [ ] PII送信を最小化する設定を確認した
- [ ] release tracking方針を決めた

---

## 6. 独自ドメイン

MVP初期では必須ではない。公開ベータ前に決める。

- [ ] ドメインを取得した
- [ ] DNS管理サービスを決めた
- [ ] Vercelへ接続した
- [ ] Privacy Policy/Terms URLを決めた

---

## 7. 実装開始前の最終確認

- [ ] `.env.local` を作成できる
- [ ] `.env.example` にキー名だけを書く
- [ ] 秘密情報をリポジトリに入れない
- [ ] 初期管理者メールを決めた
- [ ] 初期ジム3〜5件を決めた
- [ ] 利用規約/プライバシーポリシー草案の置き場所を決めた
