DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "user_agent";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "image";