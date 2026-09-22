import { useState } from 'react';
import { getDribble } from '../../data/dribbles';
import DribbleCard from './DribbleCard';

/** Boutons « Voir le geste » qui déplient la fiche vidéo des dribbles utilisés par un exercice. */
export default function DribbleLinks({ ids }: { ids: string[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const dribbles = ids.map(getDribble).filter((d) => d !== undefined);
  if (dribbles.length === 0) return null;
  return (
    <section className="stack">
      <strong>🎬 Voir les gestes en vidéo</strong>
      {dribbles.map((d) => (
        <div key={d.id} className="stack">
          <button className={`btn ${open === d.id ? 'btn-primary' : ''}`} onClick={() => setOpen(open === d.id ? null : d.id)}>
            {open === d.id ? '▲' : '▶'} {d.name}
          </button>
          {open === d.id && <DribbleCard dribble={d} />}
        </div>
      ))}
    </section>
  );
}
