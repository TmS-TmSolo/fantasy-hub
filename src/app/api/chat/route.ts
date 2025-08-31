// src/app/api/chat/route.ts
export const runtime = 'nodejs';

type Player = {
  name: string;
  team?: string;
  position?: string;
  points?: number;
  points_std?: number;
  points_half?: number;
  points_ppr?: number;
  ceiling?: number;
  floor?: number;
  boom?: number;
  bust?: number;
  td_prob?: number;
  targets?: number;
  receptions?: number;
  stats?: Record<string, unknown>;
  projections?: Record<string, unknown>;
};

const FALLBACK: Player[] = [
  { name: 'David Njoku', team: 'CLE', position: 'TE', points_half: 10.1, ceiling: 17.5, floor: 4.6 },
  { name: 'George Kittle', team: 'SF', position: 'TE', points_half:  9.4, ceiling: 16.2, floor: 4.2 },
  { name: 'Tyreek Hill',   team: 'MIA', position: 'WR', points_half: 18.9, ceiling: 29.0, floor: 9.0 },
  { name: 'Drake London',  team: 'ATL', position: 'WR', points_half: 12.6, ceiling: 20.2, floor: 6.7 },
];

// ---------- parsing ----------
function last(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1] || '').toLowerCase();
}

function parseLastNames(q: string): string[] {
  // split first, then trim filler per piece
  const parts = (' ' + String(q || '') + ' ')
    .toLowerCase()
    .split(/[,\|\/;&:]+|\sor\s|\svs\s|\sover\s|\n/gi)
    .map(s => s.trim())
    .filter(Boolean);

  const FILLER = /\b(start|sit|bench|flex|drop|trade|for|versus|choose|pick|between|over|and|please|who|should|i)\b/g;

  const out: string[] = [];
  const seen = new Set<string>();

  for (const p0 of (parts.length ? parts : [String(q || '')])) {
    const p = (' ' + p0 + ' ').replace(FILLER, ' ').trim();
    if (!p) continue;

    // keep last word, drop non-letters, block obvious first names by frequency later if needed
    const tokens = p.split(/\s+/).filter(Boolean);
    const l = (tokens[tokens.length - 1] || '').replace(/[^a-z'-]/gi, '').toLowerCase();
    if (l && !seen.has(l)) { seen.add(l); out.push(l); }
  }
  return out.slice(0, 6);
}

function pickScoring(q: string): 'half' | 'ppr' | 'std' {
  const s = q.toLowerCase();
  if (/\b0?\.?5\b|\bhalf\b|\b0[\s-]*5\s*ppr\b/.test(s)) return 'half';
  if (/\bppr\b/.test(s)) return 'ppr';
  if (/\bstandard\b|\bstd\b/.test(s)) return 'std';
  return 'half';
}

// ---------- helpers ----------
function getVal(obj: any, keys: string[]): number | undefined {
  for (const k of keys) {
    const v1 = obj?.[k];
    if (typeof v1 === 'number') return v1;
    const v2 = obj?.stats?.[k];
    if (typeof v2 === 'number') return v2;
    const v3 = obj?.projections?.[k];
    if (typeof v3 === 'number') return v3;
  }
  return undefined;
}

function metricKeysFor(scoring: 'half'|'ppr'|'std'): string[] {
  if (scoring === 'half') return ['points_half', 'half', 'pts_half', 'points'];
  if (scoring === 'ppr')  return ['points_ppr',  'ppr',  'pts_ppr',  'points'];
  return ['points_std', 'std', 'pts_std', 'points'];
}
function ceilingKeys(): string[] { return ['ceiling', 'ceil', 'proj_ceil', 'p90', 'boom']; }
function floorKeys(): string[]   { return ['floor', 'p10', 'bust']; }

function normalizePlayers(players: Player[]): (Player & { last: string })[] {
  return players.map(p => ({
    ...p,
    stats: p.stats ?? {},
    projections: p.projections ?? {},
    last: last(p.name || ''),
  }));
}

// ---------- projections loader (no fs) ----------
async function loadProjections(): Promise<{ players: Player[]; source: 'url'|'import'|'fallback' }> {
  // 1) Public URL (recommended: PROJECTIONS_URL -> JSON array or {players:[...]})
  if (process.env.PROJECTIONS_URL) {
    try {
      const res = await fetch(process.env.PROJECTIONS_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const arr: Player[] = Array.isArray(json) ? json : (json.players ?? json);
        if (Array.isArray(arr) && arr.length) return { players: arr, source: 'url' };
      }
    } catch {}
  }
  // 2) Bundle-time import (Next will package this)
  try {
    const mod: any = await import('@/data/projections.json');
    const arr: Player[] = Array.isArray(mod.default) ? mod.default : (mod.default?.players ?? mod.default);
    if (Array.isArray(arr) && arr.length) return { players: arr, source: 'import' };
  } catch {}

  // 3) Fallback few players
  return { players: FALLBACK, source: 'fallback' };
}

// ---------- ranking ----------
function rankCandidates(names: string[], players: Player[], scoring: 'half'|'ppr'|'std') {
  const metricKeys = metricKeysFor(scoring);
  const cKeys = ceilingKeys();
  const fKeys = floorKeys();
  const pool = normalizePlayers(players);

  const matches: Record<string, Player & { last: string; _val?: number; _ceil?: number; _floor?: number }> = {};
  for (const ln of names) {
    const cand = pool.filter(p => p.last === ln);
    if (!cand.length) continue;

    let best = cand[0];
    let bestVal = getVal(best, metricKeys) ?? Number.NEGATIVE_INFINITY;
    for (let i = 1; i < cand.length; i++) {
      const v = getVal(cand[i], metricKeys);
      if (typeof v === 'number' && v > bestVal) { best = cand[i]; bestVal = v; }
    }
    const _val = getVal(best, metricKeys);
    const _ceil = getVal(best, cKeys);
    const _floor = getVal(best, fKeys);
    (best as any)._val = _val;
    (best as any)._ceil = _ceil;
    (best as any)._floor = _floor;
    matches[ln] = best as any;
  }

  const found = Object.values(matches);
  const ranked = found
    .slice()
    .sort((a, b) => ((b as any)._val ?? -1e9) - ((a as any)._val ?? -1e9));

  return { matches, ranked, metricKeys, cKeys, fKeys };
}

function formatReply(
  ranked: (Player & { _val?: number; _ceil?: number; _floor?: number })[],
  scoring: 'half'|'ppr'|'std',
  metricUsed: string
): { reply: string; features: string[] } {
  if (!ranked.length) return { reply: 'No matching players found in projections.', features: [] };

  const label = scoring === 'ppr' ? 'PPR' : scoring === 'half' ? '0.5 PPR' : 'Standard';
  const order = ranked.map(p => p.name).join(' > ');
  const winner = ranked[0];
  const runner = ranked[1];

  const feats: string[] = [`scoring=${label}`, `metric=${metricUsed}`];

  let headline = `${winner.name} over ${ranked.slice(1).map(p => p.name).join(', ')}`;
  if (typeof winner._val === 'number' && typeof runner?._val === 'number') {
    const edge = winner._val - runner._val;
    feats.push(`edge_vs_next=${edge.toFixed(1)}pts`);
    headline += `. Edge ${edge.toFixed(1)} pts`;
  }
  if (typeof winner._ceil === 'number' && typeof runner?._ceil === 'number') {
    const boom = winner._ceil - (runner?._ceil ?? 0);
    feats.push(`ceil_delta=${boom.toFixed(1)}pts`);
  }
  if (typeof winner._floor === 'number' && typeof runner?._floor === 'number') {
    const floor = winner._floor - (runner?._floor ?? 0);
    feats.push(`floor_delta=${floor.toFixed(1)}pts`);
  }

  const reply = `${headline}. ${label}.\nOrder: ${order}`;
  return { reply, features: feats };
}

// ---------- main ----------
async function answer(q: string, explain?: boolean) {
  const names = parseLastNames(q);
  const scoring = pickScoring(q);
  const { players, source } = await loadProjections();

  if (names.length < 2) {
    const reply = 'Provide 2–6 last names.';
    return explain ? { reply, source: 'rules', features: [`scoring=${scoring}`, `names=${names.length}`] } : { reply };
  }

  const { ranked, metricKeys } = rankCandidates(names, players, scoring);
  const metricUsed = metricKeys[0];
  const { reply, features } = formatReply(ranked as any, scoring, metricUsed);

  return explain ? { reply, source, features } : { reply };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const q = String(body?.q ?? '');
    const explain = !!body?.explain;

    const res = await answer(q, explain);
    return Response.json(res);
  } catch {
    return Response.json({ reply: 'Bad Request' }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || searchParams.get('names') || '';
  const explain = searchParams.get('explain') === '1';
  const res = await answer(q, explain);
  return Response.json(res);
}
