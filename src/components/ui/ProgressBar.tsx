export function ProgressBar({ pct, mini = false }) {
  const safePct = Math.max(0, Math.min(100, pct || 0));

  return (
    <div className={`bar ${mini ? "bar-mini" : ""}`}>
      <div className="bar-fill" style={{ width: `${safePct}%` }} />
      {mini ? null : <span className="bar-label">{safePct}%</span>}
    </div>
  );
}
