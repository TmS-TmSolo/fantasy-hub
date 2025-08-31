'use client';
import { useState } from 'react';

type PlayerIn = {
  name: string;
  team?: string;
  position: "QB" | "RB" | "WR" | "TE" | "DST" | "K";
  injury?: "Q" | "D" | "O" | "";
};
type Scoring = "STD" | "HALF" | "PPR";

export default function FantasyAssistant() {
  const [scoring, setScoring] = useState<Scoring>("PPR");
  const [text, setText] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function parseRoster(s: string): PlayerIn[] {
    return s
      .split("\n")
      .map((line) => {
        const [posRaw, nameRaw] = line.split(":").map((v) => v?.trim() ?? "");
        const pos = (posRaw?.toUpperCase() ?? "") as PlayerIn["position"];
        const name = nameRaw ?? "";
        if (!pos || !name) return null;
        return { position: pos, name };
      })
      .filter(Boolean) as PlayerIn[];
  }

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const roster = parseRoster(text);
      const res = await fetch("/api/start-sit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roster, scoring }),
      });
      const json = await res.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <label className="text-sm" htmlFor="scoring-select">Scoring</label>
        <select
          id="scoring-select"
          name="scoring"
          className="rounded-md border border-white/20 bg-transparent px-2 py-1"
          value={scoring}
          onChange={(e) => setScoring(e.target.value as Scoring)}
        >
          <option value="STD">STD</option>
          <option value="HALF">HALF</option>
          <option value="PPR">PPR</option>
        </select>
        <button
          className="ml-auto px-3 py-1 rounded-md bg-[var(--accent)] text-black"
          onClick={run}
          disabled={loading || !text.trim()}
          aria-label="Run start/sit"
        >
          {loading ? "Scoring..." : "Start/Sit"}
        </button>
      </div>

      <textarea
        className="w-full h-40 rounded-md border border-white/20 bg-transparent p-2 text-sm"
        placeholder="Enter roster lines like:&#10;QB: Player A&#10;RB: Player B"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Roster input"
      />

      {result && (
        <div className="grid gap-4">
          <div className="card p-3 overflow-x-auto">
            <h3 className="font-semibold mb-2">Starters</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-1 pr-3">Pos</th>
                  <th className="py-1 pr-3">Player</th>
                  <th className="py-1 pr-3">Score</th>
                  <th className="py-1 pr-3">Start %</th>
                  <th className="py-1 pr-3">Boom %</th>
                  <th className="py-1 pr-0">Bust %</th>
                </tr>
              </thead>
              <tbody>
                {result.starters?.map((r: any) => (
                  <tr key={r.name} className="border-t border-white/10">
                    <td className="py-1 pr-3">{r.position}</td>
                    <td className="py-1 pr-3">{r.name}</td>
                    <td className="py-1 pr-3">{r.score?.toFixed?.(2) ?? r.score}</td>
                    <td className="py-1 pr-3">{r.startPct?.toFixed?.(1) ?? r.startPct}%</td>
                    <td className="py-1 pr-3">{r.boomPct != null ? `${r.boomPct}%` : "-"}</td>
                    <td className="py-1 pr-0">{r.bustPct != null ? `${r.bustPct}%` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.bench?.length > 0 && (
            <div className="card p-3">
              <h3 className="font-semibold mb-2">Bench</h3>
              <ul className="space-y-1 text-sm">
                {result.bench.map((r: any) => (
                  <li key={r.name}>
                    {r.position}: {r.name} — {r.score?.toFixed?.(2) ?? r.score}
                    {r.boomPct != null || r.bustPct != null
                      ? `  (Boom ${r.boomPct ?? "-"}% / Bust ${r.bustPct ?? "-"}%)`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
