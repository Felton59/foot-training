import { useState } from 'react';
import { setProfile } from './ui/actions';
import Onboarding from './ui/screens/Onboarding';
import { useAppState } from './ui/useAppState';

type Tab = 'home' | 'challenges' | 'progress' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'challenges', label: 'Défis', icon: '🎯' },
  { id: 'progress', label: 'Progrès', icon: '📈' },
  { id: 'settings', label: 'Réglages', icon: '⚙️' },
];

export default function App() {
  const { state, update, loadStatus, saveFailed } = useAppState();
  const [tab, setTab] = useState<Tab>('home');
  const [inSession, setInSession] = useState(false);
  const [corruptDismissed, setCorruptDismissed] = useState(false);

  const banners = (
    <>
      {(loadStatus === 'unavailable' || saveFailed) && (
        <div className="banner">⚠️ La progression ne peut pas être enregistrée sur ce téléphone (navigation privée ?).</div>
      )}
      {loadStatus === 'corrupt' && !corruptDismissed && (
        <div className="banner">
          Les données enregistrées étaient abîmées : une copie a été gardée et l’app repart de zéro. Tu peux importer une sauvegarde dans Réglages.{' '}
          <button className="link" onClick={() => setCorruptDismissed(true)}>OK</button>
        </div>
      )}
    </>
  );

  if (!state.profile) {
    return (
      <>
        {banners}
        <Onboarding onDone={(p) => update((s) => setProfile(s, p))} />
      </>
    );
  }

  // SESSION_SCREEN

  function renderTab() {
    switch (tab) {
      case 'home':
        return <p className="muted">Accueil</p>;
      case 'challenges':
        return <p className="muted">Défis</p>;
      case 'progress':
        return <p className="muted">Progrès</p>;
      case 'settings':
        return <p className="muted">Réglages</p>;
    }
  }

  return (
    <>
      {banners}
      <main className="screen with-tabs">{renderTab()}</main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === tab ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
