import { levelFor } from '../../engine/levels';
import { weekActivity } from '../../engine/stats';
import { computeXp } from '../../engine/xp';
import { needsBackupReminder } from '../../storage/backup';
import { DURATIONS, type AppState, type Duration } from '../../storage/schema';
import { canResume } from '../actions';
import WeekDots from '../components/WeekDots';
import XpBar from '../components/XpBar';

interface Props {
  state: AppState;
  onStart: (d: Duration) => void;
  onResume: () => void;
  onAbandon: () => void;
  onBackup: () => void;
}

export default function Home({ state, onStart, onResume, onAbandon, onBackup }: Props) {
  const now = new Date();
  const xp = computeXp(state).total;
  const level = levelFor(xp);
  const days = weekActivity(state.sessions, now);
  const weekCount = days.reduce((sum, d) => sum + d.count, 0);
  const ip = state.inProgress;

  return (
    <div className="stack">
      <h1>
        {state.profile?.avatar} Salut {state.profile?.name} !
      </h1>

      <section className="card stack">
        <div className="row spread">
          <strong>
            {level.level.emoji} {level.level.name}
          </strong>
          <span className="muted">{xp} XP</span>
        </div>
        <XpBar progress={level.progress} />
        <span className="muted">
          {level.next ? `Encore ${level.next.minXp - xp} XP pour devenir ${level.next.name}` : 'Niveau maximum atteint, bravo !'}
        </span>
      </section>

      <section className="card stack">
        <strong>Cette semaine</strong>
        <WeekDots days={days} />
        <span className="muted">
          {weekCount >= 3 ? `Semaine réussie ! 🌟 (${weekCount} séances)` : `${weekCount} séance${weekCount > 1 ? 's' : ''} — objectif : 3 à 5`}
        </span>
      </section>

      {needsBackupReminder(state, now) && (
        <section className="card stack">
          <span>💾 Pense à sauvegarder ta progression.</span>
          <button className="btn" onClick={onBackup}>Sauvegarder</button>
        </section>
      )}

      {ip && canResume(ip, now) ? (
        <section className="card stack">
          <strong>Séance en cours ({ip.plan.durationMin} min)</strong>
          <button className="btn btn-primary btn-big" onClick={onResume}>▶ Reprendre</button>
          <button className="btn btn-danger" onClick={onAbandon}>Abandonner</button>
        </section>
      ) : ip ? (
        <section className="card stack">
          <span>Ta dernière séance n’a pas été terminée.</span>
          <button className="btn" onClick={onAbandon}>La laisser tomber</button>
        </section>
      ) : (
        <section className="stack">
          <h2>Commencer une séance</h2>
          {DURATIONS.map((d) => (
            <button key={d} className="btn btn-primary btn-big" onClick={() => onStart(d)}>
              ⚽ {d} minutes
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
