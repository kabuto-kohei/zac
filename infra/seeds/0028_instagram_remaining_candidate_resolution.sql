-- Resolve the final Instagram candidate matches after the first gym-link backfill.
-- Keep ambiguous branch handles paused instead of forcing them onto a nearby brand row.

WITH linked_gym_sources(source_external_id, handle, evidence) AS (
  VALUES
    ('rockgym:tochigi:rockyn', 'climbing_gym_rockyn0429', 'Instagram handle matches current gym name: RocKYN.'),
    ('rockgym:tokyo:rocklands', 'climbinggym_rocklands', 'Instagram handle matches current gym name: ROCKLANDS.'),
    ('rockgym:tokyo:westrock-chofu', 'westrock_climbing', 'Instagram handle matches WESTROCK brand account for the Chofu gym row.')
),
updated_linked_gyms AS (
  UPDATE gyms g
  SET instagram_handle = l.handle,
      instagram_url = 'https://www.instagram.com/' || l.handle || '/',
      source_verified_at = now(),
      updated_at = now()
  FROM linked_gym_sources l
  WHERE g.source_external_id = l.source_external_id
    AND g.deleted_at IS NULL
    AND g.status = 'published'
    AND (
      g.instagram_handle IS NULL
      OR lower(g.instagram_handle) = lower(l.handle)
    )
  RETURNING g.name, l.handle, l.evidence
)
UPDATE event_sources es
SET status = 'approved',
    source_verified_at = now(),
    last_checked_at = now(),
    display_name = coalesce(es.display_name, updated_linked_gyms.name),
    discovery_note = trim(concat_ws(' ', es.discovery_note, updated_linked_gyms.evidence)),
    updated_at = now()
FROM updated_linked_gyms
WHERE es.platform = 'instagram'
  AND lower(es.handle) = lower(updated_linked_gyms.handle)
  AND es.deleted_at IS NULL;

WITH ambiguous_sources(handle, note) AS (
  VALUES
    ('basecamp_kawagoe', 'Looks like a Base Camp Kawagoe branch/source, but no matching published gym row exists yet. Do not map to the Higashimurayama branch.')
)
UPDATE event_sources es
SET status = 'paused',
    last_checked_at = now(),
    discovery_note = trim(concat_ws(' ', es.discovery_note, ambiguous_sources.note)),
    updated_at = now()
FROM ambiguous_sources
WHERE es.platform = 'instagram'
  AND lower(es.handle) = lower(ambiguous_sources.handle)
  AND es.deleted_at IS NULL
  AND es.status = 'candidate';
