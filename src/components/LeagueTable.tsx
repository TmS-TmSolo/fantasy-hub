// ESPN-style standings + season stats (0.5 PPR league theme)
type Standing = {
  rk: number;
  team: string;
  w: number; l: number; t: number;
  pct: string; gb: string; playoff: number;
};
type Stat = {
  team: string;
  managers?: string;
  pf: number; pa: number;
  div: string; home: string; away: string;
  strk: string; moves: number;
};

const standings: Standing[] = [
  { rk: 1, team: 'Young and Reckless', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:48 },
  { rk: 2, team: 'Return of the Gypsy king', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:47 },
  { rk: 3, team: 'McConkey Kong and Friends', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:52 },
  { rk: 4, team: 'Dumbest Adult in the Room', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:50 },
  { rk: 5, team: 'Fantasy Daddy', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:51 },
  { rk: 6, team: 'Girth Brooks', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:55 },
  { rk: 7, team: 'Dereleek My Metcalf', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:46 },
  { rk: 8, team: 'The Ikea Vikings', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:49 },
  { rk: 9, team: 'The Architecht', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:46 },
  { rk:10, team: 'Dirty Mike and Da Little Rickys', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:51 },
  { rk:11, team: 'El Presidente of the Tuck', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:57 },
  { rk:12, team: 'Pirates of the Minge', w:0,l:0,t:0,pct:'.000',gb:'--',playoff:48 },
];

const stats: Stat[] = [
  { team:'Young and Reckless', managers:'Matt Young', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'Return of the Gypsy king', managers:'Brennen Hall', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'McConkey Kong and Friends', managers:'Michael Vlahovich', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'Dumbest Adult in the Room', managers:'Cole Bixenman', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'Fantasy Daddy', managers:'Matthew Hart', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'Girth Brooks', managers:'rob thomas', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'Dereleek My Metcalf', managers:'Thomas Young', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'The Ikea Vikings', managers:'Davis Johnson', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'The Architecht', managers:'Brad Carter', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'Dirty Mike and Da Little Rickys', managers:'Troy Scott', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'El Presidente of the Tuck', managers:'Brady Kincannon', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
  { team:'Pirates of the Minge', managers:'andy fox, Brockton Gates', pf:0,pa:0,div:'0-0-0',home:'0-0-0',away:'0-0-0',strk:'None',moves:0 },
];



function Th({ children, className='' }: any){
  return <th className={`px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide ${className}`}>{children}</th>;
}
function Td({ children, className='' }: any){
  return <td className={`px-3 py-2 text-sm ${className}`}>{children}</td>;
}

export default function StandingsTable(){
  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted">All 'Bout That Action Boss!</div>
          <h2 className="text-2xl font-display">Standings</h2>
          <div className="text-xs text-muted mt-1">Season <span className="text-accent">2025</span></div>
        </div>
        <div className="hidden sm:flex gap-2">
          <button className="btn btn-ghost h-9">League History</button>
          <button className="btn btn-ghost h-9">Game Lines</button>
          <button className="btn btn-primary h-9">Projected Standings</button>
        </div>
      </div>

      {/* Division table */}
      <div className="card card-glow overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Division 1</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-black/20">
              <tr>
                <Th className="w-10 text-right">RK</Th>
                <Th className="text-left">Team</Th>
                <Th className="text-right">W</Th>
                <Th className="text-right">L</Th>
                <Th className="text-right">T</Th>
                <Th className="text-right">PCT</Th>
                <Th className="text-right">GB</Th>
                <Th className="text-right">Playoff %</Th>
              </tr>
            </thead>
            <tbody>
              {standings.map((r, i) => (
                <tr key={r.team} className={i % 2 ? 'bg-white/5' : ''}>
                  <Td className="text-right text-muted">{r.rk}</Td>
                  <Td className="font-medium">{r.team}</Td>
                  <Td className="text-right">{r.w}</Td>
                  <Td className="text-right">{r.l}</Td>
                  <Td className="text-right">{r.t}</Td>
                  <Td className="text-right">{r.pct}</Td>
                  <Td className="text-right">{r.gb}</Td>
                  <Td className="text-right">{r.playoff}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Season stats table */}
      <div className="card card-glow overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Season Stats</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-black/20">
              <tr>
                <Th className="text-left">Team</Th>
                <Th className="text-left">Manager(s)</Th>
                <Th className="text-right">PF</Th>
                <Th className="text-right">PA</Th>
                <Th className="text-right">DIV</Th>
                <Th className="text-right">HOME</Th>
                <Th className="text-right">AWAY</Th>
                <Th className="text-right">STRK</Th>
                <Th className="text-right">MOVES</Th>
              </tr>
            </thead>
            <tbody>
              {stats.map((r, i) => (
                <tr key={r.team} className={i % 2 ? 'bg-white/5' : ''}>
                  <Td className="font-medium">{r.team}</Td>
                  <Td className="text-muted">{r.managers || '--'}</Td>
                  <Td className="text-right">{r.pf.toFixed(1)}</Td>
                  <Td className="text-right">{r.pa.toFixed(1)}</Td>
                  <Td className="text-right">{r.div}</Td>
                  <Td className="text-right">{r.home}</Td>
                  <Td className="text-right">{r.away}</Td>
                  <Td className="text-right">{r.strk}</Td>
                  <Td className="text-right">{r.moves}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Glossary */}
      <div className="text-xs text-muted">
        <div className="font-semibold mb-1">Standings Glossary</div>
        <p>x: Clinched Playoffs · y: Clinched Division · z: Clinched Bye · *: Clinched No.1 Seed · e: Eliminated</p>
      </div>
    </div>
  );
}
