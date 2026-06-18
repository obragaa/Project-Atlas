CREATE TABLE "measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"recorded_on" date NOT NULL,
	"weight_kg" double precision,
	"waist_cm" double precision,
	"chest_cm" double precision,
	"hips_cm" double precision,
	"arm_cm" double precision,
	"thigh_cm" double precision,
	"calf_cm" double precision,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "measurements_weight_valid" CHECK ("measurements"."weight_kg" is null or ("measurements"."weight_kg" > 0 and "measurements"."weight_kg" <= 1000))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "measurements_user_date_key" ON "measurements" USING btree ("user_id","recorded_on");