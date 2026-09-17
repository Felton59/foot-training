import { CHALLENGES } from '../data/challenges';
import { EXERCISES } from '../data/exercises';
import type { Challenge, Exercise } from '../data/types';
import {
  ALL_DOMAINS,
  type ChallengeResult,
  type CompletedSession,
  type Domain,
  type Duration,
  type Equipment,
  type ExerciseKind,
  type SessionItem,
  type SessionPlan,
} from '../storage/schema';

export type Rng = () => number;

export const CHALLENGE_MIN = 5;
export const SPLIT_BLOCK_MIN = 10;

export const STRUCTURE: Record<Duration, { warmup: number; blocks: number; cooldown: number }> = {
  30: { warmup: 5, blocks: 2, cooldown: 3 },
  45: { warmup: 5, blocks: 3, cooldown: 5 },
  60: { warmup: 7, blocks: 4, cooldown: 5 },
};

export interface BuildInput {
  durationMin: Duration;
  equipment: Equipment[];
  history: CompletedSession[];
  results: ChallengeResult[];
  rng?: Rng;
  exercises?: Exercise[];
  challenges?: Challenge[];
}

export function splitMinutes(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  return Array.from({ length: parts }, (_, i) => (i === parts - 1 ? total - base * (parts - 1) : base));
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const hasEquipment = (needed: Equipment[], owned: Equipment[]) => needed.every((q) => owned.includes(q));

export function buildSession(input: BuildInput): SessionPlan {
  const rng = input.rng ?? Math.random;
  const structure = STRUCTURE[input.durationMin];
  const exercises = (input.exercises ?? EXERCISES).filter((e) => hasEquipment(e.equipment, input.equipment));
  const challenges = (input.challenges ?? CHALLENGES).filter((c) => hasEquipment(c.equipment, input.equipment));
  const history = [...input.history].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const lastIds = new Set(history[0]?.items.map((i) => i.exerciseId) ?? []);
  const used = new Set<string>();

  const pick = (kind: ExerciseKind, count: number): Exercise[] => {
    const pool = exercises.filter((e) => e.domain === kind && !used.has(e.id));
    const fresh = pool.filter((e) => !lastIds.has(e.id));
    const repeats = pool.filter((e) => lastIds.has(e.id));
    const chosen = [...shuffle(fresh, rng), ...shuffle(repeats, rng)].slice(0, count);
    chosen.forEach((e) => used.add(e.id));
    return chosen;
  };

  const lastSeen = (d: Domain) => {
    const i = history.findIndex((s) => s.items.some((it) => it.domain === d));
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  const gardienAllowed = !history.slice(0, 2).some((s) => s.items.some((i) => i.domain === 'gardien'));
  const candidates = ALL_DOMAINS.filter(
    (d) => (d !== 'gardien' || gardienAllowed) && exercises.some((e) => e.domain === d),
  ).sort((a, b) => {
    const la = lastSeen(a);
    const lb = lastSeen(b);
    return la === lb ? 0 : la > lb ? -1 : 1;
  });

  const blockTotal = input.durationMin - structure.warmup - structure.cooldown - CHALLENGE_MIN;
  const planned = splitMinutes(blockTotal, structure.blocks);
  const blocks: { domain: Domain; exercises: Exercise[] }[] = [];
  const maxAttempts = candidates.length * structure.blocks;
  for (let attempt = 0; attempt < maxAttempts && blocks.length < structure.blocks; attempt++) {
    const domain = candidates[attempt % candidates.length];
    const count = planned[blocks.length] >= SPLIT_BLOCK_MIN ? 2 : 1;
    const picked = pick(domain, count);
    if (picked.length > 0) blocks.push({ domain, exercises: picked });
  }

  const items: SessionItem[] = [];
  const warmup = pick('echauffement', 1)[0];
  if (warmup) items.push({ exerciseId: warmup.id, domain: 'echauffement', durationMin: structure.warmup });

  const blockMinutes = splitMinutes(blockTotal, blocks.length);
  blocks.forEach((block, i) => {
    splitMinutes(blockMinutes[i], block.exercises.length).forEach((minutes, j) => {
      items.push({ exerciseId: block.exercises[j].id, domain: block.domain, durationMin: minutes });
    });
  });

  const cooldown = pick('retour-calme', 1)[0];
  if (cooldown) items.push({ exerciseId: cooldown.id, domain: 'retour-calme', durationMin: structure.cooldown });

  const domains = new Set(blocks.map((b) => b.domain));
  const lastAttempt = (id: string) =>
    input.results.filter((r) => r.challengeId === id).reduce((latest, r) => (r.date > latest ? r.date : latest), '');
  const challenge =
    challenges
      .filter((c) => domains.has(c.domain))
      .map((c) => ({ c, last: lastAttempt(c.id) }))
      .sort((a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : 0))[0]?.c ?? null;

  return { durationMin: input.durationMin, items, challengeId: challenge?.id ?? null };
}
