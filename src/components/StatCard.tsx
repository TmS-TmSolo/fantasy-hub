export default function StatCard({
  title,
  stat,
  hint,
  accent = 'accent',
}: {
  title: string;
  stat: string;
  hint?: string;
  accent?: 'accent' | 'accent-2' | 'accent-3';
}) {
  const color =
    accent === 'accent-2' ? 'text-accent-2' :
    accent === 'accent-3' ? 'text-accent-3' :
    'text-accent';

  return (
    <div className="card card-glow p-5">
      <div className="text-sm text-muted">{title}</div>
      <div className={`mt-1 text-3xl font-display ${color}`}>{stat}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
