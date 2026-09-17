import { toDateKey } from '../engine/week';
import type { AppState } from './schema';
import { migrate } from './store';

export const BACKUP_REMINDER_DAYS = 30;
export const BACKUP_REMINDER_MIN_SESSIONS = 5;
const DAY_MS = 86_400_000;

export function exportFileName(now: Date): string {
  return `foot-training-${toDateKey(now)}.json`;
}

export function serializeBackup(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export type ImportResult = { ok: true; state: AppState } | { ok: false; error: string };

export function parseBackup(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Ce fichier n\'est pas une sauvegarde valide.' };
  }
  try {
    return { ok: true, state: migrate(raw) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sauvegarde invalide.' };
  }
}

export function needsBackupReminder(state: AppState, now: Date): boolean {
  if (state.sessions.length < BACKUP_REMINDER_MIN_SESSIONS) return false;
  if (!state.lastBackupAt) return true;
  return now.getTime() - new Date(state.lastBackupAt).getTime() > BACKUP_REMINDER_DAYS * DAY_MS;
}
