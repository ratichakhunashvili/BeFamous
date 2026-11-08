CREATE TABLE "activity_days" (
	"user_id" uuid NOT NULL,
	"day" text NOT NULL,
	CONSTRAINT "activity_days_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
CREATE TABLE "badge_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"badge_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"name_ka" text NOT NULL,
	"name_en" text NOT NULL,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"condition_ka" text NOT NULL,
	"condition_en" text NOT NULL,
	"rule" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badge_levels" (
	"user_id" uuid NOT NULL,
	"level_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_badge_levels_user_id_level_id_pk" PRIMARY KEY("user_id","level_id")
);
--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "subtitle_ka" text;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "subtitle_en" text;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "bonus_ka" text;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "bonus_en" text;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "hero_url" text;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "cover_art" jsonb;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "interest_id" uuid;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_days" ADD CONSTRAINT "activity_days_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_levels" ADD CONSTRAINT "badge_levels_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badge_levels" ADD CONSTRAINT "user_badge_levels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badge_levels" ADD CONSTRAINT "user_badge_levels_level_id_badge_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."badge_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."interests"("id") ON DELETE no action ON UPDATE no action;