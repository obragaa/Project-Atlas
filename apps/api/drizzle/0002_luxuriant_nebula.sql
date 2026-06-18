CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"primary_muscle" text NOT NULL,
	"muscles" text[] DEFAULT '{}' NOT NULL,
	"equipment" text NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"tips" text[] DEFAULT '{}' NOT NULL,
	"variations" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "exercises_primary_muscle_valid" CHECK ("exercises"."primary_muscle" in ('chest','back','shoulders','biceps','triceps','legs','glutes','core','fullBody')),
	CONSTRAINT "exercises_equipment_valid" CHECK ("exercises"."equipment" in ('barbell','dumbbell','machine','bodyweight','cable','other'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "exercises_slug_key" ON "exercises" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "exercises_name_lower_idx" ON "exercises" USING btree (lower("name"));