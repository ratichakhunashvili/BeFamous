ALTER TYPE "public"."submission_status" ADD VALUE 'draft' BEFORE 'pending';--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "platform" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "handle" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "thumbnail_url" text;