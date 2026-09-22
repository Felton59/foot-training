import { useEffect, useState } from 'react';
import { CHANNEL_SOURCES, LEVEL_LABELS, type Gesture } from '../../data/gestures';

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

/** Fiche d'un geste : à quoi il sert, vidéo de démonstration, 3 étapes et un conseil. */
export default function GestureCard({ gesture }: { gesture: Gesture }) {
  const online = useOnline();
  return (
    <div className="stack gesture-card">
      <div className="row">
        <span className={`chip level-${gesture.level}`}>{LEVEL_LABELS[gesture.level]}</span>
      </div>
      <p>{gesture.purpose}</p>
      {online ? (
        <div className="video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${gesture.youtubeId}?rel=0`}
            title={`Vidéo : ${gesture.name}`}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="banner">📶 Pas de réseau : la vidéo s’affichera quand tu seras connecté. Les étapes ci-dessous marchent sans réseau.</p>
      )}
      <ol className="steps">
        {gesture.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {gesture.tip && <p className="tip">💡 {gesture.tip}</p>}
      <p className="muted">
        📄 {CHANNEL_SOURCES[gesture.channel]}.{' '}
        <a href={`https://www.youtube.com/watch?v=${gesture.youtubeId}`} target="_blank" rel="noreferrer">
          Ouvrir dans YouTube
        </a>
      </p>
    </div>
  );
}
