-- Additional official/operator-owned discipline sync.
-- Checked on 2026-05-11 from official pages or operator-owned booking pages.
-- Public Zac output remains summary-with-link only.

WITH official_gym_updates (
  source_external_id,
  disciplines,
  website_url,
  source_url,
  source_attribution,
  opening_hours_text
) AS (
  VALUES
    (
      'rockgym:saitama:bonobo',
      'ボルダー',
      'https://bonobo-bs.com/',
      'https://bonobo-bs.com/',
      'BONOBO bouldering space 公式サイト',
      '平日 13:00-23:00 / 土日祝 10:00-20:00 / 火曜定休'
    ),
    (
      'rockgym:gunma:landmark',
      'ボルダー',
      'https://boulderingspot-landmark.com/',
      'https://boulderingspot-landmark.com/',
      'Bouldering Spot Landmark 公式サイト',
      '13:00-22:00 / 火曜定休'
    ),
    (
      'rockgym:tokyo:caramba',
      'ボルダー',
      'https://www.caramba.jp/',
      'https://www.caramba.jp/',
      'CARAMBA 公式サイト',
      '平日 14:00-22:30 / 土日祝 10:00-20:00 / 月曜定休'
    ),
    (
      'rockgym:saitama:craze-kawaguchi',
      'ボルダー',
      'https://craze-climbing.com/kawaguchi/',
      'https://craze-climbing.com/kawaguchi/',
      'craze bouldering gym 川口店 公式サイト',
      '平日 17:00-23:00 / 土日祝 10:00-20:00 / 月曜定休'
    ),
    (
      'rockgym:saitama:community-park-yashio',
      'ボルダー',
      'https://coubic.com/communitypark-yashio',
      'https://coubic.com/communitypark-yashio',
      'Community Park Yashio 公式予約ページ',
      '平日 9:00-22:00 / 土 9:00-18:00 / 日祝 7:30-18:00 / 水曜定休'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = COALESCE(u.website_url, g."website_url"),
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 12:35:00+00'::timestamptz,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_gym_updates u
WHERE g."source_external_id" = u.source_external_id
  AND g."deleted_at" IS NULL;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'bonobo-bouldering-space',
      'BONOBO bouldering space 公式サイト',
      'https://bonobo-bs.com/',
      'official_site',
      'Official BONOBO page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'bouldering-spot-landmark',
      'Bouldering Spot Landmark 公式サイト',
      'https://boulderingspot-landmark.com/',
      'official_site',
      'Official Landmark page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'caramba',
      'CARAMBA 公式サイト',
      'https://www.caramba.jp/',
      'official_site',
      'Official CARAMBA page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'craze-kawaguchi',
      'craze bouldering gym 川口店 公式サイト',
      'https://craze-climbing.com/kawaguchi/',
      'official_site',
      'Official craze Kawaguchi page. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'community-park-yashio',
      'Community Park Yashio 公式予約ページ',
      'https://coubic.com/communitypark-yashio',
      'operator_owned_page',
      'Operator-owned Community Park Yashio booking page. Use for event, opening-change, and facility information discovery. Publish summaries and source links only.'
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
  '2026-05-11 12:35:00+00'::timestamptz,
  '2026-05-11 12:35:00+00'::timestamptz,
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
