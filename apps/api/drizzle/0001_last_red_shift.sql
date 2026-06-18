CREATE TABLE "exercise_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"reps" integer NOT NULL,
	"load_weight" double precision,
	"load_unit" text,
	"notes" text,
	CONSTRAINT "exercise_sets_reps_positive" CHECK ("exercise_sets"."reps" >= 1),
	CONSTRAINT "exercise_sets_load_unit_valid" CHECK ("exercise_sets"."load_unit" is null or "exercise_sets"."load_unit" in ('kg', 'lb'))
);
--> statement-breakpoint
CREATE TABLE "workout_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_name" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "workouts_status_valid" CHECK ("workouts"."status" in ('draft', 'active', 'completed'))
);
--> statement-breakpoint
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_item_id_workout_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."workout_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_items" ADD CONSTRAINT "workout_items_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercise_sets_item_idx" ON "exercise_sets" USING btree ("item_id","position");--> statement-breakpoint
CREATE INDEX "workout_items_workout_idx" ON "workout_items" USING btree ("workout_id","position");--> statement-breakpoint
CREATE INDEX "workouts_user_created_idx" ON "workouts" USING btree ("user_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);