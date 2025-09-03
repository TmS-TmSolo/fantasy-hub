// src/app/tools/league/page.tsx
import LeagueTable from "@/components/LeagueTable";
import Section from "@/components/Section";

export const dynamic = "force-dynamic";

export default function LeaguePage() {
  return (
    <Section title="League Standings">
      <LeagueTable />
    </Section>
  );
}
