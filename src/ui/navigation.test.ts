import { describe, expect, it } from 'vitest';
import { detailRoute, HOME, planTabChange, sessionRoute, type Route } from './navigation';

const tabRoute = (tab: Route['tab']): Route => ({ ...HOME, tab, depth: 1 });

describe('navigation', () => {
  it('starts on home with nothing to go back to', () => {
    expect(HOME).toEqual({ tab: 'home', detail: null, session: false, depth: 0 });
  });

  it('pushes a history entry when leaving home for another tab', () => {
    expect(planTabChange(HOME, 'exercises')).toEqual({ kind: 'push', next: tabRoute('exercises') });
    expect(planTabChange(HOME, 'home')).toEqual({ kind: 'none' });
  });

  it('replaces the entry when switching between two other tabs, so back always returns home', () => {
    expect(planTabChange(tabRoute('exercises'), 'challenges')).toEqual({ kind: 'replace', next: tabRoute('challenges') });
    expect(planTabChange(tabRoute('exercises'), 'exercises')).toEqual({ kind: 'none' });
  });

  it('goes back through history when returning home', () => {
    expect(planTabChange(tabRoute('progress'), 'home')).toEqual({ kind: 'back', steps: 1, thenTab: null });
  });

  it('closes an open detail when its tab is tapped again', () => {
    const detail = detailRoute(tabRoute('exercises'), 'tech-slalom');
    expect(planTabChange(detail, 'exercises')).toEqual({ kind: 'back', steps: 1, thenTab: null });
  });

  it('unwinds a detail before opening another tab', () => {
    const detail = detailRoute(tabRoute('exercises'), 'tech-slalom');
    expect(planTabChange(detail, 'challenges')).toEqual({ kind: 'back', steps: 2, thenTab: 'challenges' });
    expect(planTabChange(detail, 'home')).toEqual({ kind: 'back', steps: 2, thenTab: null });
  });

  it('stacks details and sessions on top of the current route', () => {
    expect(detailRoute(tabRoute('challenges'), 'defi-tir')).toEqual({ tab: 'challenges', detail: 'defi-tir', session: false, depth: 2 });
    expect(sessionRoute(HOME)).toEqual({ tab: 'home', detail: null, session: true, depth: 1 });
  });
});
