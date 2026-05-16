import { createRequire } from "node:module";
import { withDatabaseClient } from "./db-runtime.mjs";

const requireFromDbPackage = createRequire(new URL("../packages/db/package.json", import.meta.url));
const postgres = requireFromDbPackage("postgres");

const databaseUrl = process.env.DATABASE_URL;
const email = process.argv[2]?.trim().toLowerCase();

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/grant-admin-member.mjs <email>");
  process.exit(1);
}

const rows = await withDatabaseClient(
  postgres,
  databaseUrl,
  async (sql) => sql`
    with target_auth as (
      select id, email, email_confirmed_at
      from auth.users
      where lower(email::text) = lower(${email}::text)
      limit 1
    ),
    upsert_user as (
      insert into public.users (id, email, status, email_verified_at, updated_at)
      select id, email, 'active', email_confirmed_at, now()
      from target_auth
      on conflict (id) do update set
        email = excluded.email,
        status = 'active',
        email_verified_at = coalesce(public.users.email_verified_at, excluded.email_verified_at),
        updated_at = now()
      returning id, email
    ),
    target_user as (
      select id, email from upsert_user
      union
      select id, email from public.users
      where lower(email::text) = lower(${email}::text)
      limit 1
    ),
    upsert_admin as (
      insert into public.admin_memberships (user_id, role, enabled, updated_at)
      select id, 'admin', true, now()
      from target_user
      on conflict (user_id) do update set
        role = 'admin',
        enabled = true,
        updated_at = now()
      returning user_id, role, enabled
    )
    select target_user.email, upsert_admin.role, upsert_admin.enabled
    from target_user
    join upsert_admin on upsert_admin.user_id = target_user.id
  `,
  { label: "grant admin membership" },
);

if (rows.length === 0) {
  console.log(JSON.stringify({ updated: 0, email, reason: "user_not_found" }));
  process.exit(2);
}

console.log(JSON.stringify({ updated: rows.length, email: rows[0].email, role: rows[0].role, enabled: rows[0].enabled }));
