import { useRef, useState } from 'react';
import { exportFileName, parseBackup, serializeBackup } from '../../storage/backup';
import { initialState, type AppState } from '../../storage/schema';
import { markBackup, setProfile } from '../actions';
import { AVATARS } from '../avatars';
import EquipmentPicker from '../components/EquipmentPicker';
import { formatDate } from '../format';
import { downloadText } from '../lib/download';

interface Props {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
}

export default function Settings({ state, update }: Props) {
  const profile = state.profile!;
  const [name, setName] = useState(profile.name);
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const now = new Date();
    downloadText(exportFileName(now), serializeBackup(markBackup(state, now)));
    update((s) => markBackup(s, now));
    setMessage('💾 Sauvegarde téléchargée. Garde ce fichier en lieu sûr (Drive, e-mail…).');
  };

  const importBackup = async (file: File) => {
    const result = parseBackup(await file.text());
    if (!result.ok) {
      setMessage(`❌ ${result.error}`);
      return;
    }
    if (!window.confirm('Remplacer toutes les données actuelles par cette sauvegarde ?')) return;
    update(() => result.state);
    setName(result.state.profile?.name ?? '');
    setMessage('✅ Sauvegarde restaurée.');
  };

  const reset = () => {
    if (!window.confirm('Effacer toute la progression ? Cette action est définitive.')) return;
    if (!window.confirm('Vraiment tout effacer ? Pense à exporter une sauvegarde avant.')) return;
    update(() => initialState());
  };

  return (
    <div className="stack">
      <h1>Réglages ⚙️</h1>
      {message && <p className="card">{message}</p>}

      <h2>Profil</h2>
      <label className="field">
        Prénom
        <input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
      </label>
      <button
        className="btn"
        disabled={!name.trim() || name.trim() === profile.name}
        onClick={() => update((s) => setProfile(s, { ...profile, name: name.trim() }))}
      >
        Enregistrer le prénom
      </button>
      <div className="avatar-grid">
        {AVATARS.map((a) => (
          <button
            key={a}
            className={`avatar ${a === profile.avatar ? 'selected' : ''}`}
            aria-label={`Avatar ${a}`}
            onClick={() => update((s) => setProfile(s, { ...profile, avatar: a }))}
          >
            {a}
          </button>
        ))}
      </div>

      <h2>Matériel disponible</h2>
      <p className="muted">Les séances et les défis ne proposent que ce que tu peux faire avec ce matériel.</p>
      <EquipmentPicker value={profile.equipment} onChange={(equipment) => update((s) => setProfile(s, { ...profile, equipment }))} />

      <h2>Sauvegarde</h2>
      <p className="muted">
        {state.lastBackupAt ? `Dernière sauvegarde : ${formatDate(state.lastBackupAt)}` : 'Aucune sauvegarde pour l’instant.'}
      </p>
      <button className="btn btn-primary" onClick={exportBackup}>Exporter la sauvegarde</button>
      <button className="btn" onClick={() => fileInput.current?.click()}>Importer une sauvegarde</button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void importBackup(file);
        }}
      />

      <h2>Zone dangereuse</h2>
      <button className="btn btn-danger" onClick={reset}>Tout effacer</button>
    </div>
  );
}
