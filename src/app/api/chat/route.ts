// src/app/api/chat/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Player = {
  name: string;
  team?: string;
  position?: string;
  points_std?: number;
  points_half?: number;
  points_ppr?: number;
};

const PLAYERS: Player[] = [
  // WRs
  { name: "Tyreek Hill", team: "MIA", position: "WR", points_half: 17.4, points_ppr: 20.8 },
  { name: "Jaylen Waddle", team: "MIA", position: "WR", points_half: 12.9, points_ppr: 16.6 },
  { name: "CeeDee Lamb", team: "DAL", position: "WR", points_half: 16.2, points_ppr: 20.2 },
  { name: "Amon-Ra St. Brown", team: "DET", position: "WR", points_half: 15.8, points_ppr: 19.9 },
  // RBs
  { name: "Christian McCaffrey", team: "SF", position: "RB", points_half: 19.3, points_ppr: 21.6 },
  { name: "Derrick Henry", team: "BAL", position: "RB", points_half: 14.6, points_ppr: 16.0 },
  { name: "Jahmyr Gibbs", team: "DET", position: "RB", points_half: 13.8, points_ppr: 17.5 },
  // TEs
  { name: "David Njoku", team: "CLE", position: "TE", points_half: 10.1, points_ppr: 12.4 },
  { name: "George Kittle", team: "SF", position: "TE", points_half: 9.4, points_ppr: 11.6 },
];

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function nameTokens(p: Player): string[] {
  return norm(p.name).split(/\s+/);
}

function findPlayer(q: string): Player | null {
  const n = norm(q);

  // 1) Exact full-name
  const exact = PLAYERS.find((p) => norm(p.name) === n);
  if (exact) return exact;

  // 2) Exact last-name if single token
  if (!/\s/.test(n)) {
    const lastExact = PLAYERS.find((p) => {
      const tokens = nameTokens(p);
      return tokens[tokens.length - 1] === n;
    });
    if (lastExact) return lastExact;
  }

  // 3) Contains anywhere in full name
  const contains = PLAYERS.find((p) => norm(p.name).includes(n));
  if (contains) return contains;

  // 4) Token contains (handles prefixes)
  const tokenHit = PLAYERS.find((p) => nameTokens(p).some((t) => t.startsWith(n)));
  return tokenHit ?? null;
}

function project(p: Player, scoring: "half" | "ppr" | "std"): number {
  if (scoring === "ppr") return p.points_ppr ?? p.points_half ?? p.points_std ?? 0;
  if (scoring === "std") return p.points_std ?? p.points_half ?? p.points_ppr ?? 0;
  return p.points_half ?? p.points_ppr ?? p.points_std ?? 0;
}

type ReqBody = {
  player?: string;
  players?: string[];
  scoring?: "half" | "ppr" | "std";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const scoring = body.scoring ?? "half";
    const names = body.players?.length ? body.players : body.player ? [body.player] : [];

    if (names.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing player(s)" }, { status: 400 });
    }

    const hits = names.map((n) => {
      const p = findPlayer(n);
      if (!p) return { name: n, found: false, points: 0 };
      return { name: p.name, found: true, points: Number(project(p, scoring).toFixed(1)) };
    });

    if (hits.length === 1) {
      const [one] = hits;
      return NextResponse.json({
        ok: true,
        mode: "single",
        input: names,
        projection: one,
        message: one.found
          ? `${one.name}: ${one.points} ${scoring.toUpperCase()} pts`
          : `No data for "${one.name}".`,
      });
    }

    const [a, b] = hits;
    let winner: typeof a | typeof b | null = null;
    if (a.found && b.found) winner = a.points >= b.points ? a : b;

    return NextResponse.json({
      ok: true,
      mode: "compare",
      input: names,
      projections: [a, b],
      decision: winner ? `Start ${winner.name}` : "Insufficient data",
      message: winner
        ? `${winner.name} projected higher (${winner.points} vs ${a === winner ? b.points : a.points})`
        : "No decision. Check player names.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const scoring = (searchParams.get("scoring") as ReqBody["scoring"]) ?? "half";
  if (!q) return NextResponse.json({ ok: false, error: "Missing q" }, { status: 400 });

  const parts = q.split(/\s*(?:vs|,|\||\bor\b)\s*/i).filter(Boolean);
  const body: ReqBody = parts.length > 1 ? { players: parts, scoring } : { player: parts[0], scoring };

  return POST(
    new Request(req.url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
  );
}
