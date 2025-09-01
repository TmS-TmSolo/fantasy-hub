// src/components/OwnerCard.tsx
import Image from 'next/image';

interface OwnerCardProps {
  owner: {
    id: string;
    displayName: string;
    email: string | null;
    photoUrl: string | null;
    bio: string | null;
  };
  team?: {
    id: string;
    name: string;
    abbrev: string | null;
    logoUrl: string | null;
    currentWins: number | null;
    currentLosses: number | null;
    currentTies: number | null;
  };
}

export default function OwnerCard({ owner, team }: OwnerCardProps) {
  const record = team 
    ? `${team.currentWins || 0}-${team.currentLosses || 0}${team.currentTies ? `-${team.currentTies}` : ''}`
    : 'No team';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        {owner.photoUrl ? (
          <Image
            src={owner.photoUrl}
            alt={owner.displayName}
            width={64}
            height={64}
            className="rounded-full mr-4"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-600">
              {owner.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{owner.displayName}</h3>
          {owner.email && (
            <p className="text-sm text-gray-600">{owner.email}</p>
          )}
        </div>
      </div>

      {team && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{team.name}</h4>
            {team.abbrev && (
              <span className="text-sm text-gray-500">{team.abbrev}</span>
            )}
          </div>
          <p className="text-sm font-medium">Record: {record}</p>
        </div>
      )}

      {owner.bio && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-700">{owner.bio}</p>
        </div>
      )}
    </div>
  );
}