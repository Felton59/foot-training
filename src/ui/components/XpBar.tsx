export default function XpBar({ progress }: { progress: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}
