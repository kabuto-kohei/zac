# Zac v5 DB設計

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`

---

## 1. 方針

DBはPostgreSQLを前提にする。MVPではPostGISを必須にしなくてもよいが、ジムの緯度経度を保存し、将来的な近隣検索に備える。

設計原則:

- 全UGCに `visibility` を持たせる。
- UGCはソフトデリートする。
- 個人情報は削除/匿名化の対象として扱う。
- 管理者操作は監査ログに残す。
- MVPではルートDBを作らない。

---

## 2. 共通カラム

UGC系テーブルは原則として次を持つ。

```sql
id uuid primary key default gen_random_uuid(),
created_by uuid not null references users(id),
visibility text not null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
deleted_at timestamptz null
```

---

## 3. enum定義

### visibility

| 値 | 意味 |
|---|---|
| `public` | 全体公開 |
| `followers` | フォロワーのみ |
| `participants` | 参加者のみ |
| `private` | 自分のみ |

### session_plan_status

| 値 | 意味 |
|---|---|
| `draft` | 下書き |
| `scheduled` | 予定済み |
| `active` | 実施中 |
| `completed` | 完了 |
| `cancelled` | キャンセル |

### join_policy

| 値 | 意味 |
|---|---|
| `open` | 誰でも参加可 |
| `approval_required` | 承認制 |
| `invite_only` | 招待のみ |
| `closed` | 参加不可/非公開 |

### participant_status

| 値 | 意味 |
|---|---|
| `joined` | 参加 |
| `cancelled` | キャンセル |
| `invited` | 招待中 |
| `declined` | 辞退 |

---

## 4. 初期テーブル

### 4.1 users

```sql
create table users (
  id uuid primary key,
  email text unique,
  status text not null default 'active',
  email_verified_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);
```

### 4.2 user_profiles

```sql
create table user_profiles (
  user_id uuid primary key references users(id),
  display_name text not null,
  avatar_url text null,
  bio text null,
  home_area text null,
  climbing_experience text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.3 user_settings

```sql
create table user_settings (
  user_id uuid primary key references users(id),
  default_log_visibility text not null default 'private',
  default_plan_visibility text not null default 'followers',
  show_home_gym boolean not null default false,
  allow_location boolean not null default false,
  language text not null default 'ja',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.4 disciplines / categories

```sql
create table disciplines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0
);

create table user_disciplines (
  user_id uuid not null references users(id),
  discipline_id uuid not null references disciplines(id),
  primary key (user_id, discipline_id)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0
);

create table user_interest_categories (
  user_id uuid not null references users(id),
  category_id uuid not null references categories(id),
  primary key (user_id, category_id)
);
```

### 4.5 follows / blocks

```sql
create table follows (
  follower_id uuid not null references users(id),
  following_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table blocks (
  blocker_id uuid not null references users(id),
  blocked_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
```

### 4.6 gyms

```sql
create table gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text null,
  address text null,
  area text null,
  latitude numeric(10, 7) null,
  longitude numeric(10, 7) null,
  website_url text null,
  phone text null,
  opening_hours_text text null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table gym_images (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id),
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table gym_disciplines (
  gym_id uuid not null references gyms(id),
  discipline_id uuid not null references disciplines(id),
  primary key (gym_id, discipline_id)
);

create table gym_saves (
  user_id uuid not null references users(id),
  gym_id uuid not null references gyms(id),
  created_at timestamptz not null default now(),
  primary key (user_id, gym_id)
);

create table gym_updates (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id),
  title text not null,
  body text not null,
  status text not null default 'draft',
  published_at timestamptz null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);
```

### 4.7 session_plans

```sql
create table session_plans (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references users(id),
  gym_id uuid null references gyms(id),
  place_name text null,
  title text not null,
  discipline_id uuid null references disciplines(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled',
  visibility text not null default 'followers',
  join_policy text not null default 'open',
  max_participants integer null,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  check (start_at < end_at),
  check (gym_id is not null or place_name is not null)
);

create table session_plan_participants (
  plan_id uuid not null references session_plans(id),
  user_id uuid not null references users(id),
  status text not null default 'joined',
  joined_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (plan_id, user_id)
);

create table session_plan_comments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references session_plans(id),
  created_by uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);
```

### 4.8 climbing_logs

```sql
create table climbing_logs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references users(id),
  session_plan_id uuid null references session_plans(id),
  gym_id uuid null references gyms(id),
  place_name text null,
  discipline_id uuid null references disciplines(id),
  climbed_on date not null,
  grade_text text null,
  summary text null,
  note text null,
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  check (gym_id is not null or place_name is not null)
);

create table climbing_log_images (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references climbing_logs(id),
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
```

### 4.9 posts / comments

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references users(id),
  source_type text null,
  source_id uuid null,
  gym_id uuid null references gyms(id),
  body text not null,
  visibility text not null default 'followers',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id),
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table post_categories (
  post_id uuid not null references posts(id),
  category_id uuid not null references categories(id),
  created_at timestamptz not null default now(),
  primary key (post_id, category_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  created_by uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table post_likes (
  post_id uuid not null references posts(id),
  user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table post_saves (
  post_id uuid not null references posts(id),
  user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
```

### 4.10 events / notifications

```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid null references gyms(id),
  title text not null,
  description text null,
  starts_at timestamptz not null,
  ends_at timestamptz null,
  status text not null default 'draft',
  visibility text not null default 'public',
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table event_saves (
  event_id uuid not null references events(id),
  user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  type text not null,
  title text not null,
  body text null,
  target_type text null,
  target_id uuid null,
  read_at timestamptz null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  status text not null default 'draft',
  published_at timestamptz null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);
```

### 4.11 safety / admin / jobs

```sql
create table admin_memberships (
  user_id uuid primary key references users(id),
  role text not null default 'admin',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references users(id),
  target_type text not null,
  target_id uuid not null,
  category text not null,
  body text null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid null references reports(id),
  target_type text not null,
  target_id uuid not null,
  action text not null,
  reason text null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references users(id),
  action text not null,
  target_type text null,
  target_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table media_deletion_jobs (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  object_path text not null,
  target_type text null,
  target_id uuid null,
  status text not null default 'pending',
  attempts integer not null default 0,
  last_error text null,
  run_after timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 5. インデックス方針

最低限、次を作る。

```sql
create index idx_session_plans_created_by on session_plans(created_by);
create index idx_session_plans_gym_id on session_plans(gym_id);
create index idx_session_plans_start_at on session_plans(start_at);
create index idx_session_plans_visibility on session_plans(visibility);

create index idx_climbing_logs_created_by on climbing_logs(created_by);
create index idx_climbing_logs_gym_id on climbing_logs(gym_id);
create index idx_climbing_logs_climbed_on on climbing_logs(climbed_on);

create index idx_posts_created_by on posts(created_by);
create index idx_posts_gym_id on posts(gym_id);
create index idx_posts_created_at on posts(created_at);
create index idx_post_categories_category_id on post_categories(category_id);

create index idx_comments_target on comments(target_type, target_id);
create index idx_reports_status on reports(status);
create index idx_events_starts_at on events(starts_at);
create index idx_events_gym_id on events(gym_id);
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_read_at on notifications(read_at);
create index idx_gym_updates_gym_id on gym_updates(gym_id);
create index idx_media_deletion_jobs_status on media_deletion_jobs(status, run_after);
```

---

## 6. 固定事項

- `users.id` はSupabase Authのuser idと一致させる。それ以外の単独主キーは原則DB側で `gen_random_uuid()` を使う。
- enumはMVPでは `text + check制約` で持つ。将来値追加を軽くするため。
- ORM/MigrationはDrizzle ORM + drizzle-kitに固定する。
- PostGISはSupabase側で有効化可能な状態にする。MVPでは地図画面を作らず、緯度経度カラムだけ保持する。
- 退会時は個人情報とprivateデータを削除する。公開UGCは通常画面から非表示にし、必要最小限の匿名化メタデータのみ保持する。
