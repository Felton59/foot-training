import { describe, expect, it } from 'vitest';
import { addDays, parseDateKey, startOfWeek, toDateKey, weekKey } from './week';

describe('week', () => {
  it('formats local date keys', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('starts weeks on Monday', () => {
    // 2026-09-17 is a Thursday
    expect(toDateKey(startOfWeek(new Date(2026, 8, 17, 15, 0)))).toBe('2026-09-14');
    expect(weekKey(new Date(2026, 8, 14, 0, 0))).toBe('2026-09-14');
    expect(weekKey(new Date(2026, 8, 20, 22, 0))).toBe('2026-09-14');
    expect(weekKey(new Date(2026, 8, 21, 8, 0))).toBe('2026-09-21');
  });

  it('crosses month and year boundaries', () => {
    expect(weekKey(new Date(2027, 0, 1))).toBe('2026-12-28');
    expect(toDateKey(addDays(new Date(2026, 8, 28), 7))).toBe('2026-10-05');
  });

  it('parses date keys to local midnight', () => {
    const d = parseDateKey('2026-09-14');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 8, 14, 0]);
  });
});
