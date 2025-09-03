// src/app/owners/[ownerId]/page.tsx
import Section from "@/components/Section";
import { getOwnerProfile, OWNER_PROFILES } from "@/data/owners";

type Props = { params: { ownerId: string } };

export function generateStaticParams() {
  return OWNER_PROFILES.map((p) => ({ ownerId: p.ownerId }));
}

export const dynamic = "force-dynamic";

export default function OwnerDetailPage({ params }: Props) {
  const p = getOwnerProfile(params.ownerId);
  if (!p) {
    return (
      <Section title="Owner not found">
        <p className="text-sm text-gray-600">Invalid owner id.</p>
      </Section>
    );
  }
  return (
    <Section title={p.displayName}>
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.photoUrl}
            alt={p.displayName}
            className="h-20 w-20 rounded-full object-cover"
          />
          <div>
            <div className="text-xl font-semibold">{p.displayName}</div>
            <div className="text-sm text-gray-600">{p.teamName}</div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-800">{p.bio}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border p-4">
            <div className="text-gray-500">Championships</div>
            <div className="text-2xl font-semibold">{p.championships}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-gray-500">Favorite NFL Mascot</div>
            <div className="text-2xl font-semibold">{p.favoriteMascot}</div>
          </div>
        </div>
      </div>
    </Section>
  );
}
