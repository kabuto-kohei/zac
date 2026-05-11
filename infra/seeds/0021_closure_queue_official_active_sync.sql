-- Closure-queue official active sync, batch 2.
-- Checked on 2026-05-11 from public official pages.
-- Only official active evidence is applied; uncertain directory-only rows stay
-- in closureVerification for later recheck.

WITH official_active_gyms (
  source_external_id,
  disciplines,
  website_url,
  source_url,
  source_attribution,
  opening_hours_text
) AS (
  VALUES
    (
      'rockgym:ibaraki:spole',
      'ボルダー / リード',
      'https://spoleclimbinggym.com/',
      'https://spoleclimbinggym.com/',
      'SPOLE CLIMBING GYM公式サイト',
      '平日 13:00-22:00 / 土 10:00-22:00 / 日祝 10:00-20:00'
    ),
    (
      'rockgym:tochigi:mibu-climbing',
      'ボルダー',
      'https://www.town.mibu.tochigi.jp/docs/2015021200047/',
      'https://www.town.mibu.tochigi.jp/docs/2015021200047/',
      '壬生町公式WEBサイト 総合運動場体育館',
      '貸出時間 8:30-21:00 / 月曜休業 / 年末年始休業'
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = u.disciplines,
  "website_url" = u.website_url,
  "opening_hours_text" = COALESCE(u.opening_hours_text, g."opening_hours_text"),
  "source_type" = 'official_site',
  "source_url" = u.source_url,
  "source_attribution" = u.source_attribution,
  "source_verified_at" = '2026-05-11 15:10:00+09'::timestamptz,
  "source_policy" = 'summary_with_link',
  "status" = 'published',
  "deleted_at" = NULL,
  "updated_at" = now()
FROM official_active_gyms u
WHERE g."source_external_id" = u.source_external_id;

WITH official_sources (platform, handle, display_name, source_url, source_type, discovery_note) AS (
  VALUES
    (
      'web',
      'spole-climbing-gym',
      'SPOLE CLIMBING GYM公式サイト',
      'https://spoleclimbinggym.com/',
      'official_site',
      'Official Spole site. Use for events, route-set, lead school, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
    ),
    (
      'web',
      'mibu-general-gymnasium',
      '壬生町総合運動場体育館 公式ページ',
      'https://www.town.mibu.tochigi.jp/docs/2015021200047/',
      'official_site',
      'Official Mibu Town gymnasium page. Use for facility status, opening-change, and closure/rename rechecks. Publish summaries and source links only.'
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
  'closure_queue_official_active_sync',
  discovery_note,
  'summary_with_link',
  '2026-05-11 15:10:00+09'::timestamptz,
  '2026-05-11 15:10:00+09'::timestamptz,
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
