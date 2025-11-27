CREATE TABLE "password_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "password_reset_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "mfa_secret" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "backup_codes" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "verification_token" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "verification_token_expires" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "failed_login_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "locked_until" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_login_attempt" timestamp;--> statement-breakpoint
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;