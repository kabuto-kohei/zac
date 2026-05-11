CREATE TABLE IF NOT EXISTS "event_sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "platform" text NOT NULL,
  "handle" text NOT NULL,
  "display_name" text,
  "source_url" text NOT NULL,
  "source_type" text DEFAULT 'official_instagram' NOT NULL,
  "relationship_source_handle" text,
  "discovery_source" text,
  "discovery_note" text,
  "ingestion_policy" text DEFAULT 'summary_with_link' NOT NULL,
  "last_checked_at" timestamp with time zone,
  "source_verified_at" timestamp with time zone,
  "status" text DEFAULT 'candidate' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "event_sources_platform_handle_unique"
  ON "event_sources" USING btree ("platform", "handle");

CREATE INDEX IF NOT EXISTS "idx_event_sources_status"
  ON "event_sources" USING btree ("status");

CREATE INDEX IF NOT EXISTS "idx_event_sources_relationship_source"
  ON "event_sources" USING btree ("relationship_source_handle");
