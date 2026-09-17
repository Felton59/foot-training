import { ALL_EQUIPMENT, DURATIONS, initialState, STATE_VERSION, type AppState } from './schema';

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STORAGE_KEY = 'foot-training:state';

export type LoadStatus = 'ok' | 'empty' | 'corrupt' | 'unavailable';

export interface LoadResult {
  status: LoadStatus;
  state: AppState;
  corruptKey?: string;
}

type Migration = (s: Record<string, unknown>) => Record<string, unknown>;

/** MIGRATIONS[n] upgrades a version-n state to version n + 1. */
export const MIGRATIONS: Record<number, Migration> = {};

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isStr = (x: unknown): x is string => typeof x === 'string';
const isSessionItem = (item: unknown): item is Record<string, unknown> =>
  isObj(item) && isStr(item.exerciseId) && isStr(item.domain) &&
  typeof item.durationMin === 'number' && Number.isFinite(item.durationMin) &&
  typeof item.done === 'boolean';
const isPlanItem = (item: unknown): item is Record<string, unknown> =>
  isObj(item) && isStr(item.exerciseId) && isStr(item.domain) &&
  typeof item.durationMin === 'number' && Number.isFinite(item.durationMin);
const isFiniteNumber = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

export function isInProgress(x: unknown): boolean {
  if (!isObj(x)) return false;
  const plan = x.plan;
  if (!isObj(plan) || !DURATIONS.includes(plan.durationMin as never)) return false;
  if (plan.challengeId !== null && !isStr(plan.challengeId)) return false;
  if (!Array.isArray(plan.items) || !plan.items.every(isPlanItem)) return false;
  if (x.phase !== 'preview' && x.phase !== 'exercises' && x.phase !== 'challenge') return false;
  if (!Number.isInteger(x.currentIndex) || (x.currentIndex as number) < 0) return false;
  if (!isFiniteNumber(x.remainingSec) || x.remainingSec < 0) return false;
  if (!Array.isArray(x.done) || x.done.length !== plan.items.length || !x.done.every((d) => typeof d === 'boolean')) return false;
  if (!isStr(x.startedAt)) return false;
  return true;
}

export function isAppState(x: unknown): x is AppState {
  if (!isObj(x) || x.version !== STATE_VERSION) return false;
  const p = x.profile;
  const validProfile =
    p === null ||
    (isObj(p) && isStr(p.name) && isStr(p.avatar) && Array.isArray(p.equipment) &&
      p.equipment.every((e) => ALL_EQUIPMENT.includes(e as never)));
  if (!validProfile) return false;
  const validSessions =
    Array.isArray(x.sessions) &&
    x.sessions.every((s) => isObj(s) && isStr(s.id) && isStr(s.date) && DURATIONS.includes(s.plannedMin as never) && Array.isArray(s.items) && s.items.every(isSessionItem));
  if (!validSessions) return false;
  const validResults =
    Array.isArray(x.results) &&
    x.results.every((r) => isObj(r) && isStr(r.challengeId) && isStr(r.date) && typeof r.value === 'number' && Number.isFinite(r.value));
  if (!validResults) return false;
  const validBadges = Array.isArray(x.badges) && x.badges.every((b) => isObj(b) && isStr(b.id) && isStr(b.earnedAt));
  if (!validBadges) return false;
  if (x.lastBackupAt !== undefined && !isStr(x.lastBackupAt)) return false;
  if (x.inProgress !== undefined && !isInProgress(x.inProgress)) return false;
  return true;
}

export function migrate(raw: unknown): AppState {
  if (!isObj(raw) || typeof raw.version !== 'number') throw new Error('Données illisibles.');
  if (raw.version > STATE_VERSION) {
    throw new Error('Cette sauvegarde vient d\'une version plus récente de l\'application.');
  }
  let current = raw;
  for (let v = raw.version; v < STATE_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`Migration manquante depuis la version ${v}.`);
    current = step(current);
  }
  if (isObj(current) && current.inProgress !== undefined && !isInProgress(current.inProgress)) {
    const { inProgress: _dropped, ...rest } = current;
    current = rest;
  }
  if (!isAppState(current)) throw new Error('Données invalides.');
  return current;
}

export function loadState(kv: KV | null, now: Date): LoadResult {
  if (!kv) return { status: 'unavailable', state: initialState() };
  const raw = kv.getItem(STORAGE_KEY);
  if (raw === null) return { status: 'empty', state: initialState() };
  try {
    return { status: 'ok', state: migrate(JSON.parse(raw)) };
  } catch {
    const corruptKey = `foot-training:corrupt-${now.toISOString().replace(/[:.]/g, '-')}`;
    try {
      kv.setItem(corruptKey, raw);
    } catch {
      // best-effort backup; still proceed to clear the corrupt main key
    }
    kv.removeItem(STORAGE_KEY);
    return { status: 'corrupt', state: initialState(), corruptKey };
  }
}

export function saveState(kv: KV | null, state: AppState): boolean {
  if (!kv) return false;
  try {
    kv.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
