import { useEffect, useRef } from 'react';
import { DRIBBLES, getDribble } from '../../data/dribbles';
import { EXERCISES, getExercise } from '../../data/exercises';
import { exerciseFor, isDoable } from '../../engine/goal';
import { groupExercisesByKind } from '../../engine/library';
import { DOMAIN_LABELS, EQUIPMENT_LABELS, type AppState, type Equipment } from '../../storage/schema';
import DribbleCard from '../components/DribbleCard';
import DribbleLinks from '../components/DribbleLinks';
import ExerciseDiagram from '../components/ExerciseDiagram';
import Stopwatch from '../components/Stopwatch';

const KIND_ICONS: Record<string, string> = {
  echauffement: '🔥',
  technique: '⚽',
  'passes-tirs': '🎯',
  physique: '🏃',
  gardien: '🧤',
  'retour-calme': '😌',
};

const equipmentText = (equipment: Equipment[]) =>
  equipment.length ? equipment.map((e) => EQUIPMENT_LABELS[e]).join(', ') : 'Aucun matériel';

const DRIBBLE_LIST = 'dribbles';
const DRIBBLE_PREFIX = 'dribble:';
const LEVEL_LABELS = { facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile' } as const;

interface Props {
  state: AppState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function Exercises({ state, selectedId, onSelect: setSelectedId }: Props) {
  const listScroll = useRef(0);
  useEffect(() => {
    window.scrollTo(0, selectedId ? 0 : listScroll.current);
  }, [selectedId]);
  const owned = state.profile?.equipment ?? [];
  const found = selectedId ? getExercise(selectedId) : undefined;
  const selected = found ? exerciseFor(found, owned) : undefined;

  if (selectedId === DRIBBLE_LIST) {
    return (
      <div className="stack">
        <button className="link" onClick={() => setSelectedId(null)}>
          ← Tous les exercices
        </button>
        <h1>Les dribbles 🎬</h1>
        <p className="muted">Du plus facile au plus difficile. Touche un dribble pour voir la vidéo et les étapes.</p>
        {DRIBBLES.map((d) => (
          <button key={d.id} className="list-button" onClick={() => setSelectedId(DRIBBLE_PREFIX + d.id)}>
            <span>
              <strong>{d.name}</strong>
              <br />
              <span className="muted">{d.purpose}</span>
            </span>
            <span className={`chip level-${d.level}`}>{LEVEL_LABELS[d.level]}</span>
          </button>
        ))}
      </div>
    );
  }

  const dribble = selectedId?.startsWith(DRIBBLE_PREFIX) ? getDribble(selectedId.slice(DRIBBLE_PREFIX.length)) : undefined;
  if (dribble) {
    return (
      <div className="stack">
        <button className="link" onClick={() => setSelectedId(null)}>
          ← Tous les dribbles
        </button>
        <h1>{dribble.name}</h1>
        <DribbleCard dribble={dribble} />
      </div>
    );
  }

  if (selected) {
    const missing = selected.equipment.filter((e) => !owned.includes(e));
    return (
      <div className="stack">
        <button className="link" onClick={() => setSelectedId(null)}>
          ← Tous les exercices
        </button>
        <h1>{selected.name}</h1>
        <div className="row">
          <span className="chip">{DOMAIN_LABELS[selected.domain]}</span>
          <span className="chip">{selected.durationMin} min</span>
        </div>
        <p className="muted">Matériel : {equipmentText(selected.equipment)}</p>
        {missing.length > 0 && <p className="banner">Il te faut : {missing.map((e) => EQUIPMENT_LABELS[e]).join(', ')}.</p>}
        {selected.diagram && <ExerciseDiagram diagram={selected.diagram} title={selected.name} />}
        <ol className="steps">
          {selected.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        {selected.tip && <p className="tip">💡 {selected.tip}</p>}
        {selected.dribbles && <DribbleLinks ids={selected.dribbles} />}
        {selected.stopwatch && <Stopwatch />}
        {selected.source && <p className="muted">📄 D'après : {selected.source}</p>}
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Exercices 📋</h1>
      <p className="muted">
        {EXERCISES.length} exercices. L’app les choisit pour tes séances ; touche un exercice pour voir comment le faire.
      </p>
      <button
        className="list-button"
        onClick={() => {
          listScroll.current = window.scrollY;
          setSelectedId(DRIBBLE_LIST);
        }}
      >
        <span>
          <strong>🎬 Les dribbles en vidéo</strong>
          <br />
          <span className="muted">{DRIBBLES.length} gestes expliqués : crochet, feinte de corps, roulette…</span>
        </span>
      </button>
      {groupExercisesByKind(EXERCISES).map((group) => (
        <section key={group.kind} className="stack">
          <h2>
            {KIND_ICONS[group.kind]} {DOMAIN_LABELS[group.kind]} ({group.exercises.length})
          </h2>
          {group.exercises.map((e) => {
            const available = isDoable(e, owned);
            return (
              <button key={e.id} className="list-button" onClick={() => {
                  listScroll.current = window.scrollY;
                  setSelectedId(e.id);
                }}>
                <span>
                  <strong>{e.name}</strong>
                  <br />
                  <span className="muted">
                    {e.durationMin} min · {equipmentText(exerciseFor(e, owned).equipment)}
                  </span>
                </span>
                {!available && <span className="chip">Matériel manquant</span>}
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}
