// src/lib/schema.ts
import {
  pgTable, uuid, varchar, integer, boolean, timestamp, text, decimal,
  index, uniqueIndex
} from 'drizzle-orm/pg-core';

/** leagues */
export const leagues = pgTable('leagues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  seasonCurrent: integer('season_current').notNull(),
  espnLeagueId: varchar('espn_league_id', { length: 50 }),
  espnUrl: text('espn_url'),
  scoring: varchar('scoring', { length: 10 }).notNull().default('PPR'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

/** owners */
export const owners = pgTable('owners', {
  id: varchar('id', { length: 50 }).primaryKey(),
  leagueId: uuid('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  ownersLeagueIdx: index('idx_owners_league_id').on(t.leagueId),
}));

/** teams */
export const teams = pgTable('teams', {
  id: varchar('id', { length: 10 }).primaryKey(),
  leagueId: uuid('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
  ownerId: varchar('owner_id', { length: 50 }).references(() => owners.id, { onDelete: 'restrict' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  abbrev: varchar('abbrev', { length: 10 }),
  logoUrl: text('logo_url'),
  espnTeamId: integer('espn_team_id'),
  currentWins: integer('current_wins').default(0),
  currentLosses: integer('current_losses').default(0),
  currentTies: integer('current_ties').default(0),
  pointsFor: decimal('points_for', { precision: 10, scale: 2 }).default('0'),
  pointsAgainst: decimal('points_against', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  teamsLeagueIdx: index('idx_teams_league_id').on(t.leagueId),
  teamsOwnerIdx: index('idx_teams_owner_id').on(t.ownerId),
  teamsUniqueLeagueAbbrev: uniqueIndex('ux_teams_league_abbrev').on(t.leagueId, t.abbrev),
}));

/** players */
export const players = pgTable('players', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  position: varchar('position', { length: 10 }).notNull(),
  nflTeam: varchar('nfl_team', { length: 10 }),
  injuryStatus: varchar('injury_status', { length: 10 }),
  isActive: boolean('is_active').default(true),
  espnPlayerId: varchar('espn_player_id', { length: 50 }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
});

/** rosters */
export const rosters = pgTable('rosters', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: varchar('team_id', { length: 10 }).references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  playerId: varchar('player_id', { length: 50 }).references(() => players.id, { onDelete: 'restrict' }).notNull(),
  week: integer('week').notNull(),
  slot: varchar('slot', { length: 10 }).notNull(),
  isStarter: boolean('is_starter').default(false),
  projectedPoints: decimal('projected_points', { precision: 5, scale: 1 }),
  actualPoints: decimal('actual_points', { precision: 5, scale: 1 }),
  acquisitionType: varchar('acquisition_type', { length: 20 }),
}, (t) => ({
  rostersTeamIdx: index('idx_rosters_team_id').on(t.teamId),
  rostersPlayerIdx: index('idx_rosters_player_id').on(t.playerId),
  rostersWeekIdx: index('idx_rosters_week').on(t.week),
  rostersUnique: uniqueIndex('ux_rosters_team_week_player_slot').on(t.teamId, t.week, t.playerId, t.slot),
}));

/** videos (used by uploads/grid) */
export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
