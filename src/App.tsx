import { useState } from 'react';
import { buildSession } from './engine/sessionBuilder';
import type { Duration } from './storage/schema';
import { abandonSession, setProfile, startSession } from './ui/actions';
import Challenges from './ui/screens/Challenges';
import Exercises from './ui/screens/Exercises';
import Home from './ui/screens/Home';
import Onboarding from './ui/screens/Onboarding';
import Progress from './ui/screens/Progress';
import SessionScreen from './ui/screens/Session';
import Settings from './ui/screens/Settings';
import type { Tab } from './ui/navigation';
import { useAppState } from './ui/useAppState';
import { useRoute } from './ui/useRoute';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'exercises', label: 'Exercices', icon: '📋' },
  { id: 'challenges', label: 'Défis', icon: '🎯' },
  { id: 'progress', label: 'Progrès', icon: '📈' },
  { id: 'settings', label: 'Réglages', icon: '⚙️' },
];

export default function App() {
  const { state, update, loadStatus, saveFailed } = useAppState();
  const { route, openTab, openDetail, openSession, back } = useRoute();
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
          }}
        />
      </>
    );
  }

  const startNew = (durationMin: Duration) => {
    update((s) =>
      startSession(s, buildSession({ durationMin, equipment: s.profile!.equipment, history: s.sessions, results: s.results }), new Date()),
    );
    openSession();
  };

  if (route.session) {
    return <SessionScreen state={state} update={update} onExit={back} />;
  }

  function renderTab() {
    switch (route.tab) {
      case 'home':
        return (
          <Home
            state={state}
            onStart={startNew}
            onResume={openSession}
            onAbandon={() => update(abandonSession)}
            onBackup={() => openTab('settings')}
          />
        );
      case 'exercises':
        return <Exercises state={state} selectedId={route.detail} onSelect={(id) => (id ? openDetail(id) : back())} />;
      case 'challenges':
        return <Challenges state={state} update={update} selectedId={route.detail} onSelect={(id) => (id ? openDetail(id) : back())} />;
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
          <button key={t.id} className={t.id === route.tab ? 'active' : ''} onClick={() => openTab(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
