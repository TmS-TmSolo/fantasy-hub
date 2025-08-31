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
  const [text, setText] = useState<string>("QB: Jalen Hurts\nRB: Christian McCaffrey\nRB: Breece Hall\nWR: Tyreek Hill\nWR: Amon-Ra St. Brown\nTE: Sam LaPorta\nFLEX: De'Von Achane\nDST: Eagles\nK: Jake Elliott");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function parseRoster(s: string): PlayerIn[] {
    return s.split("\n").map((line) => {
      const [posRaw, nameRaw] = line.split(":").map(v => v?.trim() ?? "");
      const pos = (posRaw?.toUpperCase() ?? "") as PlayerIn["position"];
      const name = nameRaw ?? "";
      if (!pos || !name) return null;
      return { position: pos, name };
    }).filter(Boolean) as PlayerIn[];
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
        <label htmlFor="scoring-select" className="text-sm">Scoring</label>
        <select
          id="scoring-select"
          className="rounded-md border border-white/20 bg-transparent px-2 py-1"
          value={scoring}
          onChange={(e) => setScoring(e.target.value as Scoring)}
        >
          <option value="STD">STD</option>
          <option value="HALF">HALF</option>
          <option value="PPR">PPR</option>
        </select>
        <button className="ml-auto px-3 py-1 rounded-md bg-[var(--accent)] text-black" onClick={run} disabled={loading}>
          {loading ? "Scoring..." : "Start/Sit"}
        </button>
      </div>

      <label htmlFor="roster-textarea" className="text-sm">Roster</label>
      <textarea
        id="roster-textarea"
        className="w-full h-40 rounded-md border border-white/20 bg-transparent p-2 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your roster here..."
        title="Roster input"
      />

      {result && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-3">
            <h3 className="font-semibold mb-2">Starters</h3>
            <ul className="space-y-1 text-sm">
              {result.starters?.map((r: any) => (
                <li key={r.name}>{r.position}: {r.name} — {r.score.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div className="card p-3">
            <h3 className="font-semibold mb-2">Bench</h3>
            <ul className="space-y-1 text-sm">
              {result.bench?.map((r: any) => (
                <li key={r.name}>{r.position}: {r.name} — {r.score.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
