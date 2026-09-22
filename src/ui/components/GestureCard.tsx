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
  const videoUrl = `https://www.youtube.com/watch?v=${gesture.youtubeId}`;
  return (
    <div className="stack gesture-card">
      <div className="row">
        <span className={`chip level-${gesture.level}`}>{LEVEL_LABELS[gesture.level]}</span>
      </div>
      <p>{gesture.purpose}</p>
      {online ? (
        <a className="video" href={videoUrl} target="_blank" rel="noreferrer" aria-label={`Voir la vidéo « ${gesture.name} » dans YouTube`}>
          <img src={`https://i.ytimg.com/vi/${gesture.youtubeId}/hqdefault.jpg`} alt="" />
          <span className="video-play">▶</span>
          <span className="video-label">Voir dans YouTube</span>
        </a>
      ) : (
        <p className="banner">📶 Pas de réseau : la vidéo s’ouvrira quand tu seras connecté. Les étapes ci-dessous marchent sans réseau.</p>
      )}
      <ol className="steps">
        {gesture.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {gesture.tip && <p className="tip">💡 {gesture.tip}</p>}
      <p className="muted">
        📄 {CHANNEL_SOURCES[gesture.channel]}.
      </p>
    </div>
  );
}
