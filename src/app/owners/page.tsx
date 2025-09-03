// src/app/owners/page.tsx
import Section from "@/components/Section";
import OwnerCard from "@/components/OwnerCard";
import { OWNER_PROFILES } from "@/data/owners";

export const dynamic = "force-dynamic";

export default function OwnersIndexPage() {
  return (
    <Section title="League Owners">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OWNER_PROFILES.map((p) => (
          <OwnerCard key={p.ownerId} profile={p} />
        ))}
      </div>
    </Section>
  );
}
