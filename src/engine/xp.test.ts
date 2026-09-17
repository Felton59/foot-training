import { describe, expect, it } from 'vitest';
import type { ChallengeResult, CompletedSession } from '../storage/schema';
import { computeXp, sessionMinutes, successfulWeeks } from './xp';

function session(date: Date, doneMin: number, skippedMin = 0): CompletedSession {
  const items = [{ exerciseId: 'tech-feintes', domain: 'technique' as const, durationMin: doneMin, done: true }];
  if (skippedMin) items.push({ exerciseId: 'phy-sprints', domain: 'technique', durationMin: skippedMin, done: false });
  return { id: date.toISOString(), date: date.toISOString(), plannedMin: 30, items };
}

const result = (challengeId: string, day: number, value: number): ChallengeResult => ({
  challengeId,
  date: new Date(2026, 8, day, 18).toISOString(),
  value,
});

describe('xp', () => {
  it('counts only done minutes', () => {
    expect(sessionMinutes(session(new Date(2026, 8, 14), 20, 8))).toBe(20);
  });

  it('detects successful weeks', () => {
    const sessions = [
      session(new Date(2026, 8, 14, 17), 10),
      session(new Date(2026, 8, 16, 17), 10),
      session(new Date(2026, 8, 20, 17), 10),
      session(new Date(2026, 8, 21, 17), 10),
      session(new Date(2026, 8, 22, 17), 10),
    ];
    expect(successfulWeeks(sessions)).toEqual(['2026-09-14']);
  });

  it('gives 1 XP per done minute', () => {
    const xp = computeXp({ sessions: [session(new Date(2026, 8, 14), 25, 5), session(new Date(2026, 8, 15), 40)], results: [] });
    expect(xp).toEqual({ sessions: 65, records: 0, tiers: 0, weeks: 0, total: 65 });
  });

  it('rewards records (not the first result) and first-time tiers', () => {
    const xp = computeXp({ sessions: [], results: [result('defi-passe-dosee', 16, 10), result('defi-passe-dosee', 14, 20), result('defi-passe-dosee', 17, 40)] });
    // sorted: 20 (first, bronze +15), 10 (no), 40 (record +20, argent +25, or +40)
    expect(xp.records).toBe(20);
    expect(xp.tiers).toBe(80);
    expect(xp.total).toBe(100);
  });

  it('awards every tier crossed in one jump', () => {
    const xp = computeXp({ sessions: [], results: [result('defi-passe-dosee', 14, 45)] });
    // bronze 15 + argent 25 + or 40 + Or+1 (45) 40
    expect(xp.tiers).toBe(120);
    expect(xp.records).toBe(0);
  });

  it('does not re-award a tier already reached', () => {
    const xp = computeXp({ sessions: [], results: [result('sprint-20m', 14, 4.9), result('sprint-20m', 15, 4.95), result('sprint-20m', 16, 4.8)] });
    expect(xp.tiers).toBe(15);
    expect(xp.records).toBe(20);
  });

  it('adds the successful week bonus', () => {
    const sessions = [14, 15, 16].map((d) => session(new Date(2026, 8, d, 17), 10));
    expect(computeXp({ sessions, results: [] })).toEqual({ sessions: 30, records: 0, tiers: 0, weeks: 50, total: 80 });
  });

  it('ignores unknown challenges', () => {
    expect(computeXp({ sessions: [], results: [result('ancien-defi', 14, 5)] }).total).toBe(0);
  });
});
