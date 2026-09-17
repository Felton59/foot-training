import { describe, expect, it } from 'vitest';
import type { CompletedSession } from '../storage/schema';
import { minutesByDomain, weekActivity } from './stats';

const s = (d: Date): CompletedSession => ({ id: d.toISOString(), date: d.toISOString(), plannedMin: 30, items: [] });

describe('weekActivity', () => {
  it('counts sessions per day of the current week', () => {
    const now = new Date(2026, 8, 17, 12); // Thursday
    const sessions = [s(new Date(2026, 8, 13, 18)), s(new Date(2026, 8, 14, 18)), s(new Date(2026, 8, 17, 9)), s(new Date(2026, 8, 17, 18))];
    const days = weekActivity(sessions, now);
    expect(days.map((d) => d.dateKey)).toEqual(['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20']);
    expect(days.map((d) => d.count)).toEqual([1, 0, 0, 2, 0, 0, 0]);
    expect(days.findIndex((d) => d.isToday)).toBe(3);
  });
});

describe('minutesByDomain', () => {
  it('sums done minutes per domain over the last 4 weeks', () => {
    const now = new Date(2026, 8, 17, 12); // Thursday; window starts Monday 2026-08-24
    const make = (d: Date, items: CompletedSession['items']): CompletedSession => ({ id: d.toISOString(), date: d.toISOString(), plannedMin: 30, items });
    const sessions = [
      make(new Date(2026, 7, 23, 18), [{ exerciseId: 'a', domain: 'technique', durationMin: 50, done: true }]),
      make(new Date(2026, 7, 24, 18), [
        { exerciseId: 'b', domain: 'technique', durationMin: 10, done: true },
        { exerciseId: 'c', domain: 'echauffement', durationMin: 5, done: true },
      ]),
      make(new Date(2026, 8, 16, 18), [
        { exerciseId: 'd', domain: 'gardien', durationMin: 8, done: true },
        { exerciseId: 'e', domain: 'physique', durationMin: 6, done: false },
      ]),
    ];
    expect(minutesByDomain(sessions, now)).toEqual({ technique: 10, 'passes-tirs': 0, physique: 0, gardien: 8 });
  });
});
