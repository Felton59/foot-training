import { useEffect, useState } from 'react';
import { elapsedTenths, secondsInputText } from '../stopwatch';

/** Chrono Départ / Arrivée au dixième de seconde. */
export default function Stopwatch({ onStop }: { onStop?: (seconds: number) => void }) {
  const [startAt, setStartAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [stopped, setStopped] = useState(false);
  const running = startAt !== null && !stopped;

  useEffect(() => {
    if (startAt === null || stopped) return;
    const id = setInterval(() => setElapsed(elapsedTenths(startAt, performance.now())), 100);
    return () => clearInterval(id);
  }, [startAt, stopped]);

  const start = () => {
    setElapsed(0);
    setStopped(false);
    setStartAt(performance.now());
  };

  const stop = () => {
    if (startAt === null) return;
    const seconds = elapsedTenths(startAt, performance.now());
    setElapsed(seconds);
    setStopped(true);
    onStop?.(seconds);
  };

  const reset = () => {
    setStartAt(null);
    setStopped(false);
    setElapsed(0);
  };

  return (
    <div className="stack stopwatch">
      <span className="muted">⏱ Chrono</span>
      <div className={`timer stopwatch-time ${stopped ? 'over' : ''}`}>{secondsInputText(elapsed)} s</div>
      {running ? (
        <button className="btn btn-primary btn-big" onClick={stop}>⏹ Arrivée</button>
      ) : stopped ? (
        <button className="btn" onClick={reset}>↺ Recommencer</button>
      ) : (
        <button className="btn btn-primary btn-big" onClick={start}>▶ Départ</button>
      )}
    </div>
  );
}
