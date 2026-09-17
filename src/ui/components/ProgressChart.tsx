import type { Challenge } from '../../data/types';
import { bestValue, nextStep } from '../../engine/tiers';
import { sortResults } from '../../engine/xp';
import type { ChallengeResult } from '../../storage/schema';
import { formatDate, formatValue } from '../format';

const W = 320;
const H = 180;
const PAD = 30;

export default function ProgressChart({ challenge, results }: { challenge: Challenge; results: ChallengeResult[] }) {
  const points = sortResults(results);
  if (points.length < 2) {
    return <p className="muted">Fais ce défi au moins 2 fois pour voir ta courbe.</p>;
  }
  const best = bestValue(challenge, points.map((p) => p.value))!;
  const goal = nextStep(challenge, best);
  const values = [...points.map((p) => p.value), ...(goal ? [goal.value] : [])];
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (points.length - 1);
  const ratio = (v: number) => (v - min) / (max - min);
  const y = (v: number) => (challenge.better === 'higher' ? H - PAD - ratio(v) * (H - 2 * PAD) : PAD + ratio(v) * (H - 2 * PAD));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Progression : ${challenge.name}`}>
      {goal && (
        <>
          <line className="goal" x1={PAD} x2={W - PAD} y1={y(goal.value)} y2={y(goal.value)} />
          <text x={W - PAD} y={y(goal.value) - 5} textAnchor="end">
            {goal.label} {formatValue(goal.value)}
          </text>
        </>
      )}
      <path className="line" d={path} />
      {points.map((p, i) => (
        <circle key={`${p.date}-${i}`} className="point" cx={x(i)} cy={y(p.value)} r={4} />
      ))}
      <text x={2} y={y(max) + 4}>{formatValue(max)}</text>
      <text x={2} y={y(min) + 4}>{formatValue(min)}</text>
      <text x={PAD} y={H - 6}>{formatDate(points[0].date)}</text>
      <text x={W - PAD} y={H - 6} textAnchor="end">
        {formatDate(points[points.length - 1].date)}
      </text>
    </svg>
  );
}
