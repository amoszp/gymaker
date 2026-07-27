export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  isPR?: boolean;
  e1RM?: number;
}

export interface LoggedExercise {
  id: string;
  name: string;
  tags: string[];
  sets: ExerciseSet[];
  notes?: string;
}

export interface DayWorkout {
  dateKey: string;
  title?: string;
  exercises: LoggedExercise[];
}

export interface RoutineExerciseSeed {
  name: string;
  sets: number;
  defaultWeight?: number;
  defaultReps?: number;
  tags?: string[];
}

export interface RoutineTemplate {
  id: string;
  name: string;
  exercises: RoutineExerciseSeed[];
}

export interface ExerciseLibraryEntry {
  name: string;
  tags: string[];
  lastUsed?: {
    sets: ExerciseSet[];
    dateKey: string;
    tags: string[];
  };
}

export type WeightIncrement = 0.5 | 1 | 2.5;
export type WeekStartsOn = 0 | 1; // 0 = Sunday, 1 = Monday

export interface Preferences {
  weightIncrement: WeightIncrement;
  weekStartsOn: WeekStartsOn;
}

export interface AppState {
  workouts: Record<string, DayWorkout>;
  routines: RoutineTemplate[];
  library: Record<string, ExerciseLibraryEntry>;
  prefs: Preferences;
}

export interface PRBest {
  exercise: string;
  weight: number;
  reps: number;
  e1RM: number;
  dateKey: string;
  tags: string[];
  totalVolume?: number;
  totalSets?: number;
}
