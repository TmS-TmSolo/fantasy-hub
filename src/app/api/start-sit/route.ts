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
  boom?: number;
  bust?: number;
};

const PROJECTIONS_URL = process.env.PROJECTIONS_URL;

function scoreOf(p: Projection, scoring: Scoring, injury: PlayerIn["injury"]): number {
  const base =
    scoring === "PPR" ? p.points_ppr ?? p.points_half ?? p.points_std ?? 0 :
    scoring === "HALF" ? p.points_half ?? p.points_std ?? 0 :
    p.points_std ?? 0;
  const boomAdj = (p.boom ?? 0) * 0.05;
  const bustAdj = -(p.bust ?? 0) * 0.05;
  const injuryAdj = injury === "Q" ? -0.5 : injury === "D" ? -4 : injury === "O" ? -8 : 0;
  return base + boomAdj + bustAdj + injuryAdj;
}

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

  const scored = body.roster.map((r) => {
    const p = byName.get(r.name.toLowerCase()) ?? {};
    const s = scoreOf(p as Projection, body.scoring, r.injury ?? "");
    return { ...r, score: s, projection: p };
  });

  // position caps
  const caps = new Map<NonNullable<PlayerIn["position"]>, number>([
    ["QB", 1],
    ["RB", 2],
    ["WR", 2],
    ["TE", 1],
    // DST, K handled later
  ]);

  const byPos: Record<string, typeof scored> = {};
  for (const row of scored) {
    const key = row.position;
    if (!byPos[key]) byPos[key] = [];
    byPos[key].push(row);
  }
  for (const key of Object.keys(byPos)) byPos[key].sort((a, b) => b.score - a.score);

  const starters: typeof scored = [];
  const bench: typeof scored = [];

  for (const [pos, limit] of caps) {
    const rows = byPos[pos] ?? [];
    starters.push(...rows.slice(0, limit));
    bench.push(...rows.slice(limit));
  }

  // DST and K: take best one each if present
  for (const pos of ["DST", "K"] as const) {
    const rows = byPos[pos] ?? [];
    starters.push(...rows.slice(0, 1));
    bench.push(...rows.slice(1));
  }

  starters.sort((a, b) => b.score - a.score);
  bench.sort((a, b) => b.score - a.score);

  return NextResponse.json({ starters, bench });
}
