import { useState } from 'react';
import { getBadge } from '../../data/badges';
import { CHALLENGES, getChallenge } from '../../data/challenges';
import { bestValue, rankLabel, reachedRank } from '../../engine/tiers';
import { DOMAIN_LABELS, EQUIPMENT_LABELS, type AppState } from '../../storage/schema';
import { addResult, summarizeChange, type ChangeSummary } from '../actions';
import ChallengeInput from '../components/ChallengeInput';
import ProgressChart from '../components/ProgressChart';
import { formatValue } from '../format';

interface Props {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
}

function resultMessage(summary: ChangeSummary): string {
  const parts = [summary.newRecord ? '🔥 Nouveau record !' : '✅ Résultat enregistré.'];
  if (summary.xpGained > 0) parts.push(`+${summary.xpGained} XP`);
  if (summary.levelUp) parts.push(`🏆 Nouveau niveau : ${summary.levelUp} !`);
  for (const id of summary.newBadgeIds) {
    const badge = getBadge(id);
    if (badge) parts.push(`${badge.emoji} Badge « ${badge.name} »`);
  }
  return parts.join(' · ');
}

function RankChip({ rank }: { rank: number }) {
  if (rank === 0) return null;
  return <span className={`chip rank-${Math.min(rank, 3)}`}>{rankLabel(rank)}</span>;
}

export default function Challenges({ state, update }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const valuesOf = (id: string) => state.results.filter((r) => r.challengeId === id);
  const selected = selectedId ? getChallenge(selectedId) : undefined;

  if (selected) {
    const results = valuesOf(selected.id);
    const best = bestValue(selected, results.map((r) => r.value));
    const rank = best === null ? 0 : reachedRank(selected, best);
    const owned = state.profile?.equipment ?? [];
    const missing = selected.equipment.filter((e) => !owned.includes(e));

    return (
      <div className="stack">
        <button className="link" onClick={() => { setSelectedId(null); setMessage(null); }}>
          ← Tous les défis
        </button>
        <h1>{selected.name}</h1>
        <div className="row">
          <span className="chip">{DOMAIN_LABELS[selected.domain]}</span>
          <RankChip rank={rank} />
        </div>
        {missing.length > 0 && <p className="banner">Il te faut : {missing.map((e) => EQUIPMENT_LABELS[e]).join(', ')}.</p>}
        <ol className="steps">
          {selected.howTo.map((h) => <li key={h}>{h}</li>)}
        </ol>
        {selected.source && <p className="muted">📄 D'après : {selected.source}</p>}
        {message && <p className="card">{message}</p>}
        <ChallengeInput
          challenge={selected}
          best={best}
          onSubmit={(value) => {
            const after = addResult(state, selected.id, value, new Date());
            setMessage(resultMessage(summarizeChange(state, after, selected.id)));
            update(() => after);
          }}
        />
        <h2>Ma progression</h2>
        <ProgressChart challenge={selected} results={results} />
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Défis 🎯</h1>
      {CHALLENGES.map((c) => {
        const best = bestValue(c, valuesOf(c.id).map((r) => r.value));
        return (
          <button key={c.id} className="list-button" onClick={() => setSelectedId(c.id)}>
            <span>
              <strong>{c.name}</strong>
              <br />
              <span className="muted">
                {DOMAIN_LABELS[c.domain]} · record : {best === null ? '—' : `${formatValue(best)} ${c.unit}`}
              </span>
            </span>
            <RankChip rank={best === null ? 0 : reachedRank(c, best)} />
          </button>
        );
      })}
    </div>
  );
}
