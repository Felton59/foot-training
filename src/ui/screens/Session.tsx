import { useEffect, useRef, useState } from 'react';
import { getBadge } from '../../data/badges';
import { getChallenge } from '../../data/challenges';
import { getExercise } from '../../data/exercises';
import { bestValue } from '../../engine/tiers';
import { ALL_EQUIPMENT, DOMAIN_LABELS, EQUIPMENT_LABELS, type AppState, type InProgressSession } from '../../storage/schema';
import {
  abandonSession, beginExercises, completeCurrent, finishSession, summarizeChange, updateProgress, type ChangeSummary,
} from '../actions';
import ChallengeInput from '../components/ChallengeInput';
import { beep, unlockAudio } from '../lib/sound';
import { useWakeLock } from '../lib/wakeLock';
import { useCountdown } from '../useCountdown';

type Update = (fn: (s: AppState) => AppState) => void;

interface Props {
  state: AppState;
  update: Update;
  onExit: () => void;
}

export default function SessionScreen({ state, update, onExit }: Props) {
  const [recap, setRecap] = useState<ChangeSummary | null>(null);
  const ip = state.inProgress;
  useWakeLock(ip?.phase === 'exercises');

  if (recap) return <Recap summary={recap} onClose={onExit} />;
  if (!ip) {
    return (
      <main className="screen stack">
        <p>Aucune séance en cours.</p>
        <button className="btn" onClick={onExit}>Retour</button>
      </main>
    );
  }

  const finish = (value: number | null) => {
    const after = finishSession(state, new Date(), value);
    setRecap(summarizeChange(state, after, value !== null ? ip.plan.challengeId : null));
    update(() => after);
  };

  if (ip.phase === 'preview') {
    return (
      <Preview
        ip={ip}
        onGo={() => {
          unlockAudio();
          update(beginExercises);
        }}
        onCancel={() => {
          update(abandonSession);
          onExit();
        }}
      />
    );
  }
  if (ip.phase === 'exercises') {
    return <ExerciseRunner key={ip.currentIndex} ip={ip} update={update} onPause={onExit} />;
  }
  return <ChallengePhase state={state} ip={ip} onFinish={finish} />;
}

function Preview({ ip, onGo, onCancel }: { ip: InProgressSession; onGo: () => void; onCancel: () => void }) {
  const challenge = ip.plan.challengeId ? getChallenge(ip.plan.challengeId) : undefined;
  const needed = new Set([
    ...ip.plan.items.flatMap((i) => getExercise(i.exerciseId)?.equipment ?? []),
    ...(challenge?.equipment ?? []),
  ]);
  return (
    <main className="screen stack">
      <h1>Séance de {ip.plan.durationMin} min</h1>
      {needed.size > 0 && (
        <p className="tip">
          À préparer : {ALL_EQUIPMENT.filter((e) => needed.has(e)).map((e) => EQUIPMENT_LABELS[e]).join(', ')}
        </p>
      )}
      <ol className="steps">
        {ip.plan.items.map((item) => (
          <li key={item.exerciseId}>
            <strong>{getExercise(item.exerciseId)?.name}</strong>{' '}
            <span className="muted">
              · {DOMAIN_LABELS[item.domain]} · {item.durationMin} min
            </span>
          </li>
        ))}
        {challenge && (
          <li>
            <strong>🎯 Défi : {challenge.name}</strong>
          </li>
        )}
      </ol>
      <button className="btn btn-primary btn-big" onClick={onGo}>C’est parti !</button>
      <button className="btn" onClick={onCancel}>Annuler</button>
    </main>
  );
}

