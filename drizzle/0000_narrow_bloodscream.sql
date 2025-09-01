CREATE TABLE "leagues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"season_current" integer NOT NULL,
	"espn_league_id" varchar(50),
	"espn_url" text,
	"scoring" varchar(10) DEFAULT 'PPR' NOT NULL,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"league_id" uuid NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"photo_url" text,
	"bio" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"position" varchar(10) NOT NULL,
	"nfl_team" varchar(10),
	"injury_status" varchar(10),
	"is_active" boolean DEFAULT true,
	"espn_player_id" varchar(50),
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rosters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar(10) NOT NULL,
	"player_id" varchar(50) NOT NULL,
	"week" integer NOT NULL,
	"slot" varchar(10) NOT NULL,
	"is_starter" boolean DEFAULT false,
	"projected_points" numeric(5, 1),
	"actual_points" numeric(5, 1),
	"acquisition_type" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"league_id" uuid NOT NULL,
	"owner_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"abbrev" varchar(10),
	"logo_url" text,
	"espn_team_id" integer,
	"current_wins" integer DEFAULT 0,
	"current_losses" integer DEFAULT 0,
	"current_ties" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;