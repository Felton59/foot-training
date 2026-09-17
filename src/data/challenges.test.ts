import { describe, expect, it } from 'vitest';
import { ALL_DOMAINS, ALL_EQUIPMENT } from '../storage/schema';
import { BADGES, getBadge } from './badges';
import { CHALLENGES, getChallenge } from './challenges';

describe('challenges data', () => {
  it('has 10 challenges with unique ids', () => {
    expect(CHALLENGES).toHaveLength(10);
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(10);
  });

  it('covers every domain', () => {
    for (const d of ALL_DOMAINS) {
      expect(CHALLENGES.some((c) => c.domain === d)).toBe(true);
    }
  });

  it.each(CHALLENGES.map((c) => [c.id, c] as const))('%s has consistent tiers and bounds', (_id, c) => {
    const { bronze, argent, or } = c.tiers;
    if (c.better === 'higher') {
      expect(bronze).toBeLessThan(argent);
      expect(argent).toBeLessThan(or);
      if (c.maxValue !== undefined) expect(c.maxValue).toBeGreaterThanOrEqual(or);
      expect(c.minValue).toBeUndefined();
    } else {
      expect(bronze).toBeGreaterThan(argent);
      expect(argent).toBeGreaterThan(or);
      if (c.minValue !== undefined) expect(c.minValue).toBeLessThanOrEqual(or);
      expect(c.maxValue).toBeUndefined();
    }
    expect(c.equipment.every((e) => ALL_EQUIPMENT.includes(e))).toBe(true);
    expect(c.howTo.length).toBeGreaterThanOrEqual(2);
  });

  it('finds challenges by id', () => {
    expect(getChallenge('jongles')?.name).toBe("Jongles d'affilée");
    expect(getChallenge('nope')).toBeUndefined();
  });
});

describe('badges data', () => {
  it('has 12 badges with unique ids', () => {
    expect(BADGES).toHaveLength(12);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(12);
    expect(getBadge('sniper')?.emoji).toBe('🎯');
  });
});
