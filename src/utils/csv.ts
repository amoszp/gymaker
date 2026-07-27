import type { DayWorkout } from '@/types';
import { brzycki } from './pr';
import { inRange } from './date';

function csvEscape(v: string | number): string {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function workoutsToCSV(
  workouts: Record<string, DayWorkout>,
  start: string,
  end: string,
): string {
  const rows: string[][] = [];
  rows.push([
    'Date',
    'Exercise',
    'Set#',
    'Weight(kg)',
    'Reps',
    'e1RM',
    'Tags',
    'Notes',
  ]);

  const keys = Object.keys(workouts).sort();
  for (const dateKey of keys) {
    if (!inRange(dateKey, start, end)) continue;
    const w = workouts[dateKey];
    if (!w?.exercises) continue;
    for (const ex of w.exercises) {
      ex.sets.forEach((s, idx) => {
        rows.push([
          dateKey,
          ex.name,
          String(idx + 1),
          String(s.weight),
          String(s.reps),
          String(brzycki(s.weight, s.reps)),
          (ex.tags || []).join('|'),
          ex.notes ?? '',
        ]);
      });
      if (!ex.sets.length) {
        rows.push([
          dateKey,
          ex.name,
          '',
          '',
          '',
          '',
          (ex.tags || []).join('|'),
          ex.notes ?? '',
        ]);
      }
    }
  }

  return rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
}

export function downloadBlob(filename: string, csvContent: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([csvContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
