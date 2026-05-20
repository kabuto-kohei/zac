-- Official Instagram browser roller observations.
-- Generated: 2026-05-20T15:39:18.558Z
-- Policy: store source links, short summaries, and short quotes only; do not store passwords, cookies, full captions, images, videos, comments, DMs, or stories.

WITH checked_sources (id, handle) AS (
  VALUES
    ('ae3bf68c-ef39-4336-8496-08ad3618b804'::uuid, 'basecamp_shinjuku'),
    ('1c927437-7710-4318-9d77-e0e2104c9dc1'::uuid, 'bpump_ogikubo'),
    ('86b3a08a-8bae-454f-9eb0-241adab7b8ec'::uuid, 'bpumptokyo'),
    ('7046b655-8cd4-4087-a233-db5bb52aa729'::uuid, 'energyurawa'),
    ('8dd8d0fc-d295-40af-bd1c-a676b1d8ea4a'::uuid, 'be_born_climbing_gym'),
    ('924eff10-8759-4291-8975-8c9afb0f9ace'::uuid, 'exciting_sancha'),
    ('b2e46ff9-fa74-4413-9269-457f4a24775f'::uuid, 'noborock_takadanobaba'),
    ('29729a2e-530f-4bd6-a77f-f3d9a586f18e'::uuid, 'headrockcg'),
    ('130a0146-a8f8-4f45-bb5d-8f7680b3cc24'::uuid, 'okkurock'),
    ('980b0f60-2f81-4f01-b602-b141409f808e'::uuid, 'penguinclimb'),
    ('1e1c5950-4893-4760-bb9c-d11891dc09e5'::uuid, 'b.g.funny'),
    ('230beec0-b638-4d8d-acb9-b0d6c2dd6750'::uuid, 'bouldering_gym_share'),
    ('1f04c6db-0b8f-4dc0-94a4-9416dfa234fb'::uuid, 'climbing_gym_cozy'),
    ('15beb98e-1f8b-40b2-badc-791514039786'::uuid, 'climbinggym_hutte'),
    ('33933782-2ad8-4000-afae-772c5f05ecce'::uuid, 'climbrise2016'),
    ('86e485c9-55ea-48ea-b4bc-be876064ff75'::uuid, 'quartier_de_roche'),
    ('02d44afc-a542-4d6e-8e36-042215e7a55e'::uuid, 'rhinoandbird_nishinippori'),
    ('8e81426f-f0ee-45a1-ac86-6625148f8e1d'::uuid, 'rockbeans.insta'),
    ('f5d7c62a-37fb-4253-ab25-f7135be773db'::uuid, 'sloth.gym'),
    ('d138f4f5-4298-42bc-8905-703e7dde222a'::uuid, 'dbouldering_tsunashima'),
    ('60a38ea2-fbc2-4b56-a765-44b3c8421581'::uuid, 'jands_ikebukuro'),
    ('806b9f74-2b0b-418f-89df-a1b0ffe51a91'::uuid, 'echoesclimbing'),
    ('78a8cba8-4553-4856-8ec3-fd587d39fb78'::uuid, 'folk_boulderinggym')
)
UPDATE "event_sources" s
SET
  "last_checked_at" = '2026-05-20 15:39:18.558+00'::timestamptz,
  "updated_at" = now()
FROM checked_sources c
WHERE s."id" = c.id
  AND s."handle" = c.handle;

-- No new observed posts in this run.
