export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(key: string, delta: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(key: string): boolean {
  return key === todayKey();
}

export function formatLong(key: string): string {
  const d = fromDateKey(key);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShort(key: string): string {
  const d = fromDateKey(key);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function buildMonthGrid(date: Date, weekStartsOn: 0 | 1): (Date | null)[] {
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  const days: (Date | null)[] = [];
  const firstWeekday = (first.getDay() - weekStartsOn + 7) % 7;
  for (let i = 0; i < firstWeekday; i++) days.push(null);
  for (let day = 1; day <= last.getDate(); day++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export function weekdayLabels(weekStartsOn: 0 | 1): string[] {
  const base = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    result.push(base[(i + weekStartsOn) % 7]);
  }
  return result;
}

export function startOfWeek(d: Date, weekStartsOn: 0 | 1): Date {
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  const out = new Date(d);
  out.setDate(out.getDate() - diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function endOfWeek(d: Date, weekStartsOn: 0 | 1): Date {
  const start = startOfWeek(d, weekStartsOn);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function inRange(key: string, start: string, end: string): boolean {
  return key >= start && key <= end;
}
