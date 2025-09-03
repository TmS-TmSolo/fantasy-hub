// src/data/owners.ts
import { league } from "@/data/league";

export type OwnerProfile = {
  ownerId: string;          // matches league.owners[].id
  displayName: string;      // from league
  teamName: string;         // from league.teams[].name
  photoUrl: string;         // /owners/<ownerId>.jpg
  bio: string;              // <= 3 sentences
  championships: number;
  favoritePlayer: string;
  favoriteMascot: string; // owner's favorite NFL mascot
};

// helper: map ownerId -> teamName
const teamNameByOwnerId = new Map(
  league.teams.map(t => [t.ownerId, t.name] as const)
);

// Only include owners who have a team (12)
export const OWNER_PROFILES: OwnerProfile[] = league.owners
  .filter(o => teamNameByOwnerId.has(o.id))
  .map(o => ({
    ownerId: o.id,
    displayName: o.displayName,
    teamName: teamNameByOwnerId.get(o.id)!,
    photoUrl: `/owners/${o.id}.jpg`,
    bio: bioFor(o.id),
    championships: champsFor(o.id),
    favoritePlayer: favFor(o.id),
    favoriteMascot: mascotFor(o.id),
  }));

// Lookups (edit as you get real data)
function bioFor(id: string): string {
  switch (id) {
    case "matt_young":
      return "Plays the wire like chess. Drafts floor, trades for ceiling. Lives for Monday night sweats.";
    case "brennen_hall":
      return "Finds value in chaos. Loves rookies and revenge games. Tracks snap counts like a CPA.";
    case "michael_vlahovich":
      return "Tape-first, spreadsheets-second. Streams defenses with spooky accuracy. Never misses waivers.";
    case "cole_bixenman":
      return "Psychological warfare in the group chat. Trades early and often. Always a week ahead on trends.";
    case "matthew_hart":
      return "Builds bully-ball rosters. Trusts volume over vibes. Known to manifest TDs by sheer will.";
    case "rob_thomas":
      return "Veteran of bye-week gymnastics. Values target share and schemes. Quietly stacks wins.";
    case "thomas_young":
      return "Boom-bust connoisseur. Loves rookie breakouts. Sets traps with Sunday morning pivots.";
    case "davis_johnson":
      return "Plays the long game. Prioritizes playoff strength. Tracks weather and trench matchups.";
    case "brad_carter":
      return "Numbers-first decision maker. Lives in the red zone stats. Calm under tilt pressure.";
    case "troy_scott":
      return "Aggressive trader. Calls breakout weeks before models do. Momentum over reputation.";
    case "brady_kincannon":
      return "Master of value tiers. Finds edges in usage trends. Never afraid to bench a name brand.";
    case "andy_fox":
      return "Adaptable strategist. Reads coach quotes like tea leaves. Turns waiver scraps into starters.";
    default:
      return "Owner profile to be updated. Competitor, tinkerer, and certified primetime tilts enjoyer.";
  }
}

function champsFor(id: string): number {
  switch (id) {
    case "cole_bixenman": return 0;
    case "rob_thomas": return 2;
    case "brady_kincannon": return 0;
    case "matt_young": return 0;
    case "brennen_hall": return 1;
    case "michael_vlahovich": return 1;
    case "matthew_hart": return 4;
    case "thomas_young": return 0;
    case "davis_johnson": return 0;
    case "brad_carter": return 0;
    case "troy_scott": return 2;
    case "andy_fox": return 1;
    default: return 0;
  }
}

function favFor(id: string): string {
  switch (id) {
    case "matt_young": return "Justin Jefferson";
    case "brennen_hall": return "Patrick Mahomes";
    case "michael_vlahovich": return "Amon-Ra St. Brown";
    case "cole_bixenman": return "Christian McCaffrey";
    case "matthew_hart": return "Ja'Marr Chase";
    case "rob_thomas": return "Travis Kelce";
    case "thomas_young": return "Derrick Henry";
    case "davis_johnson": return "Justin Herbert";
    case "brad_carter": return "Josh Allen";
    case "troy_scott": return "Tyreek Hill";
    case "brady_kincannon": return "Josh Allen";
    case "andy_fox": return "Saquon Barkley";
    default: return "Tom Brady";
  }
}

function mascotFor(id: string): string {
  // fun, simple picks; edit anytime
  switch (id) {
    case "matt_young": return "Vikings Skol Viking";
    case "brennen_hall": return "Chiefs KC Wolf";
    case "michael_vlahovich": return "Lions Roary";
    case "cole_bixenman": return "49ers Sourdough Sam";
    case "matthew_hart": return "Bengals Who Dey";
    case "rob_thomas": return "Chiefs KC Wolf";
    case "thomas_young": return "Sir Purr";
    case "davis_johnson": return "Vikings Skol";
    case "brad_carter": return "Bills Billy Buffalo";
    case "troy_scott": return "Dolphins T.D.";
    case "brady_kincannon": return "Bills Billy Buffalo";
    case "andy_fox": return "Giants Victor";
    default: return "The Goat";
  }
}

// convenience getters
export const getOwnerProfile = (ownerId: string) =>
  OWNER_PROFILES.find(p => p.ownerId === ownerId) ?? null;
