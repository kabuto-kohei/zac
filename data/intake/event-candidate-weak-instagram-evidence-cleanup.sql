-- Manual cleanup for Instagram backfill candidates with handle-only evidence.
-- Generated from pending review inspection on 2026-05-21.
-- Scope: draft/pending candidates only; public/scheduled rows are not rejected here.

UPDATE source_post_observations AS observation
SET
  review_status = 'ignored',
  decision_note = 'Rejected during Instagram backfill quality cleanup: source quote contained only account/profile text, not enough post evidence for Admin review.',
  updated_at = now()
FROM events AS event
WHERE observation.source_url = event.source_url
  AND observation.review_status = 'event_candidate'
  AND event.id IN (
    'dd595f8f-b373-450b-8300-16037e0b1f64'::uuid,
    '0095a0e7-01ea-4a59-89d0-dd028236a372'::uuid,
    'd8744dda-e1df-4325-bf4a-119a56dba9d1'::uuid,
    '9fc1ba78-cd6c-4454-9f08-6e438e904560'::uuid
  );

UPDATE events
SET
  review_status = 'rejected',
  reviewed_at = now(),
  updated_at = now()
WHERE status = 'draft'
  AND review_status = 'pending'
  AND id IN (
    'dd595f8f-b373-450b-8300-16037e0b1f64'::uuid,
    '0095a0e7-01ea-4a59-89d0-dd028236a372'::uuid,
    'd8744dda-e1df-4325-bf4a-119a56dba9d1'::uuid,
    '9fc1ba78-cd6c-4454-9f08-6e438e904560'::uuid
  );
