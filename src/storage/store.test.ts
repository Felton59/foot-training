import { afterEach, describe, expect, it } from 'vitest';
import { initialState, type AppState } from './schema';
import { isAppState, loadState, migrate, MIGRATIONS, saveState, STORAGE_KEY, type KV } from './store';

class MemoryKV implements KV {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
  removeItem(k: string) { this.data.delete(k); }
}

const now = new Date('2026-09-17T10:00:00.000Z');

const sample = (): AppState => ({
  ...initialState(),
  profile: { name: 'Léo', avatar: '⚽', equipment: ['ballon', 'plots'] },
  sessions: [{ id: 's1', date: now.toISOString(), plannedMin: 30, items: [{ exerciseId: 'tech-feintes', domain: 'technique', durationMin: 8, done: true }] }],
  results: [{ challengeId: 'jongles', date: now.toISOString(), value: 12 }],
  badges: [{ id: 'premier-pas', earnedAt: now.toISOString() }],
});

describe('store', () => {
  afterEach(() => { delete MIGRATIONS[0]; });

  it('reports unavailable storage', () => {
    expect(loadState(null, now)).toEqual({ status: 'unavailable', state: initialState() });
    expect(saveState(null, initialState())).toBe(false);
  });

  it('starts empty', () => {
    expect(loadState(new MemoryKV(), now)).toEqual({ status: 'empty', state: initialState() });
  });

  it('round-trips a saved state', () => {
    const kv = new MemoryKV();
    expect(saveState(kv, sample())).toBe(true);
    expect(loadState(kv, now)).toEqual({ status: 'ok', state: sample() });
  });

  it('keeps a copy of corrupt data and starts fresh', () => {
    const kv = new MemoryKV();
    kv.setItem(STORAGE_KEY, '{nope');
    const result = loadState(kv, now);
    expect(result.status).toBe('corrupt');
    expect(result.state).toEqual(initialState());
    expect(kv.getItem(result.corruptKey!)).toBe('{nope');
    expect(kv.getItem(STORAGE_KEY)).toBeNull();
  });

  it('treats structurally invalid data as corrupt', () => {
    const kv = new MemoryKV();
    kv.setItem(STORAGE_KEY, JSON.stringify({ ...initialState(), sessions: 'oops' }));
    expect(loadState(kv, now).status).toBe('corrupt');
  });

  it('validates app states', () => {
    expect(isAppState(sample())).toBe(true);
    expect(isAppState({ ...sample(), results: [{ challengeId: 'jongles', date: 'x', value: 'douze' }] })).toBe(false);
    expect(isAppState({ ...sample(), profile: { name: 'Léo', avatar: '⚽', equipment: ['mur'] } })).toBe(false);
  });

  it('rejects newer versions', () => {
    expect(() => migrate({ ...sample(), version: 2 })).toThrow(/plus récente/);
  });

  it('applies migrations in order', () => {
    MIGRATIONS[0] = (s) => ({ ...s, version: 1, badges: [] });
    const migrated = migrate({ version: 0, profile: null, sessions: [], results: [] });
    expect(migrated).toEqual(initialState());
  });

  it('returns false when writing fails', () => {
    const kv = new MemoryKV();
    kv.setItem = () => { throw new Error('QuotaExceededError'); };
    expect(saveState(kv, sample())).toBe(false);
  });
});
