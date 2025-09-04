// src/components/OwnerHoverCard.tsx
"use client";

import React from "react";
import { getOwnerProfile } from "@/data/owners";

export type OwnerHoverCardProps = {
  ownerId: string;
  mousePosition: { x: number; y: number };
  visible: boolean;
};

const OwnerHoverCard: React.FC<OwnerHoverCardProps> = ({ ownerId, mousePosition, visible }) => {
  const owner = getOwnerProfile(ownerId);
  
  if (!visible || !owner) return null;

  const trophies = owner.championships > 0 ? '🏆'.repeat(Math.min(owner.championships, 3)) : '';

  return (
    <div 
      className="fixed z-50 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 pointer-events-none transition-opacity duration-200"
      style={{
        left: mousePosition.x + 10,
        top: mousePosition.y - 100,
        transform: mousePosition.x > window.innerWidth - 350 ? 'translateX(-100%)' : 'none'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
          <img 
            src={owner.photoUrl} 
            alt={owner.displayName}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling!.textContent = owner.displayName.split(' ').map(n => n[0]).join('');
            }}
          />
          <span className="hidden">{owner.displayName.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-lg">{owner.displayName}</h3>
            {owner.championships > 0 && (
              <span className="text-yellow-400 text-sm">{trophies}</span>
            )}
          </div>
          <p className="text-gray-300 text-sm font-medium">{owner.teamName}</p>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <p className="text-gray-300 text-sm leading-relaxed">{owner.bio}</p>
        
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Favorite Player</p>
            <p className="text-white text-sm font-medium">{owner.favoritePlayer}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Mascot</p>
            <p className="text-white text-sm font-medium">{owner.favoriteMascot}</p>
          </div>
        </div>
        
        {owner.championships > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-yellow-400 text-sm font-semibold">
              {owner.championships} Championship{owner.championships !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerHoverCard;