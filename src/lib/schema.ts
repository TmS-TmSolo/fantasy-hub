// src/lib/schema.ts
import { pgTable, uuid, varchar, integer, boolean, timestamp, text, decimal } from 'drizzle-orm/pg-core';

export const leagues = pgTable('leagues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  seasonCurrent: integer('season_current').notNull(),
  espnLeagueId: varchar('espn_league_id', { length: 50 }),
  espnUrl: text('espn_url'),
  scoring: varchar('scoring', { length: 10 }).notNull().default('PPR'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const owners = pgTable('owners', {
  id: varchar('id', { length: 50 }).primaryKey(),
  leagueId: uuid('league_id').references(() => leagues.id).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teams = pgTable('teams', {
  id: varchar('id', { length: 10 }).primaryKey(),
  leagueId: uuid('league_id').references(() => leagues.id).notNull(),
  ownerId: varchar('owner_id', { length: 50 }).references(() => owners.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  abbrev: varchar('abbrev', { length: 10 }),
  logoUrl: text('logo_url'),
  espnTeamId: integer('espn_team_id'),
  currentWins: integer('current_wins').default(0),
  currentLosses: integer('current_losses').default(0),
  currentTies: integer('current_ties').default(0),
  pointsFor: decimal('points_for', { precision: 10, scale: 2 }).default('0'),
  pointsAgainst: decimal('points_against', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const players = pgTable('players', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  position: varchar('position', { length: 10 }).notNull(),
  nflTeam: varchar('nfl_team', { length: 10 }),
  injuryStatus: varchar('injury_status', { length: 10 }),
  isActive: boolean('is_active').default(true),
  espnPlayerId: varchar('espn_player_id', { length: 50 }),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const rosters = pgTable('rosters', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: varchar('team_id', { length: 10 }).references(() => teams.id).notNull(),
  playerId: varchar('player_id', { length: 50 }).references(() => players.id).notNull(),
  week: integer('week').notNull(),
  slot: varchar('slot', { length: 10 }).notNull(),
  isStarter: boolean('is_starter').default(false),
  projectedPoints: decimal('projected_points', { precision: 5, scale: 1 }),
  actualPoints: decimal('actual_points', { precision: 5, scale: 1 }),
  acquisitionType: varchar('acquisition_type', { length: 20 }),
});