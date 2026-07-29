import type { DayWorkout, ExerciseSet, PRBest } from '@/types';

export function brzycki(weight: number | '' | null | undefined, reps: number | '' | null | undefined): number {
  const w = typeof weight === 'number' ? weight : Number(weight || 0);
  const r = typeof reps === 'number' ? reps : Number(reps || 0);
  if (!w || w <= 0 || !r || r <= 0) return 0;
  if (r >= 35) {
    return Math.round(w * 1.03 * 10) / 10;
  }
  const denom = 1.0278 - 0.0278 * r;
  if (denom <= 0) return Math.round(w * 1.05 * 10) / 10;
  return Math.round((w / denom) * 10) / 10;
}

export function comparePR(
  newS: { weight: number | ''; reps: number | '' },
  prevBest: { weight: number | ''; reps: number | '' } | null,
): boolean {
  const current = brzycki(newS.weight, newS.reps);
  if (!prevBest) return current > 0;
  const prev = brzycki(prevBest.weight, prevBest.reps);
  return current > prev;
}

export function attachPRFlags(
  sets: ExerciseSet[],
  historyBest: { weight: number | ''; reps: number | '' } | null,
): ExerciseSet[] {
  let rollingBest = historyBest;
  return sets.map((s) => {
    const e1RM = brzycki(s.weight, s.reps);
    const isPR = comparePR({ weight: s.weight, reps: s.reps }, rollingBest);
    if (isPR) {
      rollingBest = { weight: s.weight, reps: s.reps };
    }
    return { ...s, e1RM, isPR: isPR || s.isPR };
  });
}

export function computeAllPRs(
  workouts: Record<string, DayWorkout>,
): Record<string, PRBest> {
  const best: Record<
    string,
    PRBest & {
      totalVolume: number;
      totalSets: number;
    }
  > = {};

  const keys = Object.keys(workouts).sort();
  for (const dateKey of keys) {
    const w = workouts[dateKey];
    if (!w?.exercises) continue;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        const e1RM = brzycki(s.weight, s.reps);
        if (e1RM <= 0) continue;
        const cur = best[ex.name];
        if (!cur || e1RM > cur.e1RM) {
          best[ex.name] = {
            exercise: ex.name,
            weight: Number(s.weight || 0),
            reps: Number(s.reps || 0),
            e1RM,
            dateKey,
            tags: [...ex.tags],
            totalVolume: (cur?.totalVolume ?? 0),
            totalSets: (cur?.totalSets ?? 0),
          };
        }
        const accum = best[ex.name];
        accum.totalVolume += Number(s.weight || 0) * Number(s.reps || 0);
        accum.totalSets += 1;
      }
    }
  }

  return best;
}

export interface QuickStats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalExercises: number;
  prCount: number;
  lastWorkoutDate: string | null;
}

export function computeQuickStats(workouts: Record<string, DayWorkout>): QuickStats {
  const keys = Object.keys(workouts).sort();
  let totalVolume = 0;
  let totalSets = 0;
  let totalExercises = 0;
  let lastWorkoutDate: string | null = null;

  const prs = computeAllPRs(workouts);

  for (const dateKey of keys) {
    const w = workouts[dateKey];
    if (!w?.exercises?.length) continue;
    if (dateKey > (lastWorkoutDate ?? '')) lastWorkoutDate = dateKey;
    totalExercises += w.exercises.length;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        totalVolume += Number(s.weight || 0) * Number(s.reps || 0);
        totalSets += 1;
      }
    }
  }

  return {
    totalWorkouts: keys.filter((k) => workouts[k]?.exercises?.length).length,
    totalVolume,
    totalSets,
    totalExercises,
    prCount: Object.keys(prs).length,
    lastWorkoutDate,
  };
}
