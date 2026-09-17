import { getChallenge } from '../data/challenges';
import { awardNewBadges } from '../engine/badges';
import { levelFor } from '../engine/levels';
import { bestValue, isBetter } from '../engine/tiers';
import { computeXp } from '../engine/xp';
import type { AppState, CompletedSession, InProgressSession, Profile, SessionPlan } from '../storage/schema';

export const RESUME_MAX_MS = 12 * 3_600_000;

export function withBadges(s: AppState, now: Date): AppState {
  const fresh = awardNewBadges(s, now);
  return fresh.length ? { ...s, badges: [...s.badges, ...fresh] } : s;
}

export function setProfile(s: AppState, profile: Profile): AppState {
  return { ...s, profile };
}

export function startSession(s: AppState, plan: SessionPlan, now: Date): AppState {
  return {
    ...s,
    inProgress: {
      plan,
      phase: 'preview',
      currentIndex: 0,
      remainingSec: (plan.items[0]?.durationMin ?? 0) * 60,
      done: plan.items.map(() => false),
      startedAt: now.toISOString(),
    },
  };
}

export function updateProgress(s: AppState, patch: Partial<InProgressSession>): AppState {
  return s.inProgress ? { ...s, inProgress: { ...s.inProgress, ...patch } } : s;
}

export function beginExercises(s: AppState): AppState {
  return updateProgress(s, { phase: 'exercises' });
}

export function completeCurrent(s: AppState, done: boolean): AppState {
  const ip = s.inProgress;
  if (!ip || ip.phase !== 'exercises') return s;
  const flags = ip.done.map((d, i) => (i === ip.currentIndex ? done : d));
  const next = ip.currentIndex + 1;
  if (next >= ip.plan.items.length) {
    return { ...s, inProgress: { ...ip, done: flags, currentIndex: next, remainingSec: 0, phase: 'challenge' } };
  }
  return { ...s, inProgress: { ...ip, done: flags, currentIndex: next, remainingSec: ip.plan.items[next].durationMin * 60 } };
}

export function abandonSession(s: AppState): AppState {
  const { inProgress: _dropped, ...rest } = s;
  return rest;
}

export function finishSession(s: AppState, now: Date, challengeValue: number | null): AppState {
  const ip = s.inProgress;
  if (!ip) return s;
  const session: CompletedSession = {
    id: `s-${now.getTime().toString(36)}`,
    date: now.toISOString(),
    plannedMin: ip.plan.durationMin,
    items: ip.plan.items.map((item, i) => ({ ...item, done: ip.done[i] ?? false })),
  };
  const results =
    challengeValue !== null && ip.plan.challengeId
      ? [...s.results, { challengeId: ip.plan.challengeId, date: now.toISOString(), value: challengeValue }]
      : s.results;
  return withBadges({ ...abandonSession(s), sessions: [...s.sessions, session], results }, now);
}

export function addResult(s: AppState, challengeId: string, value: number, now: Date): AppState {
  return withBadges({ ...s, results: [...s.results, { challengeId, date: now.toISOString(), value }] }, now);
}

export function markBackup(s: AppState, now: Date): AppState {
  return { ...s, lastBackupAt: now.toISOString() };
}

export function canResume(ip: InProgressSession, now: Date): boolean {
  return now.getTime() - new Date(ip.startedAt).getTime() < RESUME_MAX_MS;
}

export interface ChangeSummary {
  xpGained: number;
  levelUp: string | null;
  newBadgeIds: string[];
  newRecord: boolean;
}

export function summarizeChange(before: AppState, after: AppState, challengeId: string | null): ChangeSummary {
  const xpBefore = computeXp(before).total;
  const xpAfter = computeXp(after).total;
  const levelBefore = levelFor(xpBefore);
  const levelAfter = levelFor(xpAfter);
  const owned = new Set(before.badges.map((b) => b.id));

  let newRecord = false;
  const ch = challengeId ? getChallenge(challengeId) : undefined;
  if (ch) {
    const valuesOf = (s: AppState) => s.results.filter((r) => r.challengeId === ch.id).map((r) => r.value);
    const prev = bestValue(ch, valuesOf(before));
    const next = bestValue(ch, valuesOf(after));
    newRecord = prev !== null && next !== null && isBetter(ch, next, prev);
  }

  return {
    xpGained: xpAfter - xpBefore,
    levelUp: levelAfter.index > levelBefore.index ? levelAfter.level.name : null,
    newBadgeIds: after.badges.filter((b) => !owned.has(b.id)).map((b) => b.id),
    newRecord,
  };
}
