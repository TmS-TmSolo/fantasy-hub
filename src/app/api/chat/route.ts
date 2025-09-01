// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { rosters } from "@/data/rosters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EnhancedPlayer = {
  name: string;
  team?: string;
  position?: string;
  points_half?: number;
  points_ppr?: number;
  injury?: "Q" | "D" | "SSPD" | "IR" | "O";
};

interface StartSitSignals {
  baseProjection: number;
  injuryStatus?: EnhancedPlayer["injury"];
  teamTotal?: number;      // future
  opponentRank?: number;   // future
  weatherPenalty?: number; // future 0..1
}

/* ---- Defaults by position when projections are missing ---- */
const DEFAULT_POINTS: Record<string, { half: number; ppr: number }> = {
  QB: { half: 18, ppr: 18 },
  RB: { half: 13, ppr: 15 },
  WR: { half: 12, ppr: 15 },
  TE: { half: 8,  ppr: 10 },
  "D/ST": { half: 6, ppr: 6 },
  K: { half: 8, ppr: 8 },
  FLEX: { half: 11, ppr: 13 },
};

/* ---- Build ENHANCED_PLAYERS from data/rosters.ts ---- */
function normalizeTeam(t?: string) {
  if (!t) return undefined;
  const up = t.toUpperCase();
  // map common mixed-case to standard 2-3 chars
  return up.length <= 3 ? up : up.slice(0, 3);
}

function inferInjury(status?: string, note?: string): EnhancedPlayer["injury"] | undefined {
  const s = `${status || ""} ${note || ""}`.toUpperCase();
  if (/\bSSPD|SUSP\b/.test(s)) return "SSPD";
  if (/\bQUESTIONABLE|\bQ\b/.test(s)) return "Q";
  if (/\bDOUBTFUL|\bD\b/.test(s)) return "D";
  if (/\bIR\b/.test(s)) return "IR";
  if (/\bOUT|\bO\b/.test(s)) return "O";
  return undefined;
}

function buildEnhancedPlayers(): EnhancedPlayer[] {
  const map = new Map<string, EnhancedPlayer>();

  Object.values(rosters).forEach((entries) => {
    entries.forEach((e) => {
      const name = e?.name?.trim();
      if (!name || map.has(name)) return;

      const pos = (e.pos || e.slot || "").toUpperCase();
      const team = normalizeTeam(e.nflTeam);
      const def = DEFAULT_POINTS[pos] || { half: 10, ppr: 10 };
      const injury = inferInjury(e.status, e.note);

      map.set(name, {
        name,
        team,
        position: pos || undefined,
        points_half: def.half,
        points_ppr: def.ppr,
        injury,
      });
    });
  });

  // Hand-tune a few known stars if present to feel less generic
  const bump = (n: string, half: number, ppr: number) => {
    const p = map.get(n);
    if (p) { p.points_half = half; p.points_ppr = ppr; }
  };
  bump("Tyreek Hill", 19.4, 21.8);
  bump("Christian McCaffrey", 20.1, 22.4);
  bump("CeeDee Lamb", 18.2, 20.9);
  bump("Amon-Ra St. Brown", 17.1, 19.7);
  bump("Breece Hall", 16.2, 18.0);
  bump("Bijan Robinson", 15.9, 17.6);

  return Array.from(map.values());
}

const ENHANCED_PLAYERS: EnhancedPlayer[] = buildEnhancedPlayers();

