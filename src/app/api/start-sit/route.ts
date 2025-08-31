import { NextRequest, NextResponse } from "next/server";

type Scoring = "STD" | "HALF" | "PPR";
type PlayerIn = {
  name: string;
  team?: string;
  position: "QB" | "RB" | "WR" | "TE" | "DST" | "K";
  injury?: "Q" | "D" | "O" | "";
};
type Projection = {
  name: string;
  points_std?: number;
  points_half?: number;
  points_ppr?: number;
  boom?: number | null; // percent 0-100 if present
  bust?: number | null; // percent 0-100 if present
};

const PROJECTIONS_URL = process.env.PROJECTIONS_URL;

// scoring
function scoreOf(p: Projection, scoring: Scoring, injury: PlayerIn["injury"]): number {
  const base =
    scoring === "PPR" ? p.points_ppr ?? p.points_half ?? p.points_std ?? 0 :
    scoring === "HALF" ? p.points_half ?? p.points_std ?? 0 :
    p.points_std ?? 0;

  // If boom/bust given as %, add small optimism/pessimism
  const boomAdj = (Number(p.boom ?? 0) / 100) * 0.8; // up to +0.8
  const bustAdj = -(Number(p.bust ?? 0) / 100) * 0.8; // up to -0.8

  const injuryAdj = injury === "Q" ? -0.5 : injury === "D" ? -4 : injury === "O" ? -8 : 0;

  return base + boomAdj + bustAdj + injuryAdj;
}

// probability a beats b given score diff, logistic with scale ~3 pts
function startProb(scoreA: number, scoreB: number): number {
  const diff = scoreA - scoreB;
  const sigma = 3.0;
  const p = 1 / (1 + Math.exp(-diff / sigma));
  return Math.round(p * 1000) / 10; // one decimal
}

// clamp helper
const pct = (v: unknown, d: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return d;
  return Math.max(0, Math.min(100, Math.round(n * 10) / 10));
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { roster: PlayerIn[]; scoring: Scoring };
  if (!Array.isArray(body.roster)) {
    return NextResponse.json({ error: "Invalid roster" }, { status: 400 });
  }
  if (!PROJECTIONS_URL) {
    return NextResponse.json({ error: "Missing PROJECTIONS_URL" }, { status: 500 });
  }

  const res = await fetch(PROJECTIONS_URL, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: "Projections fetch failed" }, { status: 502 });
  const projList = (await res.json()) as Projection[];

  const byName = new Map<string, Projection>();
  for (const p of projList) byName.set(p.name.toLowerCase(), p);

  // score roster
  const scored = body.roster.map((r) => {
    const p = byName.get(r.name.toLowerCase()) ?? {};
    const s = scoreOf(p as Projection, body.scoring, r.injury ?? "");
    return {
      ...r,
      score: Math.round(s * 100) / 100,
      boomPct: pct((p as Projection).boom, 0),
      bustPct: pct((p as Projection).bust, 0),
    };
  });

  // caps by position
  const caps = new Map<PlayerIn["position"], number>([
    ["QB", 1],
    ["RB", 2],
    ["WR", 2],
    ["TE", 1],
    ["DST", 1],
    ["K", 1],
  ]);

  const byPos: Record<string, typeof scored> = {};
  for (const row of scored) {
    const key = row.position;
    if (!byPos[key]) byPos[key] = [];
    byPos[key].push(row);
  }
  for (const key of Object.keys(byPos)) byPos[key].sort((a, b) => b.score - a.score);

  const starters: any[] = [];
  const bench: any[] = [];
  const decisions: any[] = [];

  for (const [pos, limit] of caps) {
    const rows = (byPos[pos] ?? []).slice();
    if (rows.length === 0) continue;

    const chosen = rows.slice(0, limit);
    const rest = rows.slice(limit);

    // For each chosen, compute Start% vs the next-best alternative at that same position
    for (let i = 0; i < chosen.length; i++) {
      const a = chosen[i];
      const b = rest[i] ?? rows[limit] ?? rest[0] ?? null; // nearest bench same pos
      const startPct = b ? startProb(a.score, b.score) : 50.0;
      starters.push({ ...a, startPct });
      decisions.push({ position: pos, start: a.name, over: b?.name ?? null, startPct });
    }

    bench.push(...rest);
  }

  starters.sort((a, b) => b.startPct - a.startPct || b.score - a.score);
  bench.sort((a, b) => b.score - a.score);

  return NextResponse.json({ starters, bench, decisions });
}
