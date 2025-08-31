import React from "react";
import { league, getOwnerById } from "@/data/league";

export default function LeagueTable(){
  const rows=league.teams.map(t=>{
    const owner=getOwnerById(t.ownerId);
    const latest=(league.history.find(h=>h.teamId===t.id)?.records||[]).toSorted((a,b)=>b.season-a.season)[0];
    return {...t,ownerName:owner?.displayName||"—",latest};
  });
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr className="text-left border-b">
          <th className="py-2 pr-4">Team</th><th className="py-2 pr-4">Owner</th>
          <th className="py-2 pr-4">Last Season</th><th className="py-2 pr-4">Record</th>
          <th className="py-2 pr-4">PF</th><th className="py-2 pr-4">PA</th><th className="py-2 pr-4">Finish</th>
        </tr></thead>
        <tbody>{rows.map(r=>(
          <tr key={r.id} className="border-b">
            <td className="py-2 pr-4">{r.name}</td>
            <td className="py-2 pr-4">{r.ownerName}</td>
            <td className="py-2 pr-4">{r.latest?.season ?? "—"}</td>
            <td className="py-2 pr-4">{r.latest ? `${r.latest.wins}-${r.latest.losses}${r.latest.ties?`-${r.latest.ties}`:""}` : "—"}</td>
            <td className="py-2 pr-4">{r.latest?.pointsFor ?? "—"}</td>
            <td className="py-2 pr-4">{r.latest?.pointsAgainst ?? "—"}</td>
            <td className="py-2 pr-4">{r.latest?.finish ?? "—"}</td>
          </tr>
        ))}</tbody>
      </table>
      <div className="mt-4 text-xs text-gray-500">
        Source: <a className="underline" href={league.meta.espn.url} target="_blank" rel="noreferrer">ESPN League {league.meta.espn.leagueId}</a>
      </div>
    </div>
  );
}
