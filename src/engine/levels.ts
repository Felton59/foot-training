import { LEVELS, type Level } from '../data/levels';

export interface LevelInfo {
  level: Level;
  index: number;
  next: Level | null;
  progress: number;
}

export function levelFor(xp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) index = i;
  }
  const level = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const progress = next ? (xp - level.minXp) / (next.minXp - level.minXp) : 1;
  return { level, index, next, progress };
}
