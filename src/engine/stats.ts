import type { CompletedSession } from '../storage/schema';
import { addDays, startOfWeek, toDateKey } from './week';

export interface DayActivity {
  dateKey: string;
  count: number;
  isToday: boolean;
}

export function weekActivity(sessions: CompletedSession[], now: Date): DayActivity[] {
  const monday = startOfWeek(now);
  const todayKey = toDateKey(now);
  const sessionKeys = sessions.map((s) => toDateKey(new Date(s.date)));
  return Array.from({ length: 7 }, (_, i) => {
    const dateKey = toDateKey(addDays(monday, i));
    return { dateKey, count: sessionKeys.filter((k) => k === dateKey).length, isToday: dateKey === todayKey };
  });
}
