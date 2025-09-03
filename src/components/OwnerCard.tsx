// src/components/OwnerCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { type OwnerProfile } from "@/data/owners";

export type OwnerCardProps = { profile: OwnerProfile };

const OwnerCard: React.FC<OwnerCardProps> = ({ profile }) => {
  return (
    <div className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md focus-within:shadow-md">
      <div className="relative overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photoUrl}
          alt={profile.displayName}
          className="h-40 w-full object-cover transition duration-300 group-hover:scale-105 group-focus-within:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 translate-y-2">
          <Link
            href={`/owners/${profile.ownerId}`}
            className="flex-1 rounded-lg bg-white/90 px-3 py-1.5 text-center text-xs font-semibold shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            View profile
          </Link>
          <span
            title={`Fav Mascot: ${profile.favoriteMascot}`}
            className="select-none rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold shadow"
          >
            🐾 {profile.favoriteMascot}
          </span>
        </div>
        <div className="absolute left-2 top-2 flex gap-2">
          <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold shadow">
            {profile.teamName}
          </span>
          <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold shadow">
            {profile.championships}x Champ
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm font-semibold">{profile.displayName}</div>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-800">
          {profile.bio}
        </p>
      </div>

      <Link
        href={`/owners/${profile.ownerId}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20"
      >
        Open
      </Link>
    </div>
  );
};

export default OwnerCard;
