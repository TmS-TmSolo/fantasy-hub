// src/components/Ticker.tsx
export default function Ticker({ items }: { items: string[] }) {
  const line = items.join('  •  ');
  return (
    <div className="border-y border-white/10 bg-black/20">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="ticker">
          <div className="ticker-track">
            <span className="text-[13px] text-muted">{line}   {line}   {line}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
