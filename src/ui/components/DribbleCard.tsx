import { useEffect, useState } from 'react';
import { DRIBBLE_SOURCE, type Dribble } from '../../data/dribbles';

const LEVEL_LABELS: Record<Dribble['level'], string> = { facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile' };

function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

/** Fiche d'un dribble : à quoi il sert, vidéo de démonstration, 3 étapes et un conseil. */
export default function DribbleCard({ dribble }: { dribble: Dribble }) {
  const online = useOnline();
  return (
    <div className="stack dribble-card">
      <div className="row">
        <span className={`chip level-${dribble.level}`}>{LEVEL_LABELS[dribble.level]}</span>
      </div>
      <p>{dribble.purpose}</p>
      {online ? (
        <div className="video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${dribble.youtubeId}?rel=0`}
            title={`Vidéo : ${dribble.name}`}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="banner">📶 Pas de réseau : la vidéo s’affichera quand tu seras connecté. Les étapes ci-dessous marchent sans réseau.</p>
      )}
      <ol className="steps">
        {dribble.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {dribble.tip && <p className="tip">💡 {dribble.tip}</p>}
      <p className="muted">
        📄 {DRIBBLE_SOURCE}.{' '}
        <a href={`https://www.youtube.com/watch?v=${dribble.youtubeId}`} target="_blank" rel="noreferrer">
          Ouvrir dans YouTube
        </a>
      </p>
    </div>
  );
}
