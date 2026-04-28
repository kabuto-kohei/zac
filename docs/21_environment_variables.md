# Zac v5 環境変数設計

作成日: 2026-04-27  
目的: 実装開始前に必要な環境変数を固定する。

---

## 1. 方針

- `.env.local` はローカル専用で、リポジトリに含めない。
- `.env.example` はキー名のみを管理する。
- service role keyなどの強い権限をWebブラウザへ渡さない。
- Browserに入る値はpublic扱いできるものだけにする。
- 本番/Preview/Localで値を分ける。

---

## 2. API/Admin共通

```dotenv
NODE_ENV=development
APP_ENV=local
APP_URL=http://localhost:3000
API_URL=http://localhost:8787

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

POSTHOG_KEY=
POSTHOG_HOST=

SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

---

## 3. User Web

Next.jsでは `NEXT_PUBLIC_` の値だけがブラウザへ露出する。

```dotenv
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_SENTRY_DSN=
```

禁止:

- `SUPABASE_SERVICE_ROLE_KEY` をブラウザに入れない。
- `DATABASE_URL` をブラウザに入れない。
- Sentry auth tokenをブラウザに入れない。

---

## 4. Admin

```dotenv
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_SENTRY_DSN=
```

Adminの管理者権限判定はクライアントだけで行わず、API側で必ず検証する。

---

## 5. API

```dotenv
PORT=8787
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
JWT_AUDIENCE=authenticated

STORAGE_USER_MEDIA_BUCKET=user-media
STORAGE_GYM_PUBLIC_BUCKET=gym-public

POSTHOG_KEY=
POSTHOG_HOST=
SENTRY_DSN=
```

---

## 6. `.env.example` に載せるもの

`.env.example` には値を入れず、キー名だけ載せる。

```dotenv
APP_ENV=
APP_URL=
API_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
POSTHOG_KEY=
POSTHOG_HOST=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

---

## 7. Secret管理

| Secret | 保存場所 |
|---|---|
| Supabase service role key | Vercel env / local `.env.local` |
| Database URL | Vercel env / local `.env.local` |
| Sentry auth token | Vercel env / GitHub Actions secret |
| PostHog key | Vercel env / Next.js public env |

---

## 8. ユーザーに依頼する値

以下はユーザー側のサービス作成後に必要。

- Supabase URL
- Supabase anon key
- Supabase service role key
- Database URL
- PostHog key
- PostHog host
- Sentry DSN
- Sentry auth token

秘密値はチャットに貼らない。ローカルの `.env.local` か各サービスのSecret Managerに設定する。
