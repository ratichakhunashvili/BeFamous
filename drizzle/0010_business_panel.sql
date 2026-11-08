ALTER TYPE "public"."role" ADD VALUE 'business';--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;