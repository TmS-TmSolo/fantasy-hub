import React from "react";
import type { RosterEntry } from "@/data/rosters";

export function RosterTable({ roster, title }: { roster: RosterEntry[]; title?: string }) {
  return (
    <div className="w-full overflow-x-auto">
      {title ? <h2 className="text-xl font-semibold mb-2">{title}</h2> : null}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Slot</th>
            <th className="py-2 pr-4">Player</th>
            <th className="py-2 pr-4">Team</th>
            <th className="py-2 pr-4">Pos</th>
            <th className="py-2 pr-4">Acq</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((r, i) => (
            <tr key={i} className="border-b">
              <td className="py-2 pr-4">{r.slot}</td>
              <td className="py-2 pr-4">{r.name}</td>
              <td className="py-2 pr-4">{r.nflTeam ?? ""}</td>
              <td className="py-2 pr-4">{r.pos ?? ""}</td>
              <td className="py-2 pr-4">{r.acq ?? ""}</td>
              <td className="py-2 pr-4">{r.status ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