function ExerciseRunner({ ip, update, onPause }: { ip: InProgressSession; update: Update; onPause: () => void }) {
  const item = ip.plan.items[ip.currentIndex];
  const exercise = getExercise(item.exerciseId);
  const [ended, setEnded] = useState(ip.remainingSec === 0);
  const timer = useCountdown(ip.remainingSec, () => {
    setEnded(true);
    beep();
  });

  const lastSaved = useRef(ip.remainingSec);
  useEffect(() => {
    if (!timer.running || Math.abs(lastSaved.current - timer.remaining) >= 10) {
      if (lastSaved.current === timer.remaining) return;
      lastSaved.current = timer.remaining;
      update((s) => updateProgress(s, { remainingSec: timer.remaining }));
    }
  }, [timer.remaining, timer.running, update]);

  const total = ip.plan.items.length;
  const minutes = Math.floor(timer.remaining / 60);
  const seconds = String(timer.remaining % 60).padStart(2, '0');

  return (
    <main className="screen stack">
      <div className="row spread muted">
        <span>{DOMAIN_LABELS[item.domain]}</span>
        <span>
          {ip.currentIndex + 1} / {total}
        </span>
        <button className="link" onClick={onPause}>Quitter</button>
      </div>
      <div className="progress-line">
        <div style={{ width: `${(ip.currentIndex / total) * 100}%` }} />
      </div>
      <h1>{exercise?.name ?? item.exerciseId}</h1>
      <div className={`timer ${ended ? 'over' : ''}`}>
        {minutes}:{seconds}
      </div>
      {ended ? (
        <p className="celebrate">⏰ Temps écoulé, passe à la suite !</p>
      ) : timer.running ? (
        <button className="btn" onClick={timer.pause}>⏸ Pause</button>
      ) : (
        <button className="btn btn-primary btn-big" onClick={() => { unlockAudio(); timer.start(); }}>
          ▶ {timer.remaining === item.durationMin * 60 ? 'Démarrer' : 'Reprendre'}
        </button>
      )}
      <ol className="steps">
        {exercise?.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {exercise?.tip && <p className="tip">💡 {exercise.tip}</p>}
      <button className="btn btn-primary btn-big" onClick={() => update((s) => completeCurrent(s, true))}>
        ✅ Exercice fait
      </button>
      <button className="btn" onClick={() => update((s) => completeCurrent(s, false))}>
        ⏭ Passer
      </button>
    </main>
  );
}

function ChallengePhase({ state, ip, onFinish }: { state: AppState; ip: InProgressSession; onFinish: (value: number | null) => void }) {
  const challenge = ip.plan.challengeId ? getChallenge(ip.plan.challengeId) : undefined;
  if (!challenge) {
    return (
      <main className="screen stack">
        <h1>Bravo ! 🎉</h1>
        <p>Pas de défi aujourd’hui.</p>
        <button className="btn btn-primary btn-big" onClick={() => onFinish(null)}>Terminer la séance</button>
      </main>
    );
  }
  const best = bestValue(challenge, state.results.filter((r) => r.challengeId === challenge.id).map((r) => r.value));
  return (
    <main className="screen stack">
      <p className="muted">🎯 Défi du jour</p>
      <h1>{challenge.name}</h1>
      <ol className="steps">
        {challenge.howTo.map((h) => <li key={h}>{h}</li>)}
      </ol>
      <ChallengeInput challenge={challenge} best={best} onSubmit={onFinish} submitLabel="Enregistrer et terminer" />
      <button className="link" onClick={() => onFinish(null)}>Passer le défi et terminer</button>
    </main>
  );
}

function Recap({ summary, onClose }: { summary: ChangeSummary; onClose: () => void }) {
  return (
    <main className="screen stack celebrate">
      <div className="big">{summary.levelUp ? '🏆' : '🎉'}</div>
      <h1>Séance terminée !</h1>
      <div className="timer over">+{summary.xpGained} XP</div>
      {summary.newRecord && <p className="card">🔥 Nouveau record !</p>}
      {summary.levelUp && (
        <p className="card">
          Nouveau niveau : <strong>{summary.levelUp}</strong> !
        </p>
      )}
      {summary.newBadgeIds.length > 0 && (
        <>
          <h2>Nouveaux badges</h2>
          <div className="badge-grid">
            {summary.newBadgeIds.map((id) => {
              const badge = getBadge(id);
              return (
                badge && (
                  <div key={id} className="badge">
                    <span className="emoji">{badge.emoji}</span>
                    {badge.name}
                  </div>
                )
              );
            })}
          </div>
        </>
      )}
      <button className="btn btn-primary btn-big" onClick={onClose}>Retour à l’accueil</button>
    </main>
  );
}
