-- Event taxonomy refinement.
-- Keep public display categories small while preserving source-level intent:
-- competition, event/lesson, route_set, opening_change, private_booking,
-- construction, notice, recruit.

WITH refined_events (id, category, capacity_text) AS (
  VALUES
    ('77777777-7777-4777-8777-000000000003', 'construction', '営業変更'),
    ('77777777-7777-4777-8777-000000000017', 'private_booking', '貸切')
)
UPDATE "events" e
SET
  "category" = r.category,
  "capacity_text" = r.capacity_text,
  "updated_at" = now()
FROM refined_events r
WHERE e."id" = r.id::uuid;
