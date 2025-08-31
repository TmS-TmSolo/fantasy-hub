// src/components/Hero.tsx
export default function Hero(){
  return (
    <section className="gradient-hero border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">
              All <span className="text-[var(--accent)]">’Bout</span> That <span className="shine">Action</span> Boss!
            </h1>
            <p className="mt-4 text-muted max-w-xl">
            The Greatest Fantasy Football League to ever be Created</p>
            <div className="mt-6 flex gap-3">
              <a href="#highlights" className="btn btn-primary">Watch Highlights</a>
              <a href="#assistant" className="btn btn-ghost">Ask the Assistant</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted">
              <Badge label="0.5 PPR/Keeper/Year 13" />
              <Badge label="Live Reactions/Chugs" />
              <Badge label="Greatest Trophy in FF" />
              <Badge label="Mangina Lives Forever" />
            </div>
          </div>
          <div className="card card-glow p-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-muted">Hero Highlight</div>
                <div className="mt-1 text-2xl font-display">Top Plays • Week</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <MiniStat label="Teams" value="12" />
              <MiniStat label="Cam" value="Big Cock" />
              <MiniStat label="Trades" value="0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Badge({label}:{label:string}){ return <span className="rounded-full border border-white/15 px-3 py-1">{label}</span>; }
function MiniStat({label,value}:{label:string;value:string}) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xl font-display">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}
