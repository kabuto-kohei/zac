# Zac V1 Controlled Launch Materials

## Invite Message

Use this short message for the first controlled users:

```text
Zac V1 の限定確認に協力してください。

URL: https://zac-web.vercel.app

今回見てほしいのは、クライミングジムのイベントカレンダーと掲載ジム情報です。コンペ、セット替え、営業時間変更、貸切、休業などの情報が見やすいか、ジム情報に誤りがないかを確認してください。

もし情報が違う、足りない、古いと思った場合は、ジム詳細またはイベント詳細から「更新申請」を送ってください。更新申請にはログインが必要です。

今回は、投稿・ログ・予定参加・通知などは対象外です。まずは「イベントとジム情報が信頼できるか」を確認したいです。
```

## Feedback Record Template

Record controlled launch feedback with this table:

| Date | Reporter | Type | Target | URL | Summary | Evidence URL | Admin Status | Resolution |
|---|---|---|---|---|---|---|---|---|
| 2026-05-16 |  | missing_event |  |  |  |  | open |  |

Type values:

- `missing_event`
- `wrong_event_time`
- `wrong_gym_info`
- `source_link_update`
- `closure_or_relocation`
- `calendar_usability`
- `search_usability`
- `other`

Admin status values:

- `open`
- `reviewing`
- `resolved`
- `rejected`

Do not store secret values, access tokens, private user data, or copied
Instagram captions/media in the feedback record.

## Admin Review Quick Guide

Daily during the controlled launch:

1. Open `https://zac-admin.vercel.app/reports`.
2. Review new update requests.
3. Move valid requests to `reviewing`.
4. Check official source URLs before changing public data.
5. Open `https://zac-admin.vercel.app/event-candidates`.
6. Approve only candidates backed by official evidence.
7. Reject or leave pending weak evidence.
8. Mark handled update requests `resolved`.

Approval rules:

- Prefer official websites and official SNS.
- For closure, relocation, or rename, require official evidence when available.
- If official evidence is unavailable, require multiple independent current
  sources before treating a closure or relocation as confirmed.
- Do not publish copied Instagram captions, copied images, or copied videos.
- Keep uncertain event candidates draft/pending.

Escalate and pause launch if:

- API health fails.
- Source automation health/readiness is not `ok: true`.
- Admin cannot review reports.
- Public pages show draft/pending/rejected candidates.
- A privacy/auth/data exposure concern is reported.

## Test Update Request

The production test requires a real logged-in controlled test user:

1. Open `https://zac-web.vercel.app/reports/new?targetType=gym`.
2. Log in with the controlled test account.
3. Submit a harmless request such as:

```text
Controlled launch test request. No public data change needed.
```

4. Open Admin `/reports`.
5. Confirm the request appears.
6. Mark it `resolved` with reason:

```text
Controlled launch smoke request resolved.
```

Do not use a real user's private account for this test unless they explicitly
agree to be part of the controlled launch.