/* ---- Scoring and ranking ---- */
function calculatePDRScore(
  playerName: string,
  scoring: "ppr" | "half" | "std",
  signals: StartSitSignals
) {
  let score = signals.baseProjection;
  let confidence = 85;
  const adjustments: string[] = [];

  // Injury adjustments
  if (signals.injuryStatus === "Q") {
    score *= 0.95; confidence -= 10; adjustments.push("-5% injury concern");
  } else if (signals.injuryStatus === "D") {
    score *= 0.92; confidence -= 20; adjustments.push("-8% doubtful status");
  } else if (signals.injuryStatus === "SSPD") {
    score *= 0.80; confidence -= 30; adjustments.push("-20% suspension risk");
  } else if (signals.injuryStatus === "IR" || signals.injuryStatus === "O") {
    score *= 0.70; confidence -= 35; adjustments.push("-30% out/IR");
  }

  // Team total bump
  if (signals.teamTotal && signals.teamTotal > 45) {
    score *= 1.03; confidence += 5; adjustments.push("+3% high-scoring game");
  }

  // Weather penalty
  if (signals.weatherPenalty && signals.weatherPenalty > 0) {
    score *= 1 - signals.weatherPenalty;
    confidence -= Math.min(30, signals.weatherPenalty * 10);
    adjustments.push(`-${(signals.weatherPenalty * 100).toFixed(0)}% weather`);
  }

  confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  return {
    score: Number(score.toFixed(1)),
    confidence,
    rationale:
      adjustments.length > 0
        ? `${playerName}: ${score.toFixed(1)} pts. ${adjustments.join(", ")}`
        : `${playerName}: ${score.toFixed(1)} pts (clean projection)`,
    riskLevel: confidence < 60 ? "HIGH" : confidence < 80 ? "MEDIUM" : "LOW",
  };
}

function findPlayer(name: string): EnhancedPlayer | undefined {
  const target = name.trim().toLowerCase();
  return ENHANCED_PLAYERS.find((p) => p.name.toLowerCase() === target);
}

function projectPoints(p: EnhancedPlayer, scoring: "ppr" | "half" | "std"): number {
  if (scoring === "ppr" && typeof p.points_ppr === "number") return p.points_ppr!;
  if (scoring === "half" && typeof p.points_half === "number") return p.points_half!;
  // std: approximate from half
  if (scoring === "std" && typeof p.points_half === "number") return Math.max(0, p.points_half! - 2);
  return 0;
}

/* ---- Route ---- */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const scoring: "ppr" | "half" | "std" = body.scoring ?? "half";
    const names: string[] = Array.isArray(body.players)
      ? body.players
      : body.player
      ? [body.player]
      : [];

    if (names.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing player(s)" }, { status: 400 });
    }

    const hits = names.map((raw: string) => {
      const p = findPlayer(raw);
      if (!p) {
        return {
          name: raw,
          found: false,
          points: 0,
          confidence: 0,
          rationale: `No data for "${raw}"`,
          riskLevel: "HIGH",
        };
      }

      const baseProjection = projectPoints(p, scoring);
      const signals: StartSitSignals = {
        baseProjection,
        injuryStatus: p.injury,
      };
      const r = calculatePDRScore(p.name, scoring, signals);

      return {
        name: p.name,
        found: true,
        points: r.score,
        confidence: r.confidence,
        rationale: r.rationale,
        riskLevel: r.riskLevel,
      };
    });

    if (hits.length === 1) {
      const [one] = hits;
      return NextResponse.json({
        ok: true,
        mode: "single",
        projection: one,
        message: one.rationale,
        confidence: one.confidence,
        lastUpdated: new Date().toISOString(),
      });
    }

    const [a, b] = hits;
    let winner: any = null;
    let decision = "Insufficient data";
    let message = "No decision. Check player names.";

    if (a?.found && b?.found) {
      winner = a.points >= b.points ? a : b;
      const loser = winner === a ? b : a;
      decision = `Start ${winner.name}`;
      message = `${winner.name} projected higher (${winner.points} vs ${loser.points}). Confidence: ${winner.confidence}%`;
      if (winner.riskLevel === "HIGH" && loser.riskLevel === "LOW") {
        message += ` — safer: ${loser.name}.`;
      }
    }

    return NextResponse.json({
      ok: true,
      mode: "compare",
      projections: [a, b],
      decision,
      message,
      confidence: winner?.confidence || 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
