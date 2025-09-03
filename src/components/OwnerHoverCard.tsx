// src/components/OwnerHoverCard.tsx
"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { getOwnerProfile } from "@/data/owners";

export type OwnerHoverCardProps = {
  ownerId: string;
  open: boolean;
  onClose: () => void;
};

const OwnerHoverCard: React.FC<OwnerHoverCardProps> = ({ ownerId, open, onClose }) => {
  const p = getOwnerProfile(ownerId);
  if (!open || !p) return null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${p.displayName} profile`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.photoUrl} alt={p.displayName} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <div className="text-sm font-semibold">{p.displayName}</div>
            <div className="text-xs text-gray-600">{p.teamName}</div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-800">{p.bio}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3">
            <div className="text-gray-500">Championships</div>
            <div className="text-lg font-semibold">{p.championships}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-gray-500">Favorite NFL Mascot</div>
            <div className="text-lg font-semibold">{p.favoriteMascot}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default OwnerHoverCard;
