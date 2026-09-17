import { useState } from 'react';
import type { Equipment, Profile } from '../../storage/schema';
import { AVATARS } from '../avatars';
import EquipmentPicker from '../components/EquipmentPicker';

export default function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [equipment, setEquipment] = useState<Equipment[]>(['ballon']);

  return (
    <main className="screen">
      <h1>Bienvenue ! ⚽</h1>
      <label className="field">
        Ton prénom
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoFocus />
      </label>
      <h2>Ton avatar</h2>
      <div className="avatar-grid">
        {AVATARS.map((a) => (
          <button key={a} className={`avatar ${a === avatar ? 'selected' : ''}`} onClick={() => setAvatar(a)} aria-label={`Avatar ${a}`}>
            {a}
          </button>
        ))}
      </div>
      <h2>Ton matériel</h2>
      <EquipmentPicker value={equipment} onChange={setEquipment} />
      <button className="btn btn-primary" disabled={!name.trim()} onClick={() => onDone({ name: name.trim(), avatar, equipment })}>
        C’est parti !
      </button>
    </main>
  );
}
