import { describe, expect, it } from 'vitest';
import { getChallenge } from '../data/challenges';
import { EXERCISES, getExercise } from '../data/exercises';
import { DURATIONS, type CompletedSession, type Domain, type Equipment, type SessionPlan } from '../storage/schema';
import { buildSession, CHALLENGE_MIN, splitMinutes, STRUCTURE } from './sessionBuilder';

const ALL: Equipment[] = ['ballon', 'plots', 'grand-espace'];
const zero = () => 0;

const blockItems = (p: SessionPlan) => p.items.filter((i) => i.domain !== 'echauffement' && i.domain !== 'retour-calme');
const blockDomains = (p: SessionPlan) => [...new Set(blockItems(p).map((i) => i.domain))];
const total = (p: SessionPlan) => p.items.reduce((s, i) => s + i.durationMin, 0);

const asHistory = (plan: SessionPlan, date: string): CompletedSession => ({
  id: date,
  date,
  plannedMin: plan.durationMin,
  items: plan.items.map((i) => ({ ...i, done: true })),
});

const fakeSession = (date: string, domains: Domain[]): CompletedSession => ({
  id: date,
  date,
  plannedMin: 30,
  items: domains.map((d) => ({ exerciseId: `x-${d}`, domain: d, durationMin: 8, done: true })),
});

describe('splitMinutes', () => {
  it('splits evenly with the remainder last', () => {
    expect(splitMinutes(17, 2)).toEqual([8, 9]);
    expect(splitMinutes(43, 4)).toEqual([10, 10, 10, 13]);
    expect(splitMinutes(5, 0)).toEqual([]);
  });
});

describe('buildSession', () => {
  it.each(DURATIONS)('builds a complete %i-minute session', (d) => {
    const plan = buildSession({ durationMin: d, equipment: ALL, history: [], results: [], rng: zero });
    expect(plan.durationMin).toBe(d);
    expect(total(plan) + CHALLENGE_MIN).toBe(d);
    expect(plan.items[0].domain).toBe('echauffement');
    expect(plan.items[0].durationMin).toBe(STRUCTURE[d].warmup);
    expect(plan.items.at(-1)!.domain).toBe('retour-calme');
    expect(blockDomains(plan)).toHaveLength(STRUCTURE[d].blocks);
    expect(plan.challengeId).not.toBeNull();
    expect(new Set(plan.items.map((i) => i.exerciseId)).size).toBe(plan.items.length);
  });

  it('only uses available equipment', () => {
    const plan = buildSession({ durationMin: 60, equipment: ['ballon'], history: [], results: [], rng: zero });
    for (const item of plan.items) {
      expect(getExercise(item.exerciseId)!.equipment.every((q) => q === 'ballon'), item.exerciseId).toBe(true);
    }
    expect(getChallenge(plan.challengeId!)!.equipment.every((q) => q === 'ballon')).toBe(true);
  });

  it('still works without any equipment', () => {
    const plan = buildSession({ durationMin: 30, equipment: [], history: [], results: [], rng: zero });
    expect(blockDomains(plan)).toEqual(['physique']);
    expect(plan.challengeId).toBeNull();
  });

  it('rotates to the least recently worked domains', () => {
    const history = [fakeSession('2026-09-16T17:00:00.000Z', ['technique', 'passes-tirs'])];
    const plan = buildSession({ durationMin: 30, equipment: ALL, history, results: [], rng: zero });
    expect(blockDomains(plan)).toEqual(['physique', 'gardien']);
  });

  it('keeps gardien to at most 1 session in 3', () => {
    const recent = [
      fakeSession('2026-09-16T17:00:00.000Z', ['technique']),
      fakeSession('2026-09-15T17:00:00.000Z', ['gardien']),
    ];
    const blocked = buildSession({ durationMin: 60, equipment: ALL, history: recent, results: [], rng: zero });
    expect(blockDomains(blocked)).not.toContain('gardien');

    const older = [...recent.slice(0, 1), fakeSession('2026-09-15T17:00:00.000Z', ['technique']), fakeSession('2026-09-14T17:00:00.000Z', ['gardien'])];
    const allowed = buildSession({ durationMin: 60, equipment: ALL, history: older, results: [], rng: zero });
    expect(blockDomains(allowed)).toContain('gardien');
  });

  it('avoids exercises from the previous session', () => {
    const first = buildSession({ durationMin: 45, equipment: ALL, history: [], results: [], rng: zero });
    const firstIds = new Set(first.items.map((i) => i.exerciseId));
    const second = buildSession({ durationMin: 45, equipment: ALL, history: [asHistory(first, '2026-09-16T17:00:00.000Z')], results: [], rng: zero });
    for (const item of second.items) expect(firstIds.has(item.exerciseId), item.exerciseId).toBe(false);
  });

  it('falls back when a domain has no exercises', () => {
    const exercises = EXERCISES.filter((e) => e.domain !== 'physique' && e.domain !== 'gardien');
    const plan = buildSession({ durationMin: 60, equipment: ALL, history: [], results: [], rng: zero, exercises });
    expect(blockDomains(plan).every((d) => d === 'technique' || d === 'passes-tirs')).toBe(true);
    expect(total(plan) + CHALLENGE_MIN).toBe(60);
  });

  it('picks the least recently attempted challenge of a session domain', () => {
    const results = [{ challengeId: 'jongles-pied-fort', date: '2026-09-16T18:00:00.000Z', value: 12 }];
    const plan = buildSession({ durationMin: 30, equipment: ALL, history: [], results, rng: zero });
    const ch = getChallenge(plan.challengeId!)!;
    expect(ch.id).not.toBe('jongles-pied-fort');
    expect(blockDomains(plan)).toContain(ch.domain);
  });
});
