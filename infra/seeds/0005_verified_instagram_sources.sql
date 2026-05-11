-- Official-source verification pass for gym Instagram accounts.
-- Evidence policy:
-- - The handle must appear on the gym/operator official site or equivalent
--   official source before being promoted to approved.
-- - Zac stores/serves summaries and source links only; it does not republish
--   captions or images.

WITH verified_gyms (
  source_external_id,
  name,
  website_url,
  instagram_handle,
  instagram_url,
  source_url,
  source_attribution,
  opening_hours_text
) AS (
  VALUES
    (
      'rockgym:tokyo:base-camp-tokyo-edogawabashi',
      'Base Camp Tokyo 江戸川橋',
      'https://b-camp.jp/edogawabashi/',
      'basecamp_edogawabashi',
      'https://www.instagram.com/basecamp_edogawabashi/',
      'https://b-camp.jp/edogawabashi/',
      'Base Camp Tokyo 江戸川橋 公式サイト',
      '平日 12:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:tokyo:base-camp-tokyo-kinshicho',
      'Base Camp Tokyo 錦糸町',
      'https://b-camp.jp/kinshicho/',
      'basecamp_kinshicho',
      'https://www.instagram.com/basecamp_kinshicho/',
      'https://b-camp.jp/kinshicho/',
      'Base Camp Tokyo 錦糸町 公式サイト',
      '平日 12:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:saitama:base-camp-hanno',
      'Boulder Park Base Camp 飯能店',
      'https://b-camp.jp/hanno',
      'basecamp_hanno',
      'https://www.instagram.com/basecamp_hanno/',
      'https://b-camp.jp/hanno',
      'Boulder Park Base Camp 飯能店 公式サイト',
      '平日 12:30-22:30 / 土 10:00-21:00 / 日祝 10:00-20:00'
    ),
    (
      'rockgym:saitama:base-camp-iruma',
      'Climb Park Base Camp 入間店',
      'https://b-camp.jp/iruma',
      'basecamp_iruma',
      'https://www.instagram.com/basecamp_iruma/',
      'https://b-camp.jp/iruma',
      'Climb Park Base Camp 入間店 公式サイト',
      '平日 12:30-22:30 / 土 10:00-21:00 / 日祝 10:00-20:00'
    ),
    (
      'rockgym:tokyo:noborock-machida',
      'NOBOROCK 町田店',
      'https://noborock-climbing.com/program/machida/',
      'noborock_machida',
      'https://www.instagram.com/noborock_machida/',
      'https://noborock-climbing.com/program/machida/',
      'NOBOROCK 町田店 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:saitama:noborock-omiya',
      'NOBOROCK 大宮店',
      'https://noborock-climbing.com/program/omiya/',
      'noborock_omiya',
      'https://www.instagram.com/noborock_omiya/',
      'https://noborock-climbing.com/program/omiya/',
      'NOBOROCK 大宮店 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:chiba:rocky-funabashi',
      'ROCKY 船橋店',
      'https://www.rockyclimbing.com/funabashi/',
      'funabashirocky',
      'https://www.instagram.com/funabashirocky/',
      'https://www.rockyclimbing.com/',
      'ROCKY Climbing & Fitness Gym 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    ),
    (
      'rockgym:ibaraki:rocky-tsukuba-ami',
      'ROCKY つくば阿見店',
      'https://www.rockyclimbing.com/tsukubaami/',
      'tsukuba_ami_rocky',
      'https://www.instagram.com/tsukuba_ami_rocky/',
      'https://www.rockyclimbing.com/',
      'ROCKY Climbing & Fitness Gym 公式サイト',
      '平日 10:00-23:00 / 土日祝 10:00-21:00'
    )
)
UPDATE "gyms" AS g
SET
  "website_url" = v.website_url,
  "instagram_handle" = v.instagram_handle,
  "instagram_url" = v.instagram_url,
  "opening_hours_text" = v.opening_hours_text,
  "source_type" = 'official_site',
  "source_url" = v.source_url,
  "source_attribution" = v.source_attribution,
  "source_verified_at" = now(),
  "updated_at" = now()
FROM verified_gyms AS v
WHERE g."source_external_id" = v.source_external_id
  AND g."deleted_at" IS NULL;

WITH verified_sources (
  handle,
  display_name,
  source_url,
  discovery_note
) AS (
  VALUES
    (
      'basecamp_edogawabashi',
      'Base Camp Tokyo 江戸川橋',
      'https://www.instagram.com/basecamp_edogawabashi/',
      'Confirmed on the Base Camp Tokyo 江戸川橋 official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'basecamp_kinshicho',
      'Base Camp Tokyo 錦糸町',
      'https://www.instagram.com/basecamp_kinshicho/',
      'Confirmed on the Base Camp Tokyo 錦糸町 official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'basecamp_hanno',
      'Boulder Park Base Camp 飯能店',
      'https://www.instagram.com/basecamp_hanno/',
      'Confirmed on the Boulder Park Base Camp 飯能店 official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'basecamp_iruma',
      'Climb Park Base Camp 入間店',
      'https://www.instagram.com/basecamp_iruma/',
      'Confirmed on the Climb Park Base Camp 入間店 official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'noborock_machida',
      'NOBOROCK 町田店',
      'https://www.instagram.com/noborock_machida/',
      'Confirmed on the NOBOROCK 町田店 official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'noborock_omiya',
      'NOBOROCK 大宮店',
      'https://www.instagram.com/noborock_omiya/',
      'Confirmed on the NOBOROCK 大宮店 official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
    ),
    (
      'funabashirocky',
      'ROCKY 船橋店',
      'https://www.instagram.com/funabashirocky/',
      'Confirmed on the ROCKY Climbing & Fitness Gym official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
    ),
	    (
	      'tsukuba_ami_rocky',
	      'ROCKY つくば阿見店',
	      'https://www.instagram.com/tsukuba_ami_rocky/',
	      'Confirmed on the ROCKY Climbing & Fitness Gym official site. Use for event, route-set, construction, and opening-change discovery. Publish summaries and source links only.'
	    ),
	    (
	      'ao_roc.climbing',
	      'アオロク〖ao_roc.climbing〗',
	      'https://www.instagram.com/ao_roc.climbing/',
	      'Confirmed on the ao_roc.climbing official site (https://aoroc.jp/) where the Instagram section references the handle. Use for competition/event and opening-change discovery. Publish summaries and source links only.'
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
  'instagram',
  handle,
  display_name,
  source_url,
  'official_instagram',
  NULL,
  'official_site_verification',
  discovery_note,
  'summary_with_link',
  now(),
  now(),
  'approved'
FROM verified_sources
ON CONFLICT ("platform", "handle") DO UPDATE SET
  "display_name" = EXCLUDED."display_name",
  "source_url" = EXCLUDED."source_url",
  "source_type" = 'official_instagram',
  "relationship_source_handle" = NULL,
  "discovery_source" = EXCLUDED."discovery_source",
  "discovery_note" = EXCLUDED."discovery_note",
  "ingestion_policy" = EXCLUDED."ingestion_policy",
  "last_checked_at" = EXCLUDED."last_checked_at",
  "source_verified_at" = EXCLUDED."source_verified_at",
  "status" = 'approved',
  "updated_at" = now();
