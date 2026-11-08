ALTER TYPE "public"."post_status" ADD VALUE 'dismissed';--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "submission_id" uuid;--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "platform" text;--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "caption" text;--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "metrics_source" text;--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invited_by_id" uuid;--> statement-breakpoint
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invites_inviter_idx" ON "invites" USING btree ("inviter_id");