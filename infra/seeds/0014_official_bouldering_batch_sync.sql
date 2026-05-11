-- Additional official bouldering discipline sync.
-- Checked on 2026-05-11 from official pages or operator-owned pages. Zac
-- stores summaries and source links only; no images, videos, or full captions
-- are republished.

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
      'rockgym:gunma:and-energy',
      'ボルダー',
      'https://www.andenergy-bouldering.com/',
      'and_energy_bouldering',
      'https://www.instagram.com/and_energy_bouldering/',
      'https://www.andenergy-bouldering.com/',
      'And Energy Bouldering 公式サイト',
      '平日 13:00-21:30 / 土日祝 10:00-20:00 / 月曜定休'
    ),
    (
      'rockgym:ibaraki:aoroc',
      'ボルダー',
      'https://aoroc.jp/',
      NULL,
      NULL,
      'https://aoroc.jp/',
      'ao_roc.climbing 公式サイト',
      '月水 10:00-22:00 / 火木金 17:00-22:00 / 土日祝 10:00-20:00'
    ),
    (
      'rockgym:saitama:be-born',
      'ボルダー',
      'https://beborn.boy.jp/',
      NULL,
      NULL,
      'https://beborn.boy.jp/',
      'Be born Climbing gym 公式サイト',
      '平日 13:00-23:00 / 土日 10:00-22:00'
    ),
    (
      'rockgym:tochigi:berry-wall',
      'ボルダー',
      'https://www.berrywall.com/',
      NULL,
      NULL,
      'https://www.berrywall.com/',
      'BERRY WALL Climbing Gym 公式サイト',
      '平日 13:00-22:00 / 土日祝 10:00-22:00 / 月曜定休'
    ),
    (
      'rockgym:gunma:blue-bird',
      'ボルダー',
      'https://climbing-bluebird.jp/',
      NULL,
      NULL,
      'https://climbing-bluebird.jp/about',
      'Blue Bird Bouldering Gym 公式サイト',
      NULL
    ),
    (
      'rockgym:kanagawa:bolbol',
      'ボルダー',
      'https://bol-bol.com/',
      NULL,
      NULL,
      'https://bol-bol.com/',
      'BolBol 公式サイト',
      '平日 14:00-23:00 / 休日 10:00-21:00 / 月曜定休'
    ),
    (
      'rockgym:chiba:beaks',
      'ボルダー',
      'https://beaksc.wixsite.com/beaks',
      NULL,
      NULL,
      'https://beaksc.wixsite.com/beaks',
      'BEAKS Climbing Studio 公式サイト',
      '月-金 13:00-22:00 / 土 10:00-22:00 / 日 10:00-20:00'
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
  "source_verified_at" = '2026-05-11 13:35:00+09'::timestamptz,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_gym_updates u
WHERE g."source_external_id" = u.source_external_id
  AND g."deleted_at" IS NULL;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'and-energy-bouldering',
      'And Energy Bouldering 公式サイト',
      'https://www.andenergy-bouldering.com/',
      'official_site',
      'Official And Energy Bouldering page. Use for event, opening-change, and gym information discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'aoroc',
      'ao_roc.climbing 公式サイト',
      'https://aoroc.jp/',
      'official_site',
      'Official ao_roc.climbing page. Use for competition, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'be-born',
      'Be born Climbing gym 公式サイト',
      'https://beborn.boy.jp/',
      'official_site',
      'Official Be born page. Use for event and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'berry-wall',
      'BERRY WALL Climbing Gym 公式サイト',
      'https://www.berrywall.com/',
      'official_site',
      'Official BERRY WALL page. Use for competition, event, route-set, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'blue-bird-bouldering',
      'Blue Bird Bouldering Gym 公式サイト',
      'https://climbing-bluebird.jp/',
      'official_site',
      'Official Blue Bird page. Use for event and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'bolbol',
      'BolBol 公式サイト',
      'https://bol-bol.com/',
      'official_site',
      'Official BolBol page. Use for competition, event, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'web',
      'beaks-climbing-studio',
      'BEAKS Climbing Studio 公式サイト',
      'https://beaksc.wixsite.com/beaks',
      'official_site',
      'Official BEAKS page. Use for event and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'instagram',
      'and_energy_bouldering',
      'And Energy Bouldering',
      'https://www.instagram.com/and_energy_bouldering/',
      'official_instagram',
      'Confirmed on the official And Energy site. Use for event and opening-change discovery. Publish summaries and source links only.'
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
  '2026-05-11 13:35:00+09'::timestamptz,
  '2026-05-11 13:35:00+09'::timestamptz,
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
