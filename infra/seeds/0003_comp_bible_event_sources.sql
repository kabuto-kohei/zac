-- Event source registry seeded from the Comp Bible discovery path.
-- Do not scrape Instagram captions or images into public UI. Store source
-- handles as candidates, then publish only summaries plus source links.

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
VALUES
  (
    'instagram',
    'comp_bible',
    'コンペバイブル',
    'https://www.instagram.com/comp_bible/',
    'aggregator_instagram',
    NULL,
    'user_request',
    'User identified Comp Bible as the primary discovery account for climbing competition/event sources. Exact handle should be confirmed in Instagram before production crawling.',
    'summary_with_link',
    '2026-05-10 00:00:00+09',
    NULL,
    'candidate'
  ),
  (
    'web',
    'westrock-climbing-event',
    'WESTROCK 公式イベント情報',
    'https://www.westrock-climbing.com/event/',
    'official_site',
    'comp_bible',
    'manual_crosscheck',
    'Official event page used for STONE CIRCUIT Plus+ and TAMAX 2026 source confirmation.',
    'summary_with_link',
    '2026-05-10 00:00:00+09',
    '2026-05-10 00:00:00+09',
    'approved'
  ),
  (
    'web',
    'base-camp-edogawabashi',
    'BASE CAMP TOKYO 江戸川橋 公式サイト',
    'https://b-camp.jp/edogawabashi/',
    'official_site',
    'comp_bible',
    'manual_crosscheck',
    'Official page used for route-set and construction notices.',
    'summary_with_link',
    '2026-05-10 00:00:00+09',
    '2026-05-10 00:00:00+09',
    'approved'
  ),
  (
    'web',
    'climbers-bloc-2026',
    'CLIMBERS BLoC 2026記事',
    'https://www.climbers-web.jp/news/20260214-1/',
    'media_summary',
    'comp_bible',
    'manual_crosscheck',
    'Specialized climbing media schedule used as an initial BLoC 2026 event baseline; official BLoC/host-gym pages should supersede it when verified.',
    'summary_with_link',
    '2026-05-10 00:00:00+09',
    NULL,
    'candidate'
  )
ON CONFLICT ("platform", "handle") DO UPDATE SET
  "display_name" = EXCLUDED."display_name",
  "source_url" = EXCLUDED."source_url",
  "source_type" = EXCLUDED."source_type",
  "relationship_source_handle" = EXCLUDED."relationship_source_handle",
  "discovery_source" = EXCLUDED."discovery_source",
  "discovery_note" = EXCLUDED."discovery_note",
  "ingestion_policy" = EXCLUDED."ingestion_policy",
  "last_checked_at" = EXCLUDED."last_checked_at",
  "source_verified_at" = EXCLUDED."source_verified_at",
  "status" = EXCLUDED."status",
  "updated_at" = now(),
  "deleted_at" = NULL;
