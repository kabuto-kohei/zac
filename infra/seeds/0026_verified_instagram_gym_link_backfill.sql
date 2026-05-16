-- Backfill verified or strong gym/profile Instagram links.
-- Policy: link only accounts whose handle clearly matches a published gym name/slug,
-- or whose official site link discovery already confirmed the profile.

WITH verified_links(source_external_id, handle, evidence) AS (
  VALUES
    ('rockgym:ibaraki:avue', '310_avue', 'Instagram handle matches gym slug/name: avue'),
    ('rockgym:chiba:altior', 'altior_climbing_gym1', 'Instagram handle matches gym slug/name: altior'),
    ('rockgym:chiba:funny', 'b.g.funny', 'Instagram handle matches gym slug/name: funny'),
    ('rockgym:chiba:beaks', 'beaks.climbing', 'Instagram handle matches gym slug/name: beaks'),
    ('rockgym:kanagawa:share', 'bouldering_gym_share', 'Instagram handle matches gym slug/name: share'),
    ('rockgym:chiba:tohan-dojo', 'bouldering_gym_tohandoujou', 'Instagram handle matches gym slug/name: tohan-dojo'),
    ('rockgym:tokyo:bleau', 'bouldering_space_bleau', 'Instagram handle matches gym slug/name: bleau'),
    ('rockgym:kanagawa:hat', 'boulderingspace_hat', 'Instagram handle matches gym slug/name: hat'),
    ('rockgym:ibaraki:vortex', 'climb.vortex', 'Instagram handle matches gym slug/name: vortex'),
    ('rockgym:chiba:asuka', 'climbing_aska', 'Instagram handle matches gym slug/name: asuka'),
    ('rockgym:gunma:cozy', 'climbing_gym_cozy', 'Instagram handle matches gym slug/name: cozy'),
    ('rockgym:tokyo:hutte', 'climbinggym_hutte', 'Instagram handle matches gym slug/name: hutte'),
    ('rockgym:tochigi:flash', 'climbinggymflash', 'Instagram handle matches gym slug/name: flash'),
    ('rockgym:saitama:zero-saitama', 'climbingzerosaitama', 'Instagram handle matches gym slug/name: zero saitama'),
    ('rockgym:kanagawa:rise', 'climbrise2016', 'Instagram handle matches gym slug/name: rise'),
    ('rockgym:chiba:d-bouldering-plus-tsudanuma', 'dbouldering_tsudanuma', 'Instagram handle matches D.Bouldering Tsudanuma gym slug'),
    ('rockgym:kanagawa:d-bouldering-tsunashima', 'dbouldering_tsunashima', 'Instagram handle matches D.Bouldering Tsunashima gym slug'),
    ('rockgym:chiba:d-bouldering-plus-yachiyo', 'dbouldering_yachiyo', 'Official site link discovery and handle match'),
    ('rockgym:ibaraki:echoes', 'echoesclimbing', 'Instagram handle matches gym slug/name: echoes'),
    ('rockgym:chiba:energy-kashiwa', 'energy_kashiwa', 'Instagram handle matches gym slug/name: energy kashiwa'),
    ('rockgym:kanagawa:folk', 'folk_boulderinggym', 'Instagram handle matches gym slug/name: folk'),
    ('rockgym:ibaraki:freiheit', 'freiheit_bouldering', 'Instagram handle matches gym slug/name: freiheit'),
    ('rockgym:saitama:fukaya-climbing-village', 'fukayaclimbingvillage', 'Instagram handle matches gym slug/name: fukaya climbing village'),
    ('rockgym:chiba:granny-minami-nagareyama', 'granny_bouldering', 'Instagram handle matches gym brand/name: granny'),
    ('rockgym:tokyo:jam-session-mitaka', 'jamsessionmitaka', 'Instagram handle matches gym slug/name: jam session mitaka'),
    ('rockgym:tokyo:js-ikebukuro', 'jands_ikebukuro', 'Instagram handle matches gym slug/name: J&S Ikebukuro'),
    ('rockgym:tokyo:jet-set', 'jetsetclimbing', 'Instagram handle matches gym slug/name: jet set'),
    ('rockgym:kanagawa:kachill', 'kachill_climbing', 'Instagram handle matches gym slug/name: kachill'),
    ('rockgym:tochigi:lost-canyon', 'lostcanyon_official', 'Instagram handle matches gym slug/name: lost canyon'),
    ('rockgym:saitama:lutra-lutra', 'lutra_lutra_climb_park_', 'Instagram handle matches gym slug/name: lutra lutra'),
    ('rockgym:tokyo:mitaka-gym', 'mitaka_gym', 'Instagram handle matches gym slug/name: mitaka gym'),
    ('rockgym:tochigi:mountain-cliff', 'mountain_cliff_climbing', 'Instagram handle matches gym slug/name: mountain cliff'),
    ('rockgym:saitama:next-gen-bouldering', 'nextgen.bouldering', 'Instagram handle matches gym slug/name: next gen bouldering'),
    ('rockgym:tokyo:nose-machida', 'nose_machida_climbinggym', 'Instagram handle matches gym slug/name: nose machida'),
    ('rockgym:chiba:olioli', 'olioli_climbing.gym', 'Instagram handle matches gym slug/name: olioli'),
    ('rockgym:kanagawa:peradora-yokohama', 'peradra_gym', 'Instagram handle matches gym brand/name: peradora/peradra'),
    ('rockgym:kanagawa:project', 'project_climbing_gym', 'Instagram handle matches gym slug/name: project'),
    ('rockgym:chiba:carche-roche', 'quartier_de_roche', 'Instagram handle matches gym name transliteration: quartier de roche'),
    ('rockgym:tokyo:rhino-and-bird', 'rhinoandbird_nishinippori', 'Instagram handle matches gym slug/name: rhino and bird'),
    ('rockgym:tokyo:rockbeans', 'rockbeans.insta', 'Instagram handle matches gym slug/name: rockbeans'),
    ('rockgym:kanagawa:sloth', 'sloth.gym', 'Instagram handle matches gym slug/name: sloth'),
    ('rockgym:saitama:three-peaks', 'three_peaks_climbing', 'Instagram handle matches gym slug/name: three peaks'),
    ('rockgym:tokyo:spodori', 'tokyodomecity_spodori', 'Instagram handle matches gym slug/name: spodori'),
    ('rockgym:saitama:trip', 'tripclimbing', 'Instagram handle matches gym slug/name: trip'),
    ('rockgym:tokyo:the-stone-session-tokyo', 'tsstokyo', 'Instagram handle matches gym abbreviation/name: TSS Tokyo'),
    ('rockgym:tokyo:underground', 'underground_bouldering_gym', 'Instagram handle matches gym slug/name: underground'),
    ('rockgym:tokyo:volny', 'volny_climbing', 'Instagram handle matches gym slug/name: volny'),
    ('rockgym:ibaraki:zero-mito', 'zeromito0123', 'Instagram handle matches gym slug/name: zero mito')
),
updated_gyms AS (
  UPDATE gyms g
  SET instagram_handle = v.handle,
      instagram_url = 'https://www.instagram.com/' || v.handle || '/',
      source_verified_at = now(),
      updated_at = now()
  FROM verified_links v
  WHERE g.source_external_id = v.source_external_id
    AND g.deleted_at IS NULL
    AND g.status = 'published'
    AND (
      g.instagram_handle IS NULL
      OR lower(g.instagram_handle) = lower(v.handle)
    )
  RETURNING g.source_external_id, g.name, v.handle, v.evidence
)
UPDATE event_sources es
SET status = 'approved',
    source_verified_at = now(),
    last_checked_at = now(),
    display_name = coalesce(es.display_name, updated_gyms.name),
    discovery_note = trim(concat_ws(' ', es.discovery_note, updated_gyms.evidence)),
    updated_at = now()
FROM updated_gyms
WHERE es.platform = 'instagram'
  AND lower(es.handle) = lower(updated_gyms.handle)
  AND es.deleted_at IS NULL;
