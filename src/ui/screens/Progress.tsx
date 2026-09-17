import { BADGES } from '../../data/badges';
import { getExercise } from '../../data/exercises';
import { levelFor } from '../../engine/levels';
import { minutesByDomain } from '../../engine/stats';
import { computeXp, sessionMinutes } from '../../engine/xp';
import { ALL_DOMAINS, DOMAIN_LABELS, type AppState } from '../../storage/schema';
import { formatDate } from '../format';

export default function Progress({ state }: { state: AppState }) {
  const xp = computeXp(state);
  const level = levelFor(xp.total);
  const earned = new Map(state.badges.map((b) => [b.id, b.earnedAt]));
  const minutes = minutesByDomain(state.sessions, new Date());
  const maxMinutes = Math.max(1, ...Object.values(minutes));
  const history = [...state.sessions].reverse().slice(0, 20);

  return (
    <div className="stack">
      <h1>Progrès 📈</h1>

      <section className="card stack">
        <strong>
          {level.level.emoji} {level.level.name} · {xp.total} XP
        </strong>
        <span className="muted">
          Séances {xp.sessions} · Records {xp.records} · Paliers {xp.tiers} · Semaines réussies {xp.weeks}
        </span>
      </section>

      <h2>
        Badges ({earned.size}/{BADGES.length})
      </h2>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const at = earned.get(b.id);
          return (
            <div key={b.id} className={`badge ${at ? '' : 'locked'}`} title={b.description}>
              <span className="emoji">{b.emoji}</span>
              <strong>{b.name}</strong>
              <br />
              <span className="muted">{at ? formatDate(at) : b.description}</span>
            </div>
          );
        })}
      </div>

      <h2>Minutes par domaine (4 semaines)</h2>
      <div className="card bars">
        {ALL_DOMAINS.map((d) => (
          <div key={d} className="bar-row">
            <span>{DOMAIN_LABELS[d]}</span>
            <div className="bar" style={{ width: `${(minutes[d] / maxMinutes) * 100}%` }} />
            <span>{minutes[d]} min</span>
          </div>
        ))}
      </div>

      <h2>Dernières séances</h2>
      {history.length === 0 && <p className="muted">Pas encore de séance. Lance-toi depuis l’accueil !</p>}
      {history.map((s) => {
        const domains = [...new Set(s.items.map((i) => i.domain).filter((d) => (ALL_DOMAINS as string[]).includes(d)))];
        return (
          <div key={s.id} className="card">
            <div className="row spread">
              <strong>{formatDate(s.date)}</strong>
              <span className="muted">
                {sessionMinutes(s)} / {s.plannedMin} min
              </span>
            </div>
            <span className="muted">
              {domains.map((d) => DOMAIN_LABELS[d]).join(' · ')} — {s.items.filter((i) => i.done).length} exercices faits
              {s.items.some((i) => !getExercise(i.exerciseId)) ? ' (dont des exercices supprimés)' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
