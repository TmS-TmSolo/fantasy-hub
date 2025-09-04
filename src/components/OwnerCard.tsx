// src/components/OwnerCard.tsx
"use client";

import React from "react";
import { type OwnerProfile } from "@/data/owners";

export type OwnerCardProps = { profile: OwnerProfile };

const OwnerCard: React.FC<OwnerCardProps> = ({ profile }) => {
  const trophyText = profile.championships > 0 ? `${profile.championships}x Champ` : 'No Titles';
  
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 focus-within:shadow-lg">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={profile.photoUrl}
          alt={profile.displayName}
          className="h-40 w-full object-cover transition duration-300 group-hover:scale-105 group-focus-within:scale-105"
          onError={(e) => {
            // Fallback to placeholder if image fails
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=3b82f6&color=fff&size=160`;
          }}
        />
        
        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        
        {/* Action buttons on hover */}
        <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 translate-y-2">
          <a
            href={`/owners/${profile.ownerId}`}
            className="flex-1 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-center text-xs font-semibold text-gray-900 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
          >
            View Profile
          </a>
          <span
            title={`Favorite Mascot: ${profile.favoriteMascot}`}
            className="select-none rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-gray-900 shadow"
          >
            {profile.favoriteMascot}
          </span>
        </div>
        
        {/* Top badges */}
        <div className="absolute left-2 top-2 flex gap-2">
          <span className="rounded-md bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-gray-900 shadow">
            {profile.teamName}
          </span>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold shadow ${
            profile.championships > 0 
              ? 'bg-yellow-400/90 text-yellow-900' 
              : 'bg-gray-400/90 text-gray-900'
          }`}>
            {trophyText}
          </span>
        </div>

        {/* Championship indicator */}
        {profile.championships > 0 && (
          <div className="absolute right-2 top-2">
            <span className="text-lg" title={`${profile.championships} Championships`}>
              {'🏆'.repeat(Math.min(profile.championships, 3))}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-sm font-semibold text-gray-900">{profile.displayName}</div>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600">
          {profile.bio}
        </p>
      </div>

      {/* Favorite player section */}
      <div className="mt-3 rounded-lg bg-gray-50 p-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          Favorite Player
        </div>
        <div className="text-sm font-medium text-gray-900">
          {profile.favoritePlayer}
        </div>
      </div>

      {/* Favorite Mascot Section */}
      <div className="mt-3 rounded-lg bg-gray-50 p-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          Favorite Mascot
        </div>
        <div className="text-sm font-medium text-gray-900">
          {profile.favoriteMascot}
        </div>
      </div>

      <a
        href={`/owners/${profile.ownerId}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        View Full Profile
      </a>
    </div>
  );
};

export default OwnerCard;