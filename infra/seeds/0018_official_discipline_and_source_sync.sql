-- Official-source discipline/source sync.
-- Checked on 2026-05-11 from public official pages or official-page links.
-- Zac stores structured summaries and source links only.

WITH official_gym_updates (
  source_external_id,
  disciplines,
  website_url,
  instagram_url,
  source_url,
  source_attribution,
  opening_hours_text
) AS (
  VALUES
    (
      'rockgym:kanagawa:aladdin',
      'ボルダー / リード',
      'https://www7a.biglobe.ne.jp/~aladdinclimbing/',
      NULL,
      'https://www7a.biglobe.ne.jp/~aladdinclimbing/infomation.html',
      'クライミングジム「アラジン」公式サイト',
      '月 定休 / 火水木 14:00-23:00 / 金 18:00-23:00 / 土 12:00-21:00 / 日 11:00-20:00'
    ),
    (
      'rockgym:kanagawa:dogwood-takatsu',
      'クライミング',
      'https://dogwood-climbing.jp/',
      'https://www.instagram.com/dogwood_climbing_gym/',
      'https://dogwood-climbing.jp/access/',
      'DOGWOOD Climbing Gym 公式サイト',
      '平日 13:00-23:30 / 土日祝 10:00-21:00 / 金曜定休'
    ),
    (
      'rockgym:chiba:altior',
      'クライミング',
      'https://altior-gym.com/',
      NULL,
      'https://altior-gym.com/',
      'ALTIORクライミングジム公式サイト',
      NULL
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = COALESCE(u.website_url, g."website_url"),
  "instagram_url" = COALESCE(u.instagram_url, g."instagram_url"),
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 13:30:00+09'::timestamptz,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_gym_updates u
WHERE g."source_external_id" = u.source_external_id
  AND g."deleted_at" IS NULL;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'aladdin-climbing',
      'クライミングジム「アラジン」公式サイト',
      'https://www7a.biglobe.ne.jp/~aladdinclimbing/',
      'official_site',
      'Official Aladdin site. Use for event, school, route-set, opening-change, and private-booking discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'dogwood-climbing-gym',
      'DOGWOOD Climbing Gym 公式サイト',
      'https://dogwood-climbing.jp/',
      'official_site',
      'Official DOGWOOD site. Use for news, school, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'dogwood_climbing_gym',
      'DOGWOOD Climbing Gym 公式Instagram',
      'https://www.instagram.com/dogwood_climbing_gym/',
      'official_instagram',
      'Linked from the official DOGWOOD site. Use public post summaries and source links only; do not republish captions or media.'
    ),
    (
      'web',
      'altior-gym',
      'ALTIORクライミングジム公式サイト',
      'https://altior-gym.com/',
      'official_site',
      'Official ALTIOR site. Use for event, opening-change, and source/account discovery. Publish summaries and source links only.'
    )
)
INSERT INTO "event_sources" (
  "platform",
  "handle",
  "display_name",
  "source_url",
  "source_type",
  "relationship_source_handle",
  "discovery_source",
  "discovery_note",
  "ingestion_policy",
  "last_checked_at",
  "source_verified_at",
  "status"
)
SELECT
  platform,
  handle,
  display_name,
  source_url,
  source_type,
  NULL,
  'official_site_verification',
  discovery_note,
  'summary_with_link',
  '2026-05-11 13:30:00+09'::timestamptz,
  '2026-05-11 13:30:00+09'::timestamptz,
  'approved'
FROM official_sources
ON CONFLICT ("platform", "handle") DO UPDATE SET
  "display_name" = EXCLUDED."display_name",
  "source_url" = EXCLUDED."source_url",
  "source_type" = EXCLUDED."source_type",
  "discovery_source" = EXCLUDED."discovery_source",
  "discovery_note" = EXCLUDED."discovery_note",
  "ingestion_policy" = EXCLUDED."ingestion_policy",
  "last_checked_at" = EXCLUDED."last_checked_at",
  "source_verified_at" = EXCLUDED."source_verified_at",
  "status" = EXCLUDED."status",
  "updated_at" = now();
