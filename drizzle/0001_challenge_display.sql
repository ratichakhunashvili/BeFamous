ALTER TABLE "challenges" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "kind" text DEFAULT 'video' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "category_ka" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "category_en" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "reward_ka" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "reward_en" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "hashtags" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "cover_art" jsonb;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "steps" jsonb;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "rules" jsonb;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "required" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "unlock_after_mission_id" uuid;