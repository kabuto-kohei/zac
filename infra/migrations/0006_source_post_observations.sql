CREATE TABLE IF NOT EXISTS "source_post_observations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_source_id" uuid REFERENCES "event_sources"("id"),
  "platform" text DEFAULT 'instagram' NOT NULL,
  "handle" text NOT NULL,
  "source_url" text NOT NULL,
  "source_external_id" text,
  "source_posted_at" timestamp with time zone,
  "observed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "classification" text,
  "title" text,
  "summary" text,
  "starts_at" timestamp with time zone,
  "ends_at" timestamp with time zone,
  "source_quote" text,
  "extraction_confidence" numeric(3, 2),
  "review_status" text DEFAULT 'pending' NOT NULL,
  "decision_note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "source_post_observations_platform_external_unique"
  ON "source_post_observations" USING btree ("platform", "source_external_id")
  WHERE "source_external_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "source_post_observations_source_url_unique"
  ON "source_post_observations" USING btree ("source_url");

CREATE INDEX IF NOT EXISTS "idx_source_post_observations_event_source"
  ON "source_post_observations" USING btree ("event_source_id");

CREATE INDEX IF NOT EXISTS "idx_source_post_observations_handle_observed"
  ON "source_post_observations" USING btree ("handle", "observed_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_source_post_observations_review"
  ON "source_post_observations" USING btree ("review_status", "classification");
