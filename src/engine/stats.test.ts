import { describe, expect, it } from 'vitest';
import type { CompletedSession } from '../storage/schema';
import { weekActivity } from './stats';

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
