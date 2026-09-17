import { describe, expect, it } from 'vitest';
import { CHALLENGES } from '../data/challenges';
import { EXERCISES } from '../data/exercises';
import { elapsedTenths, secondsInputText } from './stopwatch';

describe('stopwatch helpers', () => {
  it('rounds elapsed time to the tenth of a second', () => {
    expect(elapsedTenths(1000, 5649)).toBe(4.6);
    expect(elapsedTenths(1000, 5650)).toBe(4.7);
    expect(elapsedTenths(1000, 1000)).toBe(0);
  });

  it('never returns a negative time', () => {
    expect(elapsedTenths(5000, 4000)).toBe(0);
  });

  it('formats seconds for the French result input', () => {
    expect(secondsInputText(4.6)).toBe('4,6');
    expect(secondsInputText(12)).toBe('12,0');
  });
});

describe('timed content', () => {
  it('gives a stopwatch to every challenge measured in seconds', () => {
    for (const c of CHALLENGES) {
      if (c.unit === 's') expect(c.timer, c.id).toEqual({ kind: 'stopwatch' });
    }
  });

  it('gives countdowns to the fixed-duration challenges', () => {
    const countdowns = CHALLENGES.filter((c) => c.timer?.kind === 'countdown');
    expect(countdowns.map((c) => [c.id, c.timer])).toEqual([
      ['allers-retours-1min', { kind: 'countdown', seconds: 60 }],
    ]);
  });

  it('bases the physical challenge on an FFF sheet instead of the 5-10-5 shuttle', () => {
    expect(CHALLENGES.find((c) => c.id === 'navette-5-10-5')).toBeUndefined();
    expect(CHALLENGES.find((c) => c.id === 'allers-retours-1min')?.source).toMatch(/^FFF – District de la Mayenne/);
  });

  it('gives a stopwatch to the timed exercises', () => {
    expect(EXERCISES.filter((e) => e.stopwatch).map((e) => e.id)).toEqual(['pt-10-buts-or', 'pt-beret-tir', 'phy-parcours']);
  });
});
