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
      return "Ex-band frontman and ex-commish. Collects helmets and waiver steals. Lives for Monday night sweats.";
    case "brennen_hall":
      return "Chat mind-games savant. Backyard chicken GM. Schedules kids’ carpools between waiver claims.";
    case "michael_vlahovich":
      return "Girl-dad of three and film grinder. Streams defenses with spooky accuracy. Calm when everyone else tilts.";
    case "cole_bixenman":
      return "Declares rebuild by Week 2. Talks himself into and out of trades hourly. Deadly when the projections disrespect him.";
    case "matthew_hart":
      return "Lawyered four-peat. Bully-ball lineups, volume truth. Knows the rulebook and the loopholes.";
    case "rob_thomas":
      return "Bye-week gymnast. Targets and route-rate guy. Quiet 120 every Sunday.";
    case "thomas_young":
      return "Boom-bust artiste. Files weekly grievances against kickers and backup RB's.";
    case "davis_johnson":
      return "Variance enjoyer. Drafts vibes, stumbles into Ws. Refuses to roster a DEF until 12:59.";
    case "brad_carter":
      return "Folk hero. Trades like a tropical storm. Party bus energy, box-score luck not included.";
    case "troy_scott":
      return "Reigning champ. Claims the website adds +10 morale. Manifests late-game comeback wins.";
    case "brady_kincannon":
      return "Perennial trade champ. Turns bench depth into starter juice. Three offers before brunch.";
    case "andy_fox":
      return "Scheme whisperer. Waiver scraps into flex gold. Treats coach quotes like a dataset.";
    default:
      return "Owner profile to be updated. Competitor, tinkerer, and certified primetime tilts enjoyer.";
  }
}

function champsFor(id: string): number {
  switch (id) {
    case "cole_bixenman": return 0;
    case "rob_thomas": return 2;
    case "brady_kincannon": return 0;
    case "matt_young": return 1;
    case "brennen_hall": return 1;
    case "michael_vlahovich": return 1;
    case "matthew_hart": return 5;
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
    case "matt_young": return "CMC/Shawn Alexander";
    case "brennen_hall": return "Bijan Robinson";
    case "michael_vlahovich": return "Antonio Brown";
    case "cole_bixenman": return "Joe Burrow";
    case "matthew_hart": return "Justin Jefferson/Lawyer Milloy";
    case "rob_thomas": return "Gardner Minshew";
    case "thomas_young": return "Derrick Henry";
    case "davis_johnson": return "Robbie Cumshot Anderson";
    case "brad_carter": return "Josh Allen";
    case "troy_scott": return "Bill Croskey";
    case "brady_kincannon": return "Rome Odunze";
    case "andy_fox": return "Baker Mayfield";
    default: return "Tom Brady";
  }
}

function mascotFor(id: string): string {
  // fun, simple picks; edit anytime
  switch (id) {
    case "matt_young": return "Sourdough Sam";
    case "brennen_hall": return "Pat the Patriot";
    case "michael_vlahovich": return "Dolphins T.D. the Flipper";
    case "cole_bixenman": return "Blitz";
    case "matthew_hart": return "Major Tuddy!";
    case "rob_thomas": return "Saints Gumbo the Dog";
    case "thomas_young": return "Sir Purr";
    case "davis_johnson": return "Vikings Skol";
    case "brad_carter": return "Bills Billy Buffalo";
    case "troy_scott": return "Swagger and Swagger Jr and Swagger III, Go Browns Go";
    case "brady_kincannon": return "Seahawks Blitz";
    case "andy_fox": return "Blitz Baby";
    default: return "The Goat";
  }
}

// convenience getters
export const getOwnerProfile = (ownerId: string) =>
  OWNER_PROFILES.find(p => p.ownerId === ownerId) ?? null;
