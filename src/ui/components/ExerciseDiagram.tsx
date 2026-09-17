import { useId } from 'react';
import type { Diagram, DiagramArrow, DiagramItem } from '../../data/types';

const WIDTH = 100;

type Point = [number, number];

function linePath(points: Point[]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}

/** Courbe lisse passant par tous les points (Catmull-Rom convertie en Bézier). */
function curvePath(points: Point[]): string {
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const [p1, p2] = [points[i], points[i + 1]];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function Item({ item }: { item: DiagramItem }) {
  switch (item.kind) {
    case 'enfant':
    case 'papa': {
      const isKid = item.kind === 'enfant';
      return (
        <g>
          <circle cx={item.x} cy={item.y} r={isKid ? 4.5 : 5.5} className={isKid ? 'kid' : 'dad'} />
          <text x={item.x} y={item.y} className="player-label">{isKid ? 'Toi' : 'Papa'}</text>
        </g>
      );
    }
    case 'plot':
      return <path d={`M${item.x} ${item.y - 4} L${item.x + 3.5} ${item.y + 2.5} L${item.x - 3.5} ${item.y + 2.5} Z`} className="cone" />;
    case 'ballon':
      return <circle cx={item.x} cy={item.y} r={2.2} className="ball" />;
    case 'cible':
      return (
        <g>
          <circle cx={item.x} cy={item.y} r={5} className="target" />
          <circle cx={item.x} cy={item.y} r={3.2} className="target-ring" />
          <circle cx={item.x} cy={item.y} r={1.4} className="target" />
        </g>
      );
    case 'texte':
      return <text x={item.x} y={item.y} className="note">{item.text}</text>;
    case 'but': {
      const depth = 3;
      const [w, h] = item.vertical ? [depth, item.length] : [item.length, depth];
      const x0 = item.x - w / 2;
      const y0 = item.y - h / 2;
      const mesh = Array.from({ length: Math.floor(item.length / 2.5) - 1 }, (_, i) => (i + 1) * 2.5);
      return (
        <g>
          <rect x={x0} y={y0} width={w} height={h} className="goal-net" />
          {mesh.map((d) =>
            item.vertical ? (
              <line key={d} x1={x0} x2={x0 + w} y1={y0 + d} y2={y0 + d} className="goal-mesh" />
            ) : (
              <line key={d} x1={x0 + d} x2={x0 + d} y1={y0} y2={y0 + h} className="goal-mesh" />
            ),
          )}
          <rect x={x0} y={y0} width={w} height={h} className="goal-frame" />
        </g>
      );
    }
  }
}

function Arrow({ arrow, markerId }: { arrow: DiagramArrow; markerId: string }) {
  const d = arrow.curve ? curvePath(arrow.points) : linePath(arrow.points);
  const mid = arrow.points[Math.floor((arrow.points.length - 1) / 2)];
  const next = arrow.points[Math.floor((arrow.points.length - 1) / 2) + 1];
  const [lx, ly] = [(mid[0] + next[0]) / 2, (mid[1] + next[1]) / 2];
  return (
    <g>
      <path d={d} className={`arrow ${arrow.kind}`} markerEnd={`url(#${markerId}-${arrow.kind})`} />
      {arrow.label && (
        <g>
          <circle cx={lx} cy={ly} r={2.8} className="step-badge" />
          <text x={lx} y={ly} className="step-label">{arrow.label}</text>
        </g>
      )}
    </g>
  );
}

export default function ExerciseDiagram({ diagram, title }: { diagram: Diagram; title: string }) {
  const id = useId().replace(/:/g, '');
  const height = diagram.height ?? 60;
  return (
    <figure className="diagram">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`Schéma : ${title}`}>
        <defs>
          {(['course', 'balle'] as const).map((kind) => (
            <marker key={kind} id={`${id}-${kind}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" className={`arrow-head ${kind}`} />
            </marker>
          ))}
        </defs>
        <rect x="0" y="0" width={WIDTH} height={height} rx="4" className="pitch" />
        {diagram.arrows.map((arrow, i) => <Arrow key={i} arrow={arrow} markerId={id} />)}
        {diagram.items.map((item, i) => <Item key={i} item={item} />)}
      </svg>
      <figcaption className="diagram-legend">
        {(['course', 'balle'] as const).map((kind) => (
          <span key={kind}>
            <svg viewBox="0 0 12 5" className="legend-swatch" aria-hidden="true">
              <rect width="12" height="5" rx="1" className="pitch" />
              <path d="M2 2.5 H10" className={`arrow ${kind}`} />
            </svg>
            {kind === 'course' ? 'tu cours' : 'le ballon'}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
