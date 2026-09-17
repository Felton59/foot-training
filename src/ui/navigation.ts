export type Tab = 'home' | 'exercises' | 'challenges' | 'progress' | 'settings';

/** Écran affiché. `depth` = nombre d'entrées d'historique au-dessus de l'accueil. */
export interface Route {
  tab: Tab;
  detail: string | null;
  session: boolean;
  depth: number;
}

export const HOME: Route = { tab: 'home', detail: null, session: false, depth: 0 };

export type TabChange =
  | { kind: 'none' }
  | { kind: 'push'; next: Route }
  | { kind: 'replace'; next: Route }
  /** Revenir de `steps` entrées, puis ouvrir `thenTab` (null = rester sur l'accueil / la liste). */
  | { kind: 'back'; steps: number; thenTab: Tab | null };

const tabRoute = (tab: Tab): Route => ({ ...HOME, tab, depth: 1 });

export function planTabChange(route: Route, tab: Tab): TabChange {
  if (route.depth === 0) return tab === 'home' ? { kind: 'none' } : { kind: 'push', next: tabRoute(tab) };
  if (!route.detail && !route.session) {
    if (tab === route.tab) return { kind: 'none' };
    if (tab === 'home') return { kind: 'back', steps: route.depth, thenTab: null };
    return { kind: 'replace', next: tabRoute(tab) };
  }
  if (route.detail && tab === route.tab) return { kind: 'back', steps: 1, thenTab: null };
  return { kind: 'back', steps: route.depth, thenTab: tab === 'home' ? null : tab };
}

export function detailRoute(route: Route, detail: string): Route {
  return { ...route, detail, depth: route.depth + 1 };
}

export function sessionRoute(route: Route): Route {
  return { ...route, session: true, depth: route.depth + 1 };
}
