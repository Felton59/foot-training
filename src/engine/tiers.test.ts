import { describe, expect, it } from 'vitest';
import { getChallenge } from '../data/challenges';
import {
  bestValue, isBetter, isSuspiciousResult, isValidResultValue, meets, nextStep, rankLabel, reachedRank, stepValue,
} from './tiers';

const jongles = getChallenge('jongles')!;
const tirs = getChallenge('tirs-cadres')!;
const sprint = getChallenge('sprint-20m')!;

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
    expect(isSuspiciousResult(jongles, 5000, null)).toBe(false);
    expect(isSuspiciousResult(sprint, 2.9, 4.5)).toBe(true);
    expect(isSuspiciousResult(sprint, 3.5, 4.5)).toBe(false);
  });
});
