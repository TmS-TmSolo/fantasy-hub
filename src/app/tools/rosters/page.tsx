// src/app/tools/rosters/page.tsx
import { league } from "@/data/league";
import Section from "@/components/Section";

export const dynamic = "force-dynamic";

export default function RostersPage() {
  return (
    <Section title="Rosters">
      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Abbrev</th>
            </tr>
          </thead>
          <tbody>
            {league.teams.map((t) => {
              const owner = league.owners.find((o) => o.id === t.ownerId);
              return (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">{owner?.displayName ?? "-"}</td>
                  <td className="px-4 py-3">{t.abbrev ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
