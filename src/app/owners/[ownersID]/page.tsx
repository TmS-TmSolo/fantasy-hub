// src/app/owners/[ownerId]/page.tsx
import { notFound } from "next/navigation";
import { getOwnerProfile } from "@/data/owners";

type Props = {
  params: Promise<{ ownerId: string }>;
};

export default async function OwnerPage({ params }: Props) {
  const { ownerId } = await params;
  const owner = getOwnerProfile(ownerId);

  if (!owner) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {owner.displayName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{owner.displayName}</h1>
                <p className="text-xl opacity-90">{owner.teamName}</p>
                {owner.championships > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-300">
                      {'🏆'.repeat(Math.min(owner.championships, 3))}
                    </span>
                    <span className="text-lg font-semibold">
                      {owner.championships} Championship{owner.championships !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Bio Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Biography</h2>
                <p className="text-gray-700 leading-relaxed">{owner.bio}</p>
              </div>

              {/* Stats Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Championships</span>
                      <span className="font-bold text-gray-900">{owner.championships}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Favorite Player</span>
                      <span className="font-bold text-gray-900">{owner.favoritePlayer}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Favorite Mascot</span>
                      <span className="font-bold text-gray-900">{owner.favoriteMascot}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <a
                href="/owners"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to All Owners
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}