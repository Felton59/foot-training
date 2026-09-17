import { useState } from 'react';
import type { Challenge } from '../../data/types';
import { isSuspiciousResult, isValidResultValue, nextStep } from '../../engine/tiers';
import { formatValue } from '../format';

interface Props {
  challenge: Challenge;
  best: number | null;
  onSubmit: (value: number) => void;
  submitLabel?: string;
}

export default function ChallengeInput({ challenge, best, onSubmit, submitLabel = 'Enregistrer' }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const next = nextStep(challenge, best);

  const submit = () => {
    const value = Number(text.trim().replace(',', '.'));
    if (text.trim() === '' || !isValidResultValue(challenge, value)) {
      setError(
        challenge.better === 'lower'
          ? 'Entre un temps plus grand que 0 (par exemple 4,5).'
          : challenge.maxValue !== undefined
            ? `Entre un nombre entre 0 et ${challenge.maxValue}.`
            : 'Entre un nombre positif.',
      );
      return;
    }
    if (
      isSuspiciousResult(challenge, value, best) &&
      !window.confirm(`${formatValue(value)} ${challenge.unit} ? C’est beaucoup mieux que ton record (${formatValue(best!)}). Tu confirmes ?`)
    ) {
      return;
    }
    setError(null);
    setText('');
    onSubmit(value);
  };

  return (
    <div className="card stack">
      <div className="row spread">
        <span>
          Record : <strong>{best === null ? '—' : `${formatValue(best)} ${challenge.unit}`}</strong>
        </span>
        {next && (
          <span className="muted">
            {next.label} : {formatValue(next.value)} {challenge.unit}
          </span>
        )}
      </div>
      <label className="field">
        Ton résultat ({challenge.unit})
        <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      {error && (
        <p role="alert" className="btn-danger">
          {error}
        </p>
      )}
      <button className="btn btn-primary" onClick={submit}>
        {submitLabel}
      </button>
    </div>
  );
}
