-- Resolve remaining Instagram candidate queue into linked gyms, useful event-series sources,
-- or paused sources that require a gym row before automation should inspect them.

WITH linked_gym_sources(source_external_id, handle, evidence) AS (
  VALUES
    ('rockgym:tokyo:maboo', 'maboo.insta', 'Instagram handle matches current gym slug/name: MABOO'),
    ('rockgym:saitama:ogano-climbing-park', 'shinnikan', 'Instagram handle matches facility name: 神怡舘')
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

WITH event_series_sources(handle, display_name, note) AS (
  VALUES
    ('bloc_bouldering_local_circuit', 'BLoC Bouldering Local Circuit', 'Competition/event series account; not a single gym. Use as an aggregator source.'),
    ('chokuzen_nobocon', '直前ノボコン', 'Competition/event series account; not a single gym. Use as an aggregator source.'),
    ('comp_bible', 'コンペバイブル', 'Aggregator account requested by the user; useful for event discovery, not a single gym.'),
    ('iichiko_step', 'iichiko STEP', 'Competition/event series account; not a single gym. Use as an aggregator source.'),
    ('maboo.dynamite', 'MABOO Dynamite', 'Competition/event account related to MABOO; not the gym profile.'),
    ('merry_go_round_m5r', 'Merry Go Round', 'Competition/event series account; not a single gym. Use as an aggregator source.'),
    ('moving3_rocky_noborock', 'MOVING3 Rocky/Noborock', 'Competition/event series account; not a single gym. Use as an aggregator source.'),
    ('rocky__climbing', 'ROCKY Climbing', 'Operator/brand account; use as source discovery, not a single branch gym.'),
    ('thecolors2026', 'THE COLORS 2026', 'Competition/event series account; not a single gym. Use as an aggregator source.'),
    ('young_gun_circuit_ygc', 'Young Gun Circuit', 'Competition/event series account; not a single gym. Use as an aggregator source.'),
    ('zenchu_boulder', '全中ボルダー', 'Competition/event series account; not a single gym. Use as an aggregator source.')
)
UPDATE event_sources es
SET source_type = 'aggregator_instagram',
    status = 'approved',
    display_name = coalesce(es.display_name, event_series_sources.display_name),
    source_verified_at = now(),
    last_checked_at = now(),
    discovery_note = trim(concat_ws(' ', es.discovery_note, event_series_sources.note)),
    updated_at = now()
FROM event_series_sources
WHERE es.platform = 'instagram'
  AND lower(es.handle) = lower(event_series_sources.handle)
  AND es.deleted_at IS NULL;

WITH needs_gym_row(handle, note) AS (
  VALUES
    ('betaclimb.odawara', 'Looks like a real branch/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('boulderinggym.bunker2', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('bunker.boulderinggym', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('chabouzu.bouldering.gym', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('dbouldering_funabashi', 'Looks like a D.Bouldering branch, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('dbouldering_kasukabe', 'Looks like a D.Bouldering branch, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('dbouldering_kawasaki', 'Looks like a D.Bouldering branch, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('dbouldering_tamachi', 'Looks like a D.Bouldering branch, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('jands_nakano_boulderinggym', 'Looks like a J&S/Nakano source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('krimp_cg', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('moripark_sports_wall', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('noborock_shinjuku', 'Looks like a NOBOROCK branch, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('onebouldering', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('risingstar_climbing', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('rockmania.jp', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('rocktime_climbing_gym', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('ryougoku_rocky', 'Looks like a ROCKY branch, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('villarsclimbing', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.'),
    ('wall_to_wall_chiba', 'Looks like a real gym/source, but no matching published gym row exists yet. Add or verify gym before inspecting.')
)
UPDATE event_sources es
SET status = 'paused',
    last_checked_at = now(),
    discovery_note = trim(concat_ws(' ', es.discovery_note, needs_gym_row.note)),
    updated_at = now()
FROM needs_gym_row
WHERE es.platform = 'instagram'
  AND lower(es.handle) = lower(needs_gym_row.handle)
  AND es.deleted_at IS NULL
  AND es.status = 'candidate';
