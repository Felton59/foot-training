import { describe, expect, it } from 'vitest';
import { exportFileName, needsBackupReminder, parseBackup, serializeBackup } from './backup';
import { initialState, type AppState, type CompletedSession } from './schema';

const now = new Date(2026, 8, 17, 10);

const sessions = (n: number): CompletedSession[] =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, date: new Date(2026, 8, i + 1).toISOString(), plannedMin: 30, items: [] }));

const withSessions = (n: number, lastBackupAt?: string): AppState => ({ ...initialState(), sessions: sessions(n), lastBackupAt });

describe('backup', () => {
  it('names export files by local date', () => {
    expect(exportFileName(now)).toBe('foot-training-2026-09-17.json');
  });

  it('round-trips a backup', () => {
    const state: AppState = { ...withSessions(2), profile: { name: 'Léo', avatar: '⚽', equipment: ['ballon'] } };
    expect(parseBackup(serializeBackup(state))).toEqual({ ok: true, state });
  });

  it('rejects files that are not JSON', () => {
    expect(parseBackup('hello')).toEqual({ ok: false, error: 'Ce fichier n\'est pas une sauvegarde valide.' });
  });

  it('rejects JSON with the wrong shape', () => {
    const result = parseBackup(JSON.stringify({ version: 1, sessions: 3 }));
    expect(result.ok).toBe(false);
  });

  it('reminds to back up after 5 sessions when never or long ago', () => {
    expect(needsBackupReminder(withSessions(4), now)).toBe(false);
    expect(needsBackupReminder(withSessions(5), now)).toBe(true);
    expect(needsBackupReminder(withSessions(5, new Date(2026, 8, 7).toISOString()), now)).toBe(false);
    expect(needsBackupReminder(withSessions(5, new Date(2026, 7, 15).toISOString()), now)).toBe(true);
  });
});
