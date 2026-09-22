import { useState } from 'react';
import { getGesture } from '../../data/gestures';
import GestureCard from './GestureCard';

/** Boutons « Voir le geste » qui déplient la fiche vidéo des gestes utilisés par un exercice. */
export default function GestureLinks({ ids }: { ids: string[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const gestures = ids.map(getGesture).filter((g) => g !== undefined);
  if (gestures.length === 0) return null;
  return (
    <section className="stack">
      <strong>🎬 Voir les gestes en vidéo</strong>
      {gestures.map((d) => (
        <div key={d.id} className="stack">
          <button className={`btn ${open === d.id ? 'btn-primary' : ''}`} onClick={() => setOpen(open === d.id ? null : d.id)}>
            {open === d.id ? '▲' : '▶'} {d.name}
          </button>
          {open === d.id && <GestureCard gesture={d} />}
        </div>
      ))}
    </section>
  );
}
