ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "instagram_handle" text;
--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "instagram_url" text;
--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "source_type" text DEFAULT 'manual' NOT NULL;
--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "source_url" text;
--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "source_attribution" text;
--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "source_verified_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "source_policy" text DEFAULT 'summary_with_link' NOT NULL;
--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN IF NOT EXISTS "source_external_id" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "category" text DEFAULT 'event' NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "summary" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "capacity_text" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "source_type" text DEFAULT 'manual' NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "source_url" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "source_account" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "source_published_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "source_fetched_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "source_quote" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "source_raw_text" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "source_policy" text DEFAULT 'summary_with_link' NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "extraction_confidence" numeric(3,2);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "review_status" text DEFAULT 'approved' NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gyms_source_verified_at" ON "gyms" USING btree ("source_verified_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_gyms_source_external_id" ON "gyms" USING btree ("source_external_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_category_starts_at" ON "events" USING btree ("category","starts_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_source_url" ON "events" USING btree ("source_url");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_review_status" ON "events" USING btree ("review_status");
