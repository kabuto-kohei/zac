-- Bulk official discipline sync for gyms already backed by official pages.
-- Checked on 2026-05-11 from official gym/operator pages. This updates only
-- explicit primary-source-backed discipline values and keeps directory-only
-- uncertainty untouched.

WITH official_gym_updates (
  source_external_id,
  disciplines,
  website_url,
  instagram_handle,
  instagram_url,
  source_url,
  source_attribution,
  opening_hours_text
) AS (
  VALUES
    (
      'rockgym:tokyo:beta',
      'ボルダー',
      'https://beta-climbing.com/',
      NULL,
      NULL,
      'https://beta-climbing.com/price/en',
      'BETA Climbing Gym 公式サイト',
      '平日 10:00-23:00 / 土日祝 8:00-23:00 / 不定休'
    ),
    (
      'rockgym:tokyo:boulcom-tokyo',
      'ボルダー',
      'https://boulcom.jp/tokyo/',
      'boulcom_tokyo',
      'https://www.instagram.com/boulcom_tokyo/',
      'https://boulcom.jp/tokyo/',
      'BOULCOM 東京店 公式サイト',
      '年中無休 7:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:kanagawa:boulcom-kawasaki',
      'ボルダー',
      'https://boulcom.jp/kawasaki/',
      'boulcom_kawasaki',
      'https://www.instagram.com/boulcom_kawasaki/',
      'https://boulcom.jp/kawasaki/',
      'BOULCOM 川崎店 公式サイト',
      '年中無休 10:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:tokyo:everfree',
      'ボルダー',
      'https://everfree-climbing.com/',
      NULL,
      NULL,
      'https://everfree-climbing.com/',
      'Everfree Climbing Gym 公式サイト',
      '平日 13:00-23:00 / 土日祝 10:00-20:00'
    ),
    (
      'rockgym:tokyo:rocky-shinagawa',
      'ボルダー',
      'https://www.rockyclimbing.com/shinagawa/',
      'shina_rocky',
      'https://www.instagram.com/shina_rocky/',
      'https://www.rockyclimbing.com/',
      'ROCKY Climbing & Fitness Gym 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:tokyo:rocky-shinjuku-akebonobashi',
      'ボルダー',
      'https://www.rockyclimbing.com/shinjukuakebonobashi/',
      'jyuku_rocky',
      'https://www.instagram.com/jyuku_rocky/',
      'https://www.rockyclimbing.com/shinjukuakebonobashi/',
      'ROCKY 新宿曙橋店 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:chiba:rocky-inzai',
      'ボルダー',
      'https://www.rockyclimbing.com/inzai/',
      'inzairocky',
      'https://www.instagram.com/inzairocky/',
      'https://www.rockyclimbing.com/',
      'ROCKY Climbing & Fitness Gym 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:chiba:rocky-funabashi',
      'ボルダー',
      'https://www.rockyclimbing.com/funabashi/',
      'funabashirocky',
      'https://www.instagram.com/funabashirocky/',
      'https://www.rockyclimbing.com/',
      'ROCKY Climbing & Fitness Gym 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:ibaraki:rocky-tsukuba-ami',
      'ボルダー',
      'https://www.rockyclimbing.com/tsukubaami/',
      'tsukuba_ami_rocky',
      'https://www.instagram.com/tsukuba_ami_rocky/',
      'https://www.rockyclimbing.com/',
      'ROCKY Climbing & Fitness Gym 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = COALESCE(u.website_url, g."website_url"),
  "instagram_handle" = COALESCE(u.instagram_handle, g."instagram_handle"),
  "instagram_url" = COALESCE(u.instagram_url, g."instagram_url"),
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 13:15:00+09'::timestamptz,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_gym_updates u
WHERE g."source_external_id" = u.source_external_id
  AND g."deleted_at" IS NULL;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'beta-climbing',
      'BETA Climbing Gym 公式サイト',
      'https://beta-climbing.com/',
      'official_site',
      'Official BETA page. Use for event, route-set, opening-change, and gym information discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'boulcom-tokyo',
      'BOULCOM 東京店 公式サイト',
      'https://boulcom.jp/tokyo/',
      'official_site',
      'Official BOULCOM Tokyo page. Use for event, route-set, opening-change, and gym information discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'boulcom-kawasaki',
      'BOULCOM 川崎店 公式サイト',
      'https://boulcom.jp/kawasaki/',
      'official_site',
      'Official BOULCOM Kawasaki page. Use for event, route-set, opening-change, and gym information discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'everfree-climbing',
      'Everfree Climbing Gym 公式サイト',
      'https://everfree-climbing.com/',
      'official_site',
      'Official Everfree page. Use for event, opening-change, and gym information discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'rocky-climbing',
      'ROCKY Climbing & Fitness Gym 公式サイト',
      'https://www.rockyclimbing.com/',
      'official_site',
      'Official ROCKY operator page listing its bouldering gym stores and official Instagram handles. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'boulcom_tokyo',
      'BOULCOM 東京店',
      'https://www.instagram.com/boulcom_tokyo/',
      'official_instagram',
      'Confirmed on the BOULCOM official site. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'boulcom_kawasaki',
      'BOULCOM 川崎店',
      'https://www.instagram.com/boulcom_kawasaki/',
      'official_instagram',
      'Confirmed on the BOULCOM official site. Use for event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'shina_rocky',
      'ROCKY 品川店',
      'https://www.instagram.com/shina_rocky/',
      'official_instagram',
      'Confirmed on the ROCKY official operator page. Use for event and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'jyuku_rocky',
      'ROCKY 新宿曙橋店',
      'https://www.instagram.com/jyuku_rocky/',
      'official_instagram',
      'Confirmed on the ROCKY official operator page. Use for event and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'inzairocky',
      'ROCKY 印西店',
      'https://www.instagram.com/inzairocky/',
      'official_instagram',
      'Confirmed on the ROCKY official operator page. Use for event and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'funabashirocky',
      'ROCKY 船橋店',
      'https://www.instagram.com/funabashirocky/',
      'official_instagram',
      'Confirmed on the ROCKY official operator page. Use for event and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'tsukuba_ami_rocky',
      'ROCKY つくば阿見店',
      'https://www.instagram.com/tsukuba_ami_rocky/',
      'official_instagram',
      'Confirmed on the ROCKY official operator page. Use for event and opening-change discovery. Publish summaries and source links only.'
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
  '2026-05-11 13:15:00+09'::timestamptz,
  '2026-05-11 13:15:00+09'::timestamptz,
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
