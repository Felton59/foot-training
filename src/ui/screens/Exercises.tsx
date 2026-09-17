import { useState } from 'react';
import { EXERCISES, getExercise } from '../../data/exercises';
import { groupExercisesByKind } from '../../engine/library';
import { DOMAIN_LABELS, EQUIPMENT_LABELS, type AppState, type Equipment } from '../../storage/schema';
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

export default function Exercises({ state }: { state: AppState }) {
  const [selectedId, setSelected] = useState<string | null>(null);
  const setSelectedId = (id: string | null) => {
    setSelected(id);
    window.scrollTo(0, 0);
  };
  const owned = state.profile?.equipment ?? [];
  const selected = selectedId ? getExercise(selectedId) : undefined;

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
        {selected.stopwatch && <Stopwatch />}
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Exercices 📋</h1>
      <p className="muted">
        {EXERCISES.length} exercices. L’app les choisit pour tes séances ; touche un exercice pour voir comment le faire.
      </p>
      {groupExercisesByKind(EXERCISES).map((group) => (
        <section key={group.kind} className="stack">
          <h2>
            {KIND_ICONS[group.kind]} {DOMAIN_LABELS[group.kind]} ({group.exercises.length})
          </h2>
          {group.exercises.map((e) => {
            const available = e.equipment.every((q) => owned.includes(q));
            return (
              <button key={e.id} className="list-button" onClick={() => setSelectedId(e.id)}>
                <span>
                  <strong>{e.name}</strong>
                  <br />
                  <span className="muted">
                    {e.durationMin} min · {equipmentText(e.equipment)}
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
