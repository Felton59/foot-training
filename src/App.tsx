import { useState } from 'react';
import { buildSession } from './engine/sessionBuilder';
import type { Duration } from './storage/schema';
import { abandonSession, setProfile, startSession } from './ui/actions';
import Challenges from './ui/screens/Challenges';
import Home from './ui/screens/Home';
import Onboarding from './ui/screens/Onboarding';
import Progress from './ui/screens/Progress';
import SessionScreen from './ui/screens/Session';
import Settings from './ui/screens/Settings';
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
        <Onboarding
          onDone={(p) => {
            update((s) => setProfile(s, p));
            setTab('home');
          }}
        />
      </>
    );
  }

  const startNew = (durationMin: Duration) => {
    update((s) =>
      startSession(s, buildSession({ durationMin, equipment: s.profile!.equipment, history: s.sessions, results: s.results }), new Date()),
    );
    setInSession(true);
  };

  if (inSession) {
    return (
      <SessionScreen
        state={state}
        update={update}
        onExit={() => {
          setInSession(false);
          setTab('home');
        }}
      />
    );
  }

  function renderTab() {
    switch (tab) {
      case 'home':
        return (
          <Home
            state={state}
            onStart={startNew}
            onResume={() => setInSession(true)}
            onAbandon={() => update(abandonSession)}
            onBackup={() => setTab('settings')}
          />
        );
      case 'challenges':
        return <Challenges state={state} update={update} />;
      case 'progress':
        return <Progress state={state} />;
      case 'settings':
        return <Settings state={state} update={update} />;
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
