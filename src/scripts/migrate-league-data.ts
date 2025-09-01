// Create src/scripts/migrate-league-data.ts
import { db } from '@/lib/db';
import { leagues, owners, teams } from '@/lib/schema';
import { league } from '@/data/league';

export async function migrateLeagueData() {
  // 1. Insert league
  const [newLeague] = await db.insert(leagues).values({
    name: league.meta.name,
    seasonCurrent: league.meta.espn.seasonId,
    espnLeagueId: league.meta.espn.leagueId,
    espnUrl: league.meta.espn.url,
    scoring: league.meta.scoring,
    isPublic: true,
  }).returning();

  // 2. Insert owners
  await db.insert(owners).values(
    league.owners.map(owner => ({
      id: owner.id,
      leagueId: newLeague.id,
      displayName: owner.displayName,
      // Add email, photo, bio later
    }))
  );

  // 3. Insert teams
  await db.insert(teams).values(
    league.teams.map(team => ({
      id: team.id,
      leagueId: newLeague.id,
      ownerId: team.ownerId,
      name: team.name,
      abbrev: team.abbrev,
      logoUrl: team.logoUrl,
      // espnTeamId will be populated from ESPN sync
    }))
  );

  console.log('✅ League data migrated successfully!');
}