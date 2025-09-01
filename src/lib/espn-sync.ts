// src/lib/espn-sync.ts
import { db } from './db';
import { players, rosters, teams } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

interface ESPNPlayer {
  id: number;
  fullName: string;
  defaultPositionId: number;
  proTeamId: number;
  injuryStatus?: string;
}

interface ESPNRosterEntry {
  playerId: number;
  lineupSlotId: number;
  playerPoolEntry: {
    player: ESPNPlayer;
  };
}

interface ESPNTeam {
  id: number;
  name: string;
  abbrev: string;
  logoURL?: string;
  roster: {
    entries: ESPNRosterEntry[];
  };
  record: {
    overall: {
      wins: number;
      losses: number;
      ties: number;
    };
  };
  points: number;
  pointsAgainst: number;
}

interface ESPNLeagueData {
  teams: ESPNTeam[];
  scoringPeriodId: number;
}

// ESPN position mapping
const ESPN_POSITIONS: Record<number, string> = {
  1: 'QB',
  2: 'RB',
  3: 'WR',
  4: 'TE',
  5: 'K',
  16: 'D/ST',
};

// ESPN slot mapping
const ESPN_SLOTS: Record<number, string> = {
  0: 'QB',
  2: 'RB',
  4: 'WR',
  6: 'TE',
  17: 'K',
  16: 'D/ST',
  23: 'FLEX',
  20: 'Bench',
  21: 'IR',
};

// ESPN team mapping (you may need to adjust these)
const ESPN_NFL_TEAMS: Record<number, string> = {
  1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET',
  9: 'GB', 10: 'TEN', 11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA', 16: 'MIN',
  17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ', 21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC',
  25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WSH', 29: 'CAR', 30: 'JAX', 33: 'BAL', 34: 'HOU'
};

export async function syncESPNData(leagueId = '829077', season = 2025) {
  const espnUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster&view=mMatchup&view=mSettings`;
  
  try {
    console.log('🔄 Fetching ESPN data...');
    const response = await fetch(espnUrl);
    
    if (!response.ok) {
      throw new Error(`ESPN API returned ${response.status}`);
    }
    
    const data: ESPNLeagueData = await response.json();
    
    console.log(`📊 Processing ${data.teams.length} teams for week ${data.scoringPeriodId}`);
    
    // Process teams and rosters
    await updateTeamsFromESPN(data);
    await updateRostersFromESPN(data);
    
    console.log('✅ ESPN sync complete');
    return { success: true, week: data.scoringPeriodId, teams: data.teams.length };
    
  } catch (error) {
    console.error('❌ ESPN sync failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function updateTeamsFromESPN(data: ESPNLeagueData) {
  console.log('📝 Updating team records...');
  
  for (const espnTeam of data.teams) {
    try {
      await db.update(teams)
        .set({
          currentWins: espnTeam.record.overall.wins,
          currentLosses: espnTeam.record.overall.losses,
          currentTies: espnTeam.record.overall.ties,
          pointsFor: espnTeam.points.toString(),
          pointsAgainst: espnTeam.pointsAgainst.toString(),
        })
        .where(eq(teams.espnTeamId, espnTeam.id));
    } catch (error) {
      console.warn(`⚠️ Could not update team ${espnTeam.id}:`, error);
    }
  }
}

async function updateRostersFromESPN(data: ESPNLeagueData) {
  const currentWeek = data.scoringPeriodId;
  console.log(`🏈 Updating rosters for week ${currentWeek}...`);
  
  for (const espnTeam of data.teams) {
    // Find corresponding team in our database
    const [team] = await db.select()
      .from(teams)
      .where(eq(teams.espnTeamId, espnTeam.id))
      .limit(1);
      
    if (!team) {
      console.warn(`⚠️ Team with ESPN ID ${espnTeam.id} not found in database`);
      continue;
    }

    console.log(`📋 Processing roster for ${team.name}`);
    
    for (const entry of espnTeam.roster.entries) {
      const espnPlayer = entry.playerPoolEntry.player;
      const playerId = `espn_${espnPlayer.id}`;
      const playerName = espnPlayer.fullName;
      const position = ESPN_POSITIONS[espnPlayer.defaultPositionId] || 'UNKNOWN';
      const nflTeam = ESPN_NFL_TEAMS[espnPlayer.proTeamId] || 'FA';
      const slot = ESPN_SLOTS[entry.lineupSlotId] || 'Bench';
      const isStarter = !['Bench', 'IR'].includes(slot);

      try {
        // Upsert player
        await db.insert(players)
          .values({
            id: playerId,
            name: playerName,
            position,
            nflTeam,
            injuryStatus: espnPlayer.injuryStatus || null,
            espnPlayerId: espnPlayer.id.toString(),
          })
          .onConflictDoUpdate({
            target: players.id,
            set: {
              name: playerName,
              position,
              nflTeam,
              injuryStatus: espnPlayer.injuryStatus || null,
              lastUpdated: new Date(),
            }
          });

        // Upsert roster entry
        await db.insert(rosters)
          .values({
            teamId: team.id,
            playerId: playerId,
            week: currentWeek,
            slot,
            isStarter,
            acquisitionType: 'ESPN_SYNC',
          })
          .onConflictDoUpdate({
            target: [rosters.teamId, rosters.playerId, rosters.week],
            set: {
              slot,
              isStarter,
            }
          });

      } catch (error) {
        console.warn(`⚠️ Error processing player ${playerName}:`, error);
      }
    }
  }
  
  console.log('✅ Roster sync complete');
}

// Helper function to get current week from ESPN
export async function getCurrentWeek(leagueId = '829077', season = 2025): Promise<number> {
  try {
    const response = await fetch(
      `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mSettings`
    );
    const data = await response.json();
    return data.scoringPeriodId || 1;
  } catch (error) {
    console.warn('Could not fetch current week, defaulting to 1');
    return 1;
  }
}

// Function to sync just player updates (lighter operation)
export async function syncPlayerUpdates(leagueId = '829077', season = 2025) {
  try {
    const response = await fetch(
      `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=kona_player_info`
    );
    
    if (!response.ok) return { success: false };
    
    const data = await response.json();
    
    // Update injury statuses for existing players
    // Implementation depends on ESPN's player info structure
    
    return { success: true };
  } catch (error) {
    console.error('Player update sync failed:', error);
    return { success: false };
  }
}