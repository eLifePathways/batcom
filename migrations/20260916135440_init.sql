CREATE TYPE "public"."evidence_infection" AS ENUM('infectionHigh', 'infectionModerate', 'infectionLow', 'infectionNot_Investigated');--> statement-breakpoint
CREATE TYPE "public"."evidence_spillover" AS ENUM('spilloverHigh', 'spilloverModerate', 'spilloverLow', 'spilloverNot_Investigated');--> statement-breakpoint
CREATE TYPE "public"."geographic_region" AS ENUM('africa', 'americas', 'eastern_mediterranean', 'europe', 'southeast_asia', 'western_pacific');--> statement-breakpoint
CREATE TABLE "background_papers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"virus_category_id" integer NOT NULL,
	"link" text,
	"image_url" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "hero_section_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "hero_section_settings_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "issue_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"author" text DEFAULT 'Admin',
	"is_internal" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"screenshot_url" text,
	"console_log" text,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"page_url" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"browser_info" json
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"session_id" text NOT NULL,
	"referrer" text,
	"device_type" text NOT NULL,
	"country" text,
	"region" text,
	"bounced" boolean DEFAULT true,
	"time_on_page" integer,
	"is_exit" boolean DEFAULT true,
	"scroll_depth" integer
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" serial PRIMARY KEY NOT NULL,
	"kotahi_manuscript_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"authors" text NOT NULL,
	"year" integer NOT NULL,
	"abstract" text NOT NULL,
	"evidence_infection" "evidence_infection" NOT NULL,
	"evidence_spillover" "evidence_spillover" NOT NULL,
	"virus_category_ids" integer[] NOT NULL,
	"regions" "geographic_region"[] NOT NULL,
	"publication_date" date NOT NULL,
	"link" text
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"publication_id" integer NOT NULL,
	"users" jsonb NOT NULL,
	"json_data" jsonb NOT NULL,
	"is_decision" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"device_type" text NOT NULL,
	"browser" text,
	"os" text,
	"country" text,
	"region" text,
	"source" text,
	"source_detail" text,
	"total_page_views" integer DEFAULT 1,
	"duration" integer,
	"is_new_visitor" boolean DEFAULT true,
	"entry_page" text NOT NULL,
	"exit_page" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"purpose" text NOT NULL,
	"form_data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"institution" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"email" text,
	"website" text,
	"social_media" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "virus_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "what_we_do_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"title" text,
	"content_type" text NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "what_we_do_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"image_url" text,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "what_we_do_sections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "issues_status_idx" ON "issues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "issues_priority_idx" ON "issues" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "issues_date_idx" ON "issues" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "page_views_path_idx" ON "page_views" USING btree ("path");--> statement-breakpoint
CREATE INDEX "page_views_session_idx" ON "page_views" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "page_views_date_idx" ON "page_views" USING btree ("visited_at");--> statement-breakpoint
CREATE INDEX "sessions_date_idx" ON "sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "sessions_source_idx" ON "sessions" USING btree ("source");