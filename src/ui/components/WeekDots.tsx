import type { DayActivity } from '../../engine/stats';

const LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function WeekDots({ days }: { days: DayActivity[] }) {
  return (
    <div className="week-dots">
      {days.map((d, i) => (
        <div key={d.dateKey}>
          {LETTERS[i]}
          <div className={`dot ${d.count > 0 ? 'on' : ''} ${d.isToday ? 'today' : ''}`}>{d.count > 0 ? '✓' : ''}</div>
        </div>
      ))}
    </div>
  );
}
