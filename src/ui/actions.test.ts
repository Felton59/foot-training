import { describe, expect, it } from 'vitest';
import { initialState, type AppState, type SessionPlan } from '../storage/schema';
import {
  abandonSession, addResult, beginExercises, canResume, completeCurrent, finishSession, startSession, summarizeChange,
} from './actions';

const now = new Date('2026-09-17T16:00:00.000Z');
const later = (min: number) => new Date(now.getTime() + min * 60_000);

const plan: SessionPlan = {
  durationMin: 30,
  challengeId: 'jongles',
  items: [
    { exerciseId: 'ech-toe-taps', domain: 'echauffement', durationMin: 5 },
    { exerciseId: 'tech-feintes', domain: 'technique', durationMin: 17 },
    { exerciseId: 'calme-bilan', domain: 'retour-calme', durationMin: 3 },
  ],
};

const base = (): AppState => ({ ...initialState(), profile: { name: 'Léo', avatar: '⚽', equipment: ['ballon'] } });

function runThrough(s: AppState, flags: boolean[]): AppState {
  let cur = beginExercises(startSession(s, plan, now));
  for (const f of flags) cur = completeCurrent(cur, f);
  return cur;
}

describe('session actions', () => {
  it('starts in preview with the first timer loaded', () => {
    const ip = startSession(base(), plan, now).inProgress!;
    expect(ip).toEqual({ plan, phase: 'preview', currentIndex: 0, remainingSec: 300, done: [false, false, false], startedAt: now.toISOString() });
  });

  it('advances through exercises then to the challenge', () => {
    const mid = runThrough(base(), [true]);
    expect(mid.inProgress).toMatchObject({ phase: 'exercises', currentIndex: 1, remainingSec: 17 * 60, done: [true, false, false] });
    const end = runThrough(base(), [true, false, true]);
    expect(end.inProgress).toMatchObject({ phase: 'challenge', done: [true, false, true] });
  });

  it('ignores completeCurrent outside the exercises phase', () => {
    const s = startSession(base(), plan, now);
    expect(completeCurrent(s, true)).toBe(s);
  });

  it('finishes a session with its challenge result and badges', () => {
    const done = finishSession(runThrough(base(), [true, false, true]), later(40), 12);
    expect(done.inProgress).toBeUndefined();
    expect(done.sessions).toHaveLength(1);
    expect(done.sessions[0].items.map((i) => i.done)).toEqual([true, false, true]);
    expect(done.results).toEqual([{ challengeId: 'jongles', date: later(40).toISOString(), value: 12 }]);
    expect(done.badges.map((b) => b.id)).toEqual(['premier-pas']);
  });

  it('finishes without a result when the challenge is skipped', () => {
    expect(finishSession(runThrough(base(), [true, true, true]), later(40), null).results).toEqual([]);
  });

  it('abandons instead of recording a session when no item was done', () => {
    const s = base();
    const after = finishSession(runThrough(s, [false, false, false]), later(40), 12);
    expect(after.inProgress).toBeUndefined();
    expect(after.sessions).toEqual([]);
    expect(after.results).toEqual([]);
    expect(after.badges).toEqual([]);
    expect(after).toEqual(abandonSession(startSession(s, plan, now)));
  });

  it('abandons a session', () => {
    expect(abandonSession(startSession(base(), plan, now)).inProgress).toBeUndefined();
  });

  it('allows resuming for 12 hours', () => {
    const ip = startSession(base(), plan, now).inProgress!;
    expect(canResume(ip, later(11 * 60))).toBe(true);
    expect(canResume(ip, later(13 * 60))).toBe(false);
  });

  it('summarizes XP, level, badges and records', () => {
    const before = runThrough(base(), [true, false, true]);
    const after = finishSession(before, later(40), 12);
    // 8 done minutes + bronze 15
    expect(summarizeChange(before, after, 'jongles')).toEqual({ xpGained: 23, levelUp: null, newBadgeIds: ['premier-pas'], newRecord: false });
    const again = addResult(after, 'jongles', 300, later(60));
    const summary = summarizeChange(after, again, 'jongles');
    expect(summary.newRecord).toBe(true);
    expect(summary.levelUp).toBe('Espoir');
  });
});
