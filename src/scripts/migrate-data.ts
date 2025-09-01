import { db } from '../lib/db';
import { leagues, owners, teams, players, rosters } from '@/lib/schema';
import { league } from '@/data/league';
import { rosters as rosterData } from '@/data/rosters';

// Define types for better type safety
interface PlayerData {
  id: string;
  name: string;
  position: string;
  nflTeam: string | null;
  injuryStatus: string | null;
  isActive: boolean;
}

interface RosterEntry {
  teamId: string;
  playerId: string;
  week: number;
  slot: string;
  isStarter: boolean;
  acquisitionType: string | null;
}

export async function migrateAllData() {
  console.log('🚀 Starting data migration...');
  
  // 1. Insert league
  const [newLeague] = await db.insert(leagues).values({
    name: league.meta.name,
    seasonCurrent: league.meta.espn.seasonId,
    espnLeagueId: league.meta.espn.leagueId,
    espnUrl: league.meta.espn.url,
    scoring: league.meta.scoring,
    isPublic: true,
  }).returning();

  console.log('✅ League created:', newLeague.name);

  // 2. Insert owners
  await db.insert(owners).values(
    league.owners.map(owner => ({
      id: owner.id,
      leagueId: newLeague.id,
      displayName: owner.displayName,
    }))
  );

  console.log('✅ Owners migrated:', league.owners.length);

  // 3. Insert teams
  await db.insert(teams).values(
    league.teams.map(team => ({
      id: team.id,
      leagueId: newLeague.id,
      ownerId: team.ownerId,
      name: team.name,
      abbrev: team.abbrev,
    }))
  );

  console.log('✅ Teams migrated:', league.teams.length);

  // 4. Extract and insert unique players from roster data
  const uniquePlayers = new Map<string, PlayerData>();
  
  Object.entries(rosterData).forEach(([teamId, roster]) => {
    roster.forEach((entry: any) => {
      if (!uniquePlayers.has(entry.name)) {
        uniquePlayers.set(entry.name, {
          id: entry.name.toLowerCase().replace(/\s+/g, '_'),
          name: entry.name,
          position: entry.pos || 'UNKNOWN',
          nflTeam: entry.nflTeam,
          injuryStatus: entry.status,
          isActive: entry.status !== 'IR',
        });
      }
    });
  });

  await db.insert(players).values(Array.from(uniquePlayers.values()));
  console.log('✅ Players migrated:', uniquePlayers.size);

  // 5. Insert roster entries - Fixed with proper type
  const rosterEntries: RosterEntry[] = [];
  
  Object.entries(rosterData).forEach(([teamId, roster]) => {
    roster.forEach((entry: any) => {
      rosterEntries.push({
        teamId,
        playerId: entry.name.toLowerCase().replace(/\s+/g, '_'),
        week: 1, // Current week
        slot: entry.slot,
        isStarter: !['Bench', 'IR'].includes(entry.slot),
        acquisitionType: entry.acq,
      });
    });
  });

  await db.insert(rosters).values(rosterEntries);
  console.log('✅ Roster entries migrated:', rosterEntries.length);

  console.log('🎉 Migration complete!');
}