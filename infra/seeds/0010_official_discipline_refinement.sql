-- Official discipline refinement.
-- Checked on 2026-05-11 from public official site pages. Only primary-source
-- confirmed discipline changes are applied here; directory-only gyms remain
-- "クライミング" until official site or official SNS evidence is reviewed.

WITH official_disciplines (
  source_external_id,
  disciplines,
  website_url,
  source_url,
  source_attribution,
  source_verified_at
) AS (
  VALUES
    (
      'rockgym:tokyo:noborock-shibuya',
      'ボルダー',
      'https://noborock-climbing.com/program/shibuya/',
      'https://noborock-climbing.com/',
      'NOBOROCK 公式サイト',
      '2026-05-11 11:35:00+09'::timestamptz
    ),
    (
      'rockgym:tokyo:noborock-takadanobaba',
      'ボルダー',
      'https://noborock-climbing.com/program/takadanobaba/',
      'https://noborock-climbing.com/program/takadanobaba/',
      'NOBOROCK 高田馬場店 公式サイト',
      '2026-05-11 11:35:00+09'::timestamptz
    ),
    (
      'rockgym:tokyo:noborock-ikebukuro',
      'ボルダー',
      'https://noborock-climbing.com/program/ikebukuro/',
      'https://noborock-climbing.com/program/ikebukuro/',
      'NOBOROCK 池袋店 公式サイト',
      '2026-05-11 11:35:00+09'::timestamptz
    ),
    (
      'rockgym:tokyo:noborock-machida',
      'ボルダー',
      'https://noborock-climbing.com/program/machida/',
      'https://noborock-climbing.com/program/machida/',
      'NOBOROCK 町田店 公式サイト',
      '2026-05-11 11:35:00+09'::timestamptz
    ),
    (
      'rockgym:kanagawa:noborock-mizonokuchi',
      'ボルダー',
      'https://noborock-climbing.com/program/mizonokuchi/',
      'https://noborock-climbing.com/program/mizonokuchi/',
      'NOBOROCK 溝ノ口店 公式サイト',
      '2026-05-11 11:35:00+09'::timestamptz
    ),
    (
      'rockgym:saitama:noborock-omiya',
      'ボルダー',
      'https://noborock-climbing.com/program/omiya/',
      'https://noborock-climbing.com/program/omiya/',
      'NOBOROCK 大宮店 公式サイト',
      '2026-05-11 11:35:00+09'::timestamptz
    )
)
UPDATE "gyms" g
SET
  "disciplines_text" = d.disciplines,
  "website_url" = COALESCE(NULLIF(g."website_url", ''), d.website_url),
  "source_type" = 'official_site',
  "source_url" = d.source_url,
  "source_attribution" = d.source_attribution,
  "source_verified_at" = d.source_verified_at,
  "source_policy" = 'summary_with_link',
  "updated_at" = now()
FROM official_disciplines d
WHERE g."source_external_id" = d.source_external_id
  AND g."deleted_at" IS NULL;
