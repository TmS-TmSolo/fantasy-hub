// src/components/OwnerHoverCard.tsx
"use client";

import React from "react";
import { getOwnerProfile } from "@/data/owners";

type Props = { ownerId: string; x: number; y: number };

export default function OwnerHoverCard({ ownerId, x, y }: Props) {
  const p = getOwnerProfile(ownerId);
  if (!p) return null;

  return (
    <div
      className="owner-hover-card z-[120] w-72 rounded-2xl border bg-white p-4 shadow-xl"
      style={{ ["--x" as any]: `${x + 12}px`, ["--y" as any]: `${y + 12}px` }}
      role="dialog"
      aria-label={`${p.displayName} profile`}
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.photoUrl} alt={p.displayName} className="h-12 w-12 rounded-full object-cover" />
        <div>
          <div className="text-sm font-semibold">{p.displayName}</div>
          <div className="text-xs text-gray-600">{p.teamName}</div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-800">{p.bio}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border p-2">
          <div className="text-gray-500">Championships</div>
          <div className="text-base font-semibold">{p.championships}</div>
        </div>
        <div className="rounded-lg border p-2">
          <div className="text-gray-500">Favorite NFL Mascot</div>
          <div className="text-base font-semibold">{p.favoriteMascot}</div>
        </div>
      </div>
    </div>
  );
}
