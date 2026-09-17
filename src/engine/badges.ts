import { CHALLENGES, getChallenge } from '../data/challenges';
import { ALL_DOMAINS, type AppState, type EarnedBadge } from '../storage/schema';
import { bestValue, reachedRank } from './tiers';
import { addDays, parseDateKey, toDateKey } from './week';
import { successfulWeeks } from './xp';

export interface BadgeFacts {
  sessionCount: number;
  weeks: string[];
  best: (challengeId: string) => number | null;
  rank: (challengeId: string) => number;
}

export function longestWeekStreak(weekKeys: string[]): number {
  const sorted = [...weekKeys].sort();
  let longest = 0;
  let current = 0;
  for (let i = 0; i < sorted.length; i++) {
    const follows = i > 0 && toDateKey(addDays(parseDateKey(sorted[i - 1]), 7)) === sorted[i];
    current = follows ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

export const BADGE_RULES: Record<string, (f: BadgeFacts) => boolean> = {
  'premier-pas': (f) => f.sessionCount >= 1,
  regulier: (f) => f.sessionCount >= 10,
  acharne: (f) => f.sessionCount >= 50,
  'semaine-or': (f) => f.weeks.length >= 1,
  'serie-4': (f) => longestWeekStreak(f.weeks) >= 4,
  'jongles-50': (f) => (f.best('jongles') ?? 0) >= 50,
  'pied-gauche': (f) => f.rank('jongles-pied-faible') >= 3 || f.rank('tirs-pied-faible') >= 3,
  fusee: (f) => f.rank('sprint-20m') >= 3,
  sniper: (f) => (f.best('tirs-cadres') ?? 0) >= 10,
  mur: (f) => f.rank('arrets-gardien') >= 3,
  'touche-a-tout': (f) =>
    ALL_DOMAINS.every((d) => CHALLENGES.some((c) => c.domain === d && f.rank(c.id) >= 1)),
  collectionneur: (f) => CHALLENGES.filter((c) => f.rank(c.id) >= 3).length >= 5,
};

function facts(state: Pick<AppState, 'sessions' | 'results'>): BadgeFacts {
  const best = (id: string) => {
    const ch = getChallenge(id);
    if (!ch) return null;
    return bestValue(ch, state.results.filter((r) => r.challengeId === id).map((r) => r.value));
  };
  const rank = (id: string) => {
    const ch = getChallenge(id);
    const b = best(id);
    return ch && b !== null ? reachedRank(ch, b) : 0;
  };
  return { sessionCount: state.sessions.length, weeks: successfulWeeks(state.sessions), best, rank };
}

export function earnedBadgeIds(state: Pick<AppState, 'sessions' | 'results'>): string[] {
  const f = facts(state);
  return Object.keys(BADGE_RULES).filter((id) => BADGE_RULES[id](f));
}

export function awardNewBadges(state: AppState, now: Date): EarnedBadge[] {
  const owned = new Set(state.badges.map((b) => b.id));
  return earnedBadgeIds(state)
    .filter((id) => !owned.has(id))
    .map((id) => ({ id, earnedAt: now.toISOString() }));
}
