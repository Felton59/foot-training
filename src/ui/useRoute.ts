import { useCallback, useEffect, useRef, useState } from 'react';
import { detailRoute, HOME, planTabChange, sessionRoute, type Route, type Tab } from './navigation';

/**
 * Navigation reliée à l'historique du navigateur : le bouton « retour » du téléphone
 * ferme l'exercice ou le défi ouvert, puis revient à l'accueil avant de quitter l'app.
 */
export function useRoute() {
  const [route, setRoute] = useState<Route>(HOME);
  const current = useRef(route);
  const pendingTab = useRef<Tab | null>(null);

  const show = useCallback((next: Route) => {
    current.current = next;
    setRoute(next);
  }, []);

  useEffect(() => {
    window.history.replaceState(HOME, '');
    const onPop = (event: PopStateEvent) => {
      const popped = (event.state as Route | null) ?? HOME;
      const tab = pendingTab.current;
      if (tab && popped.depth === 0) {
        pendingTab.current = null;
        const next: Route = { ...HOME, tab, depth: 1 };
        window.history.pushState(next, '');
        show(next);
        return;
      }
      show(popped);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [show]);

  const push = useCallback(
    (next: Route) => {
      window.history.pushState(next, '');
      show(next);
    },
    [show],
  );

  const openTab = useCallback(
    (tab: Tab) => {
      const plan = planTabChange(current.current, tab);
      if (plan.kind === 'push') push(plan.next);
      if (plan.kind === 'replace') {
        window.history.replaceState(plan.next, '');
        show(plan.next);
      }
      if (plan.kind === 'back') {
        pendingTab.current = plan.thenTab;
        window.history.go(-plan.steps);
      }
    },
    [push, show],
  );

  const openDetail = useCallback((id: string) => push(detailRoute(current.current, id)), [push]);
  const openSession = useCallback(() => push(sessionRoute(current.current)), [push]);
  const back = useCallback(() => window.history.back(), []);

  return { route, openTab, openDetail, openSession, back };
}
