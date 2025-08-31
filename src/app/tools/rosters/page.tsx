import React from "react";
import { rosters } from "@/data/rosters";
import { league, getTeamById } from "@/data/league";
import { RosterTable } from "../../../components/RosterTable";
export default function RostersPage(){
  const teamIds=Object.keys(rosters);
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-semibold">League Rosters</h1>
      {teamIds.map(id=>{
        const team=getTeamById(id);
        const title=team?`${team.name} — ${team.abbrev ?? ""}`:`Team ${id}`;
        return <RosterTable key={id} roster={rosters[id]} title={title} />;
      })}
      <div className="text-xs text-gray-500">Source: {league.meta.espn.url}</div>
    </div>
  );
}
