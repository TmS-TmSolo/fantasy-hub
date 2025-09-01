// src/components/FantasyAssistant.tsx
"use client";
import { useState } from "react";

type OkSingle = {
  ok: true;
  mode: "single";
  projection: { name: string; found: boolean; points: number };
  message: string;
};
type OkCompare = {
  ok: true;
  mode: "compare";
  projections: Array<{ name: string; found: boolean; points: number }>;
  decision: string;
  message: string;
};
type Err = { ok: false; error: string };
type Result = OkSingle | OkCompare | Err;

export default function FantasyAssistant() {
  const [input, setInput] = useState("");
  const [scoring, setScoring] = useState<"half" | "ppr" | "std">("half");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setRes(null);
    const trimmed = input.trim();
    if (!trimmed) {
      setErr("Type a player or 'A vs B'.");
      return;
    }

    // Support "A vs B", "A or B", "A,B", "A|B", or single name
    const parts = trimmed.split(/\s*(?:vs|,|\||\bor\b)\s*/i).filter(Boolean);
    const body = parts.length > 1 ? { players: parts, scoring } : { player: parts[0], scoring };

    try {
      setLoading(true);
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as Result;
      setRes(data);
    } catch {
      setErr("Request failed. Check names and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-6 p-4 border rounded-xl">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-lg p-3"
          placeholder="Tyreek Hill vs Jaylen Waddle  |  or single player"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Player input"
        />
        <div className="flex items-center gap-3">
          <label htmlFor="scoring" id="scoring-label" className="text-sm">
            Scoring
          </label>
          <select
            id="scoring"
            name="scoring"
            aria-labelledby="scoring-label"
            aria-label="Scoring"
            title="Scoring"
            className="border rounded-lg p-2"
            value={scoring}
            onChange={(e) => setScoring(e.target.value as "half" | "ppr" | "std")}
          >
            <option value="half">Half-PPR</option>
            <option value="ppr">PPR</option>
            <option value="std">Standard</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="ml-auto px-4 py-2 rounded-lg border"
          >
            {loading ? "Checking..." : "Start/Sit"}
          </button>
        </div>
      </form>

      {err && <p className="mt-3 text-red-600">{err}</p>}

      {res && res.ok && res.mode === "single" && (
        <div className="mt-4 p-3 rounded-lg">
          <p className="font-medium text-indigo-700">{res.message}</p>
        </div>
      )}

      {res && res.ok && res.mode === "compare" && (
        <div className="mt-4 p-3 rounded-lg space-y-2">
          <p className="font-medium text-indigo-700">{res.decision}</p>
          <ul className="list-disc ml-5 text-indigo-700">
            {res.projections.map((p) => (
              <li key={p.name}>
                {p.found ? `${p.name}: ${p.points}` : `No data for "${p.name}"`}
              </li>
            ))}
          </ul>
          <p className="text-sm opacity-80 text-indigo-700">{res.message}</p>
        </div>
      )}
    </div>
  );
}
