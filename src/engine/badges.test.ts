import { describe, expect, it } from 'vitest';
import { BADGES } from '../data/badges';
import { initialState, type AppState, type ChallengeResult, type CompletedSession } from '../storage/schema';
import { awardNewBadges, BADGE_RULES, earnedBadgeIds, longestWeekStreak } from './badges';

const session = (d: Date): CompletedSession => ({
  id: d.toISOString(),
  date: d.toISOString(),
  plannedMin: 30,
  items: [{ exerciseId: 'tech-feintes', domain: 'technique', durationMin: 10, done: true }],
});

const res = (challengeId: string, value: number): ChallengeResult => ({
  challengeId,
  value,
  date: new Date(2026, 8, 14, 18).toISOString(),
});

const state = (patch: Partial<AppState>): AppState => ({ ...initialState(), ...patch });

describe('badge rules', () => {
  it('has one rule per badge definition', () => {
    expect(Object.keys(BADGE_RULES).sort()).toEqual(BADGES.map((b) => b.id).sort());
  });

  it('earns nothing on an empty state', () => {
    expect(earnedBadgeIds(state({}))).toEqual([]);
  });

  it('counts sessions', () => {
    expect(earnedBadgeIds(state({ sessions: [session(new Date(2026, 8, 14))] }))).toEqual(['premier-pas']);
    const ten = Array.from({ length: 10 }, (_, i) => session(new Date(2026, 0, 1 + i * 7)));
    expect(earnedBadgeIds(state({ sessions: ten }))).toContain('regulier');
  });

  it('computes week streaks', () => {
    expect(longestWeekStreak(['2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21'])).toBe(4);
    expect(longestWeekStreak(['2026-08-31', '2026-09-07', '2026-09-21', '2026-09-28'])).toBe(2);
    expect(longestWeekStreak([])).toBe(0);
  });

  it('awards successful week badges', () => {
    const weeks = (n: number, skipSecond = false) =>
      Array.from({ length: n }, (_, w) => w)
        .filter((w) => !(skipSecond && w === 1))
        .flatMap((w) => [0, 1, 2].map((d) => session(new Date(2026, 7, 31 + 7 * w + d, 17))));
    expect(earnedBadgeIds(state({ sessions: weeks(1) }))).toContain('semaine-or');
    expect(earnedBadgeIds(state({ sessions: weeks(4) }))).toContain('serie-4');
    expect(earnedBadgeIds(state({ sessions: weeks(5, true) }))).not.toContain('serie-4');
  });

  it('awards challenge badges', () => {
    const ids = earnedBadgeIds(state({
      results: [res('jongles-pied-fort', 50), res('defi-tir-pied-faible', 9), res('sprint-20m', 4.0), res('defi-tir', 15), res('arrets-gardien', 8)],
    }));
    expect(ids).toEqual(expect.arrayContaining(['jongles-50', 'pied-gauche', 'fusee', 'sniper', 'mur']));
  });

  it('requires bronze in every domain for touche-a-tout', () => {
    const three = [res('jongles-pied-fort', 10), res('defi-passe-dosee', 15), res('allers-retours-1min', 3)];
    expect(earnedBadgeIds(state({ results: three }))).not.toContain('touche-a-tout');
    expect(earnedBadgeIds(state({ results: [...three, res('arrets-gardien', 4)] }))).toContain('touche-a-tout');
  });

  it('requires gold on 5 challenges for collectionneur', () => {
    const golds = [res('jongles-pied-fort', 30), res('controles', 9), res('defi-passe-dosee', 35), res('defi-tir', 11)];
    expect(earnedBadgeIds(state({ results: golds }))).not.toContain('collectionneur');
    expect(earnedBadgeIds(state({ results: [...golds, res('allers-retours-1min', 5)] }))).toContain('collectionneur');
  });

  it('returns only new badges', () => {
    const now = new Date(2026, 8, 17, 18);
    const s = state({
      sessions: [session(new Date(2026, 8, 14))],
      results: [res('defi-tir', 15)],
      badges: [{ id: 'premier-pas', earnedAt: '2026-09-14T17:00:00.000Z' }],
    });
    expect(awardNewBadges(s, now)).toEqual([{ id: 'sniper', earnedAt: now.toISOString() }]);
  });
});
