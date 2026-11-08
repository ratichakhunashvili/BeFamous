DROP TABLE "user_badges" CASCADE;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "value_gel" integer;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "usage_ka" text DEFAULT 'ერთჯერადი';--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "usage_en" text DEFAULT 'Single use';--> statement-breakpoint
ALTER TABLE "vouchers" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "badges" DROP COLUMN "description_ka";--> statement-breakpoint
ALTER TABLE "badges" DROP COLUMN "description_en";--> statement-breakpoint
ALTER TABLE "badges" DROP COLUMN "condition_ka";--> statement-breakpoint
ALTER TABLE "badges" DROP COLUMN "condition_en";--> statement-breakpoint
ALTER TABLE "badges" DROP COLUMN "rule";