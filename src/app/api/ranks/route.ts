export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const SEASON = Number(process.env.NFL_SEASON ?? new Date().getFullYear());
const PLAYER_STATS_URL =
  `https://github.com/nflverse/nflverse-data/releases/download/player_stats/stats_player_week_${SEASON}.csv`; // nflverse weekly stats
// Sleeper trending (adds last 72h)
const SLEEPER_TRENDING = 'https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=72&limit=300';
const SLEEPER_PLAYERS   = 'https://api.sleeper.app/v1/players/nfl';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const role = process.env.SUPABASE_SERVICE_ROLE!; // server-only
const db   = createClient(url, role, { auth: { persistSession: false } });

type Row = Record<string, string>;
type RankRow = Record<string, string>;


export async function GET(_req: NextRequest) {
  try {
    // 1) load weekly player stats (nflverse)
    const csv = await fetch(PLAYER_STATS_URL).then(r => {
      if (!r.ok) throw new Error(`nflverse ${r.status}`);
      return r.text();
    });
    const rows = parse(csv, { columns: true }) as Row[];

    // keep offense only, last 3 weeks
    const wk = rows
      .filter(r => ['QB','RB','WR','TE'].includes((r.position||'').toUpperCase()))
      .map(r => ({
        name: r.player_name || r.full_name || r.name,
        pos: (r.position||'').toUpperCase(),
        season: Number(r.season),
        week: Number(r.week),
        // prefer built-in PPR if present, else approximate
        ppr: Number(r.fantasy_points_ppr ?? r.fantasy_points ?? 0) ||
             (Number(r.receiving_rec||0) * 1) +
             (Number(r.receiving_yds||0) / 10) +
             (Number(r.receiving_td||0) * 6) +
             (Number(r.rushing_yds||0) / 10) +
             (Number(r.rushing_td||0) * 6) +
             (Number(r.passing_yds||0) / 25) +
             (Number(r.passing_td||0) * 4) -
             (Number(r.passing_int||0) * 2) -
             (Number(r.fumbles_lost||0) * 2),
      }))
      .filter(r => r.season === SEASON && r.week > 0);

    // aggregate last 3 weeks weighted
    const byName = new Map<string, { pos:string; score:number; weeks:number }>();
    const maxWeek = Math.max(...wk.map(r=>r.week));
    const cutoff = new Set([maxWeek, maxWeek-1, maxWeek-2]);
    for (const r of wk) {
      if (!cutoff.has(r.week)) continue;
      const w = r.week === maxWeek ? 0.5 : r.week === maxWeek-1 ? 0.3 : 0.2;
      const cur = byName.get(r.name) || { pos: r.pos, score: 0, weeks: 0 };
      cur.score += r.ppr * w; cur.weeks += 1; cur.pos = r.pos;
      byName.set(r.name, cur);
    }

    // 2) nudge by Sleeper trending adds
    let boost = new Map<string, number>();
    try {
      const [trend, dict] = await Promise.all([
        fetch(SLEEPER_TRENDING).then(r=>r.json()),
        fetch(SLEEPER_PLAYERS).then(r=>r.json()),
      ]);
      for (const t of trend as any[]) {
        const pid = t?.player_id;
        const cnt = Number(t?.count||0);
        const name = dict?.[pid]?.full_name as string | undefined;
        if (name && cnt>0) boost.set(name, Math.log1p(cnt)); // diminishing returns
      }
    } catch { /* optional */ }

    // 3) upsert into Supabase
    const payload = Array.from(byName.entries()).map(([name, v]) => ({
      player_name: name,
      pos: v.pos,
      score: Number((v.score + (boost.get(name)||0)).toFixed(3)),
      season: SEASON,
      meta: { weeks: v.weeks, boosted: boost.has(name) ? boost.get(name) : 0 }
    }));

    // replace all
    await db.from('ranks').delete().neq('player_name','__never__');
    const { error } = await db.from('ranks').upsert(payload, { onConflict: 'player_name' });
    if (error) throw error;

    return NextResponse.json({ ok: true, count: payload.length, week: maxWeek });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'update failed' }, { status: 500 });
  }
}
