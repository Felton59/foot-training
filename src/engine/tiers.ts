import type { Challenge } from '../data/types';

export interface TierStep {
  rank: number;
  label: string;
  value: number;
}

const MAX_RANK = 1000;
const round2 = (v: number) => Math.round(v * 100) / 100;

export function rankLabel(rank: number): string {
  if (rank <= 0) return '';
  if (rank === 1) return 'Bronze';
  if (rank === 2) return 'Argent';
  if (rank === 3) return 'Or';
  return `Or +${rank - 3}`;
}

export function meets(ch: Challenge, value: number, target: number): boolean {
  return ch.better === 'higher' ? value >= target : value <= target;
}

export function isBetter(ch: Challenge, a: number, b: number): boolean {
  return ch.better === 'higher' ? a > b : a < b;
}

export function stepValue(ch: Challenge, rank: number): number | null {
  if (rank < 1) return null;
  const { bronze, argent, or } = ch.tiers;
  if (rank === 1) return bronze;
  if (rank === 2) return argent;
  if (rank === 3) return or;
  const prev = stepValue(ch, rank - 1);
  if (prev === null) return null;
  const gap = Math.abs(or - argent);
  if (ch.better === 'higher') {
    const v = round2(or + gap * (rank - 3));
    if (ch.maxValue === undefined || v <= ch.maxValue) return v;
    return prev < ch.maxValue ? ch.maxValue : null;
  }
  const v = round2(or - gap * (rank - 3));
  if (ch.minValue === undefined || v >= ch.minValue) return v;
  return prev > ch.minValue ? ch.minValue : null;
}

export function reachedRank(ch: Challenge, value: number): number {
  let rank = 0;
  for (let r = 1; r < MAX_RANK; r++) {
    const target = stepValue(ch, r);
    if (target === null || !meets(ch, value, target)) break;
    rank = r;
  }
  return rank;
}

export function nextStep(ch: Challenge, best: number | null): TierStep | null {
  const rank = best === null ? 1 : reachedRank(ch, best) + 1;
  const value = stepValue(ch, rank);
  return value === null ? null : { rank, label: rankLabel(rank), value };
}

export function bestValue(ch: Challenge, values: number[]): number | null {
  let best: number | null = null;
  for (const v of values) {
    if (best === null || isBetter(ch, v, best)) best = v;
  }
  return best;
}

export function isValidResultValue(ch: Challenge, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (ch.better === 'higher' ? value < 0 : value <= 0) return false;
  return ch.maxValue === undefined || value <= ch.maxValue;
}

export function isSuspiciousResult(ch: Challenge, value: number, best: number | null): boolean {
  if (best === null) return false;
  if (ch.better === 'higher') return value > best * 2 && value - best >= 10;
  return value < best / 1.5;
}
