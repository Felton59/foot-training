import { useState } from 'react';
import { beep, unlockAudio } from '../lib/sound';
import { useCountdown } from '../useCountdown';

/** Compte à rebours de durée fixe, avec bip au départ et à la fin. */
export default function ChallengeCountdown({ seconds }: { seconds: number }) {
  const [round, setRound] = useState(0);
  return <CountdownRound key={round} seconds={seconds} onReset={() => setRound((r) => r + 1)} />;
}

function CountdownRound({ seconds, onReset }: { seconds: number; onReset: () => void }) {
  const [ended, setEnded] = useState(false);
  const timer = useCountdown(seconds, () => {
    setEnded(true);
    beep();
  });

  return (
    <div className="stack stopwatch">
      <span className="muted">⏱ Compte à rebours</span>
      <div className={`timer stopwatch-time ${ended ? 'over' : ''}`}>{timer.remaining} s</div>
      {ended ? (
        <>
          <p className="celebrate">⏰ Stop ! Entre ton résultat ci-dessous.</p>
          <button className="btn" onClick={onReset}>↺ Recommencer</button>
        </>
      ) : timer.running ? (
        <button className="btn" onClick={onReset}>⏹ Arrêter</button>
      ) : (
        <button
          className="btn btn-primary btn-big"
          onClick={() => {
            unlockAudio();
            beep();
            timer.start();
          }}
        >
          ▶ Lancer {seconds} s
        </button>
      )}
    </div>
  );
}
