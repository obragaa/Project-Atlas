CREATE TABLE "performed_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"reps" integer NOT NULL,
	"load_weight" double precision,
	"load_unit" text,
	"completed" boolean DEFAULT true NOT NULL,
	"rpe" smallint,
	"notes" text,
	CONSTRAINT "performed_sets_reps_positive" CHECK ("performed_sets"."reps" >= 1),
	CONSTRAINT "performed_sets_load_unit_valid" CHECK ("performed_sets"."load_unit" is null or "performed_sets"."load_unit" in ('kg', 'lb')),
	CONSTRAINT "performed_sets_rpe_range" CHECK ("performed_sets"."rpe" is null or "performed_sets"."rpe" between 1 and 10)
);
--> statement-breakpoint
CREATE TABLE "session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_name" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_workout_id" uuid,
	"title" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"performed_on" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "workout_sessions_status_valid" CHECK ("workout_sessions"."status" in ('in_progress', 'completed'))
);
--> statement-breakpoint
ALTER TABLE "performed_sets" ADD CONSTRAINT "performed_sets_exercise_id_session_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."session_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "performed_sets_exercise_idx" ON "performed_sets" USING btree ("exercise_id","position");--> statement-breakpoint
CREATE INDEX "session_exercises_session_idx" ON "session_exercises" USING btree ("session_id","position");--> statement-breakpoint
CREATE INDEX "workout_sessions_user_performed_idx" ON "workout_sessions" USING btree ("user_id","performed_on" DESC NULLS LAST,"id" DESC NULLS LAST);