import type { DayWorkout, ExerciseSet, PRBest } from '@/types';

export function brzycki(weight: number, reps: number): number {
  if (!weight || weight <= 0 || !reps || reps <= 0) return 0;
  if (reps >= 35) {
    return Math.round(weight * 1.03 * 10) / 10;
  }
  const denom = 1.0278 - 0.0278 * reps;
  if (denom <= 0) return Math.round(weight * 1.05 * 10) / 10;
  return Math.round((weight / denom) * 10) / 10;
}

export function comparePR(
  newS: { weight: number; reps: number },
  prevBest: { weight: number; reps: number } | null,
): boolean {
  const current = brzycki(newS.weight, newS.reps);
  if (!prevBest) return current > 0;
  const prev = brzycki(prevBest.weight, prevBest.reps);
  return current > prev;
}

export function attachPRFlags(
  sets: ExerciseSet[],
  historyBest: { weight: number; reps: number } | null,
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
            weight: s.weight,
            reps: s.reps,
            e1RM,
            dateKey,
            tags: [...ex.tags],
            totalVolume: (cur?.totalVolume ?? 0),
            totalSets: (cur?.totalSets ?? 0),
          };
        }
        const accum = best[ex.name];
        accum.totalVolume += s.weight * s.reps;
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
        totalVolume += s.weight * s.reps;
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
