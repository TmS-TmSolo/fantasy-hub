import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Your existing player data - enhanced with injury status from your roster data
const ENHANCED_PLAYERS = [
  { name: "Tyreek Hill", team: "MIA", position: "WR", points_half: 17.4, points_ppr: 20.8, injury: "Q" },
  { name: "Christian McCaffrey", team: "SF", position: "RB", points_half: 19.3, points_ppr: 21.6 },
  { name: "Rashee Rice", team: "KC", position: "WR", points_half: 12.5, points_ppr: 15.8, injury: "SSPD" },
  // ... your existing player data with injury status added
];

interface StartSitSignals {
  baseProjection: number;
  injuryStatus?: string;
  teamTotal?: number; // Vegas O/U (add later)
  opponentRank?: number; // Defensive ranking (add later)
  weatherPenalty?: number; // Weather impact (add later)
}

function calculatePDRScore(playerName: string, scoring: string, signals: StartSitSignals) {
  let score = signals.baseProjection;
  let confidence = 85; // Base confidence
  let adjustments: string[] = [];

  // PDR Algorithm (Section 10):
  
  // 1. Injury adjustments
  if (signals.injuryStatus === 'Q') {
    score *= 0.95; // -5% for questionable
    confidence -= 10;
    adjustments.push('-5% injury concern');
  } else if (signals.injuryStatus === 'D') {
    score *= 0.92; // -8% for doubtful  
    confidence -= 20;
    adjustments.push('-8% doubtful status');
  } else if (signals.injuryStatus === 'SSPD') {
    score *= 0.80; // -20% for suspended
    confidence -= 30;
    adjustments.push('-20% suspension risk');
  }

  // 2. Team total adjustments (when available)
  if (signals.teamTotal && signals.teamTotal > 45) {
    score *= 1.03; // +3% for high team total
    confidence += 5;
    adjustments.push('+3% high-scoring game');
  }

  // 3. Weather penalty (when available)
  if (signals.weatherPenalty && signals.weatherPenalty > 0) {
    score *= (1 - signals.weatherPenalty);
    confidence -= (signals.weatherPenalty * 10);
    adjustments.push(`-${(signals.weatherPenalty * 100).toFixed(0)}% weather`);
  }

  // Ensure confidence stays in 0-100 range
  confidence = Math.max(0, Math.min(100, confidence));

  return {
    score: Number(score.toFixed(1)),
    confidence,
    rationale: adjustments.length > 0 
      ? `${playerName}: ${score.toFixed(1)} pts. ${adjustments.join(', ')}`
      : `${playerName}: ${score.toFixed(1)} pts (clean projection)`,
    riskLevel: confidence < 60 ? 'HIGH' : confidence < 80 ? 'MEDIUM' : 'LOW'
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const scoring = body.scoring ?? "half";
    const names = body.players?.length ? body.players : body.player ? [body.player] : [];

    if (names.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing player(s)" }, { status: 400 });
    }

    // Helper function to find a player by name
    function findPlayer(name: string) {
      return ENHANCED_PLAYERS.find(
        p => p.name.toLowerCase() === name.toLowerCase()
      );
    }

    // Helper function to project points based on scoring type
    function project(player: any, scoring: string): number {
      if (scoring === "ppr" && typeof player.points_ppr === "number") {
        return player.points_ppr;
      }
      if (scoring === "half" && typeof player.points_half === "number") {
        return player.points_half;
      }
      // Default to half if unknown
      return typeof player.points_half === "number" ? player.points_half : 0;
    }

    // Enhanced player lookup with your existing logic
    const hits = names.map((name: string) => {
      const player = findPlayer(name);
      if (!player) return { name, found: false, points: 0, confidence: 0, rationale: `No data for "${name}"` };
      
      const baseProjection = project(player, scoring); // Your existing function
      const signals: StartSitSignals = {
        baseProjection,
        injuryStatus: player.injury, // From your roster data
        // teamTotal: await getVegasTotal(player.team), // Add later
        // opponentRank: await getOpponentRank(player.team), // Add later
      };

      const result = calculatePDRScore(player.name, scoring, signals);
      return {
        name: player.name,
        found: true,
        points: result.score,
        confidence: result.confidence,
        rationale: result.rationale,
        riskLevel: result.riskLevel
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
        lastUpdated: new Date().toISOString()
      });
    }

    // Comparison logic with enhanced rationale
    const [a, b] = hits;
    let winner = null;
    let decision = "Insufficient data";
    let message = "No decision. Check player names.";

    if (a.found && b.found) {
      winner = a.points >= b.points ? a : b;
      const loser = winner === a ? b : a;
      decision = `Start ${winner.name}`;
      message = `${winner.name} projected higher (${winner.points} vs ${loser.points}). Confidence: ${winner.confidence}%`;
      
      // Add risk assessment
      if (winner.riskLevel === 'HIGH' && loser.riskLevel === 'LOW') {
        message += ` ⚠️ Consider ${loser.name} as safer option.`;
      }
    }

    return NextResponse.json({
      ok: true,
      mode: "compare",
      projections: [a, b],
      decision,
      message,
      confidence: winner?.confidence || 0,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}