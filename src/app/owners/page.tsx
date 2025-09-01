// src/app/owners/page.tsx
import { db } from '@/lib/db';
import { leagues, owners, teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import OwnerCard from '@/components/OwnerCard';

export default async function OwnersPage() {
  // Fetch all leagues (or you might want to fetch a specific league)
  const leaguesList = await db.select().from(leagues).limit(1);
  const league = leaguesList[0];

  if (!league) {
    return <div>No league found</div>;
  }

  // Fetch owners for this league
  const ownersList = await db
    .select()
    .from(owners)
    .where(eq(owners.leagueId, league.id));

  // Fetch teams for this league
  const teamsList = await db
    .select()
    .from(teams)
    .where(eq(teams.leagueId, league.id));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{league.name} - Owners</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ownersList.map(owner => {
          const team = teamsList.find(t => t.ownerId === owner.id);
          return (
            <OwnerCard 
              key={owner.id} 
              owner={owner} 
              team={team}
            />
          );
        })}
      </div>
    </div>
  );
}