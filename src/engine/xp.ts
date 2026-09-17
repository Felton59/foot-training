import { getChallenge } from '../data/challenges';
import type { AppState, ChallengeResult, CompletedSession } from '../storage/schema';
import { isBetter, reachedRank } from './tiers';
import { weekKey } from './week';

export const XP_RULES = {
  perMinute: 1,
  record: 20,
  tierBronze: 15,
  tierArgent: 25,
  tierOr: 40,
  week: 50,
  weekMinSessions: 3,
};

export interface XpBreakdown {
  sessions: number;
  records: number;
  tiers: number;
  weeks: number;
  total: number;
}

export function sessionMinutes(s: CompletedSession): number {
  return s.items.filter((i) => i.done).reduce((sum, i) => sum + i.durationMin, 0);
}

export function successfulWeeks(sessions: CompletedSession[]): string[] {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    const key = weekKey(new Date(s.date));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, n]) => n >= XP_RULES.weekMinSessions)
    .map(([key]) => key)
    .sort();
}

export function sortResults(results: ChallengeResult[]): ChallengeResult[] {
  return results
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.date < b.r.date ? -1 : a.r.date > b.r.date ? 1 : a.i - b.i))
    .map(({ r }) => r);
}

function tierXp(rank: number): number {
  if (rank === 1) return XP_RULES.tierBronze;
  if (rank === 2) return XP_RULES.tierArgent;
  return XP_RULES.tierOr;
}

export function computeXp(state: Pick<AppState, 'sessions' | 'results'>): XpBreakdown {
  const sessions = state.sessions.reduce((sum, s) => sum + sessionMinutes(s) * XP_RULES.perMinute, 0);

  let records = 0;
  let tiers = 0;
  const best = new Map<string, number>();
  const ranks = new Map<string, number>();
  for (const r of sortResults(state.results)) {
    const ch = getChallenge(r.challengeId);
    if (!ch) continue;
    const prev = best.get(ch.id);
    if (prev === undefined || isBetter(ch, r.value, prev)) {
      if (prev !== undefined) records += XP_RULES.record;
      best.set(ch.id, r.value);
    }
    const prevRank = ranks.get(ch.id) ?? 0;
    const rank = reachedRank(ch, r.value);
    if (rank > prevRank) {
      for (let k = prevRank + 1; k <= rank; k++) tiers += tierXp(k);
      ranks.set(ch.id, rank);
    }
  }

  const weeks = successfulWeeks(state.sessions).length * XP_RULES.week;
  return { sessions, records, tiers, weeks, total: sessions + records + tiers + weeks };
}
