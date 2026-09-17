import { describe, expect, it } from 'vitest';
import type { Challenge } from '../data/types';
import {
  bestValue, isBetter, isSuspiciousResult, isValidResultValue, meets, nextStep, rankLabel, reachedRank, stepValue,
} from './tiers';

const fixture = (c: Partial<Challenge> & Pick<Challenge, 'better' | 'tiers'>): Challenge =>
  ({ id: 'x', name: 'x', domain: 'technique', unit: 'u', equipment: [], howTo: ['a', 'b'], ...c });
const jongles = fixture({ better: 'higher', unit: 'jongles', tiers: { bronze: 10, argent: 25, or: 50 } });
const tirs = fixture({ better: 'higher', unit: '/10', tiers: { bronze: 5, argent: 7, or: 9 }, maxValue: 10 });
const sprint = fixture({ better: 'lower', unit: 's', tiers: { bronze: 5.0, argent: 4.5, or: 4.1 }, minValue: 3.5 });

describe('tiers', () => {
  it('labels ranks', () => {
    expect([0, 1, 2, 3, 4, 6].map(rankLabel)).toEqual(['', 'Bronze', 'Argent', 'Or', 'Or +1', 'Or +3']);
  });

  it('compares according to direction', () => {
    expect(meets(jongles, 10, 10)).toBe(true);
    expect(meets(sprint, 4.6, 4.5)).toBe(false);
    expect(isBetter(sprint, 4.4, 4.5)).toBe(true);
    expect(isBetter(jongles, 10, 10)).toBe(false);
  });

  it('extends steps beyond gold', () => {
    expect([1, 2, 3, 4, 5].map((r) => stepValue(jongles, r))).toEqual([10, 25, 50, 75, 100]);
    expect(stepValue(jongles, 0)).toBeNull();
  });

  it('clamps steps to bounds once', () => {
    expect(stepValue(tirs, 4)).toBe(10);
    expect(stepValue(tirs, 5)).toBeNull();
    expect(stepValue(sprint, 4)).toBe(3.7);
    expect(stepValue(sprint, 5)).toBe(3.5);
    expect(stepValue(sprint, 6)).toBeNull();
  });

  it('computes reached rank', () => {
    expect(reachedRank(jongles, 9)).toBe(0);
    expect(reachedRank(jongles, 10)).toBe(1);
    expect(reachedRank(jongles, 60)).toBe(3);
    expect(reachedRank(jongles, 100)).toBe(5);
    expect(reachedRank(sprint, 4.6)).toBe(1);
    expect(reachedRank(sprint, 3.5)).toBe(5);
    expect(reachedRank(tirs, 10)).toBe(4);
  });

  it('finds the next step', () => {
    expect(nextStep(jongles, null)).toEqual({ rank: 1, label: 'Bronze', value: 10 });
    expect(nextStep(jongles, 30)).toEqual({ rank: 3, label: 'Or', value: 50 });
    expect(nextStep(tirs, 10)).toBeNull();
  });

  it('finds the best value', () => {
    expect(bestValue(sprint, [5, 4.2, 4.8])).toBe(4.2);
    expect(bestValue(jongles, [12, 30, 8])).toBe(30);
    expect(bestValue(jongles, [])).toBeNull();
  });

  it('validates result values', () => {
    expect(isValidResultValue(tirs, 0)).toBe(true);
    expect(isValidResultValue(tirs, 11)).toBe(false);
    expect(isValidResultValue(sprint, 0)).toBe(false);
    expect(isValidResultValue(jongles, Number.NaN)).toBe(false);
    expect(isValidResultValue(jongles, -1)).toBe(false);
  });

  it('flags suspicious results', () => {
    expect(isSuspiciousResult(jongles, 45, 20)).toBe(true);
    expect(isSuspiciousResult(jongles, 35, 20)).toBe(false);
    expect(isSuspiciousResult(jongles, 8, 3)).toBe(false);
    expect(isSuspiciousResult(sprint, 2.9, 4.5)).toBe(true);
    expect(isSuspiciousResult(sprint, 3.5, 4.5)).toBe(false);
  });

  it('flags suspicious first results (no previous record)', () => {
    // jongles.tiers.or === 50 (from earlier test), so >100 is suspicious, <=100 is not
    expect(isSuspiciousResult(jongles, 101, null)).toBe(true);
    expect(isSuspiciousResult(jongles, 99, null)).toBe(false);
    expect(isSuspiciousResult(jongles, 5000, null)).toBe(true);
    // sprint.better === 'lower', or === 3.9 (from tiers data) -> lower than or/1.5 is suspicious
    expect(isSuspiciousResult(sprint, sprint.tiers.or / 1.5 - 0.01, null)).toBe(true);
    expect(isSuspiciousResult(sprint, sprint.tiers.or, null)).toBe(false);
  });

  it('rejects non-integer values for non-second units', () => {
    expect(isValidResultValue(jongles, 7.5)).toBe(false);
    expect(isValidResultValue(jongles, 7)).toBe(true);
    expect(isValidResultValue(sprint, 4.5)).toBe(true);
  });

  it('rejects values below minValue for lower-is-better challenges', () => {
    expect(sprint.minValue).toBe(3.5);
    expect(isValidResultValue(sprint, 3.4)).toBe(false);
    expect(isValidResultValue(sprint, 3.5)).toBe(true);
  });
});
