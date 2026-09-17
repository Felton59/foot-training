import { ALL_DOMAINS, type CompletedSession, type Domain } from '../storage/schema';
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

export function minutesByDomain(sessions: CompletedSession[], now: Date, weeks = 4): Record<Domain, number> {
  const from = addDays(startOfWeek(now), -7 * (weeks - 1)).getTime();
  const totals = Object.fromEntries(ALL_DOMAINS.map((d) => [d, 0])) as Record<Domain, number>;
  for (const s of sessions) {
    if (new Date(s.date).getTime() < from) continue;
    for (const item of s.items) {
      if (item.done && (ALL_DOMAINS as string[]).includes(item.domain)) {
        totals[item.domain as Domain] += item.durationMin;
      }
    }
  }
  return totals;
}
