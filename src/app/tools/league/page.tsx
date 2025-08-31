import React from "react";
import LeagueTable from "@/components/LeagueTable";
export default function LeaguePage(){
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">League Overview</h1>
      <LeagueTable />
    </div>
  );
}
