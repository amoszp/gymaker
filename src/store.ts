import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  DayWorkout,
  ExerciseSet,
  ExerciseLibraryEntry,
  LoggedExercise,
  Preferences,
  RoutineExerciseSeed,
  RoutineTemplate,
} from '@/types';
import { buildDefaultRoutines, DEFAULT_REPS, DEFAULT_WEIGHT } from '@/utils/defaults';
import { brzycki, computeAllPRs } from '@/utils/pr';
import { decodeBackup, encodeBackup } from '@/utils/storage';
import { workoutsToCSV } from '@/utils/csv';

const uid = () => Math.random().toString(36).slice(2, 11);

function makeSet(weight: number | '', reps: number | ''): ExerciseSet {
  return { id: uid(), weight, reps, e1RM: brzycki(weight, reps) };
}

function ensureWorkout(state: AppState, dateKey: string): DayWorkout {
  if (!state.workouts[dateKey]) {
    return { dateKey, exercises: [] };
  }
  return state.workouts[dateKey];
}

function updateLibraryLastUsedRef(
  library: Record<string, ExerciseLibraryEntry>,
  name: string,
  sets: ExerciseSet[],
  tags: string[],
  dateKey: string,
) {
  const key = name.toLowerCase();
  if (!library[key]) {
    library[key] = { name, tags: [...tags] };
  } else {
    library[key] = { ...library[key] };
  }
  library[key].name = name;
  if (tags?.length) library[key].tags = [...tags];
  library[key].lastUsed = {
    sets: sets.map((s) => ({ ...s })),
    dateKey,
    tags: [...tags],
  };
}

function seedDefaultState(): AppState {
  const routines = buildDefaultRoutines();
  const library: Record<string, ExerciseLibraryEntry> = {};
  for (const rt of routines) {
    for (const ex of rt.exercises) {
      const k = ex.name.toLowerCase();
      if (!library[k]) {
        library[k] = { name: ex.name, tags: ex.tags ?? [] };
      }
    }
  }
  return {
    workouts: {},
    routines,
    library,
    prefs: { weightIncrement: 2.5, weekStartsOn: 1 },
  };
}

interface Store extends AppState {
  addExercise: (dateKey: string, name: string, fromLibrary?: boolean) => void;
  removeExercise: (dateKey: string, exId: string) => void;
  renameExercise: (dateKey: string, exId: string, newName: string) => void;
  addSet: (dateKey: string, exId: string) => void;
  updateSet: (
    dateKey: string,
    exId: string,
    setId: string,
    patch: Partial<ExerciseSet>,
  ) => void;
  removeSet: (dateKey: string, exId: string, setId: string) => void;
  setExerciseTags: (dateKey: string, exId: string, tags: string[]) => void;
  setExerciseNotes: (dateKey: string, exId: string, notes: string) => void;
  applyRoutine: (dateKey: string, routineId: string) => void;
  copyExercises: (fromDate: string, toDate: string, exerciseIds: string[]) => void;
  removeWorkout: (dateKey: string) => void;
  setPrefs: (p: Partial<Preferences>) => void;
  addLibraryExercise: (name: string, tags?: string[]) => void;
  renameLibraryExercise: (oldName: string, newName: string) => void;
  removeLibraryExercise: (name: string) => void;
  setLibraryTags: (name: string, tags: string[]) => void;
  addRoutine: (name: string, exs: RoutineExerciseSeed[]) => void;
  updateRoutine: (id: string, patch: Partial<RoutineTemplate>) => void;
  removeRoutine: (id: string) => void;
  resetRoutinesToDefaults: () => void;
  exportCSV: (start: string, end: string) => string;
  encodeBackup: () => string;
  restoreBackup: (code: string) => AppState | null;
  hardReplaceState: (next: AppState) => void;
  computeAllTimePRs: () => ReturnType<typeof computeAllPRs>;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...seedDefaultState(),

      addExercise: (dateKey, name, fromLibrary) =>
        set((state) => {
          const workouts = { ...state.workouts };
          const library = { ...state.library };
          const w = ensureWorkout({ workouts, routines: state.routines, library, prefs: state.prefs }, dateKey);
          workouts[dateKey] = { ...w, exercises: [...w.exercises] };
          const libKey = name.toLowerCase();
          const lib = library[libKey];
          let sets: ExerciseSet[] = [];
          if (fromLibrary && lib?.lastUsed?.sets?.length) {
            sets = lib.lastUsed.sets.map((s) => makeSet(s.weight, s.reps));
          } else {
            sets = [makeSet(DEFAULT_WEIGHT, DEFAULT_REPS)];
          }
          const tags = lib?.lastUsed?.tags?.length
            ? [...lib.lastUsed.tags]
            : lib?.tags
              ? [...lib.tags]
              : [];
          const ex: LoggedExercise = { id: uid(), name, tags, sets };
          workouts[dateKey].exercises.push(ex);
          updateLibraryLastUsedRef(library, name, sets, tags, dateKey);
          return { workouts, library };
        }),

      removeExercise: (dateKey, exId) =>
        set((state) => {
          if (!state.workouts[dateKey]) return state;
          const w = state.workouts[dateKey];
          return {
            ...state,
            workouts: {
              ...state.workouts,
              [dateKey]: {
                ...w,
                exercises: w.exercises.filter((e) => e.id !== exId),
              },
            },
          };
        }),

      renameExercise: (dateKey, exId, newName) =>
        set((state) => {
          if (!state.workouts[dateKey]) return state;
          const w = state.workouts[dateKey];
          return {
            ...state,
            workouts: {
              ...state.workouts,
              [dateKey]: {
                ...w,
                exercises: w.exercises.map((e) =>
                  e.id === exId ? { ...e, name: newName } : e,
                ),
              },
            },
          };
        }),

      addSet: (dateKey, exId) =>
        set((state) => {
          if (!state.workouts[dateKey]) return state;
          const w = state.workouts[dateKey];
          const exIdx = w.exercises.findIndex((e) => e.id === exId);
          if (exIdx === -1) return state;
          const ex = w.exercises[exIdx];
          const prev = ex.sets[ex.sets.length - 1];
          const newSet = prev
            ? makeSet(prev.weight, prev.reps)
            : makeSet(DEFAULT_WEIGHT, DEFAULT_REPS);
          return {
            ...state,
            workouts: {
              ...state.workouts,
              [dateKey]: {
                ...w,
                exercises: w.exercises.map((e, i) =>
                  i === exIdx ? { ...e, sets: [...e.sets, newSet] } : e,
                ),
              },
            },
          };
        }),

      updateSet: (dateKey, exId, setId, patch) =>
        set((state) => {
          if (!state.workouts[dateKey]) return state;
          const w = state.workouts[dateKey];
          return {
            ...state,
            workouts: {
              ...state.workouts,
              [dateKey]: {
                ...w,
                exercises: w.exercises.map((e) => {
                  if (e.id !== exId) return e;
                  return {
                    ...e,
                    sets: e.sets.map((s) => {
                      if (s.id !== setId) return s;
                      const weight = patch.weight ?? s.weight;
                      const reps = patch.reps ?? s.reps;
                      return {
                        ...s,
                        ...patch,
                        weight,
                        reps,
                        e1RM: brzycki(weight, reps),
                      };
                    }),
                  };
                }),
              },
            },
          };
        }),

      removeSet: (dateKey, exId, setId) =>
        set((state) => {
          if (!state.workouts[dateKey]) return state;
          const w = state.workouts[dateKey];
          return {
            ...state,
            workouts: {
              ...state.workouts,
              [dateKey]: {
                ...w,
                exercises: w.exercises.map((e) => {
                  if (e.id !== exId) return e;
                  return { ...e, sets: e.sets.filter((s) => s.id !== setId) };
                }),
              },
            },
          };
        }),

      setExerciseTags: (dateKey, exId, tags) =>
        set((state) => {
          if (!state.workouts[dateKey]) return state;
          const w = state.workouts[dateKey];
          return {
            ...state,
            workouts: {
              ...state.workouts,
              [dateKey]: {
                ...w,
                exercises: w.exercises.map((e) =>
                  e.id === exId ? { ...e, tags } : e,
                ),
              },
            },
          };
        }),

      setExerciseNotes: (dateKey, exId, notes) =>
        set((state) => {
          if (!state.workouts[dateKey]) return state;
          const w = state.workouts[dateKey];
          return {
            ...state,
            workouts: {
              ...state.workouts,
              [dateKey]: {
                ...w,
                exercises: w.exercises.map((e) =>
                  e.id === exId ? { ...e, notes } : e,
                ),
              },
            },
          };
        }),

      applyRoutine: (dateKey, routineId) =>
        set((state) => {
          const rt = state.routines.find((r) => r.id === routineId);
          if (!rt) return state;
          const workouts = { ...state.workouts };
          const library = { ...state.library };
          const w = ensureWorkout({ workouts, routines: state.routines, library, prefs: state.prefs }, dateKey);
          workouts[dateKey] = { ...w, exercises: [...w.exercises] };
          for (const seed of rt.exercises) {
            const sets: ExerciseSet[] = [];
            for (let i = 0; i < seed.sets; i++) {
              const lib = library[seed.name.toLowerCase()];
              let w0: number | '' = seed.defaultWeight ?? DEFAULT_WEIGHT;
              let r0: number | '' = seed.defaultReps ?? DEFAULT_REPS;
              if (lib?.lastUsed?.sets?.[i]) {
                w0 = lib.lastUsed.sets[i].weight;
                r0 = lib.lastUsed.sets[i].reps;
              } else if (i === 0 && lib?.lastUsed?.sets?.[0]) {
                w0 = lib.lastUsed.sets[0].weight;
                r0 = lib.lastUsed.sets[0].reps;
              }
              sets.push(makeSet(w0, r0));
            }
            const tags =
              seed.tags?.length ? seed.tags : library[seed.name.toLowerCase()]?.tags ?? [];
            const ex: LoggedExercise = {
              id: uid(),
              name: seed.name,
              tags: [...tags],
              sets,
            };
            workouts[dateKey].exercises.push(ex);
            updateLibraryLastUsedRef(library, seed.name, sets, tags, dateKey);
          }
          return { workouts, library };
        }),

      copyExercises: (fromDate, toDate, exerciseIds) =>
        set((state) => {
          const src = state.workouts[fromDate];
          if (!src || !exerciseIds.length) return state;
          const picks = src.exercises.filter((e) => exerciseIds.includes(e.id));
          if (!picks.length) return state;
          const workouts = { ...state.workouts };
          const library = { ...state.library };
          const w = ensureWorkout({ workouts, routines: state.routines, library, prefs: state.prefs }, toDate);
          workouts[toDate] = { ...w, exercises: [...w.exercises] };
          for (const pick of picks) {
            const clone: LoggedExercise = {
              id: uid(),
              name: pick.name,
              tags: [...pick.tags],
              sets: pick.sets.map((s) => ({ ...s, id: uid(), isPR: false })),
              notes: pick.notes,
            };
            workouts[toDate].exercises.push(clone);
            updateLibraryLastUsedRef(library, pick.name, clone.sets, clone.tags, toDate);
          }
          return { workouts, library };
        }),

      removeWorkout: (dateKey) =>
        set((state) => {
          if (!state.workouts[dateKey]) return state;
          const workouts = { ...state.workouts };
          delete workouts[dateKey];
          return { ...state, workouts };
        }),

      setPrefs: (p) => set((s) => ({ ...s, prefs: { ...s.prefs, ...p } })),

      addLibraryExercise: (name, tags = []) =>
        set((s) => {
          const k = name.toLowerCase();
          if (s.library[k]) return s;
          return {
            ...s,
            library: { ...s.library, [k]: { name, tags } },
          };
        }),

      renameLibraryExercise: (oldName, newName) =>
        set((s) => {
          const oldKey = oldName.toLowerCase();
          const newKey = newName.toLowerCase();
          if (!s.library[oldKey] || oldKey === newKey) return s;
          const library = { ...s.library };
          const entry = library[oldKey];
          library[newKey] = { ...entry, name: newName };
          delete library[oldKey];
          const workouts = { ...s.workouts };
          for (const dk of Object.keys(workouts)) {
            const w = workouts[dk];
            workouts[dk] = {
              ...w,
              exercises: w.exercises.map((e) =>
                e.name.toLowerCase() === oldKey ? { ...e, name: newName } : e,
              ),
            };
          }
          const routines = s.routines.map((r) => ({
            ...r,
            exercises: r.exercises.map((se) =>
              se.name.toLowerCase() === oldKey ? { ...se, name: newName } : se,
            ),
          }));
          return { ...s, library, workouts, routines };
        }),

      removeLibraryExercise: (name) =>
        set((s) => {
          const k = name.toLowerCase();
          if (!s.library[k]) return s;
          const library = { ...s.library };
          delete library[k];
          return { ...s, library };
        }),

      setLibraryTags: (name, tags) =>
        set((s) => {
          const k = name.toLowerCase();
          if (!s.library[k]) return s;
          return {
            ...s,
            library: {
              ...s.library,
              [k]: { ...s.library[k], tags },
            },
          };
        }),

      addRoutine: (name, exs) =>
        set((s) => ({
          ...s,
          routines: [...s.routines, { id: uid(), name, exercises: exs }],
        })),

      updateRoutine: (id, patch) =>
        set((s) => ({
          ...s,
          routines: s.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      removeRoutine: (id) =>
        set((s) => ({ ...s, routines: s.routines.filter((r) => r.id !== id) })),

      resetRoutinesToDefaults: () =>
        set((s) => ({ ...s, routines: buildDefaultRoutines() })),

      exportCSV: (start, end) => workoutsToCSV(get().workouts, start, end),
      encodeBackup: () => {
        const { workouts, routines, library, prefs } = get();
        return encodeBackup({ workouts, routines, library, prefs });
      },
      restoreBackup: (code) => {
        const parsed = decodeBackup(code);
        if (parsed) {
          set({
            workouts: parsed.workouts ?? {},
            routines: parsed.routines ?? buildDefaultRoutines(),
            library: parsed.library ?? {},
            prefs: parsed.prefs ?? { weightIncrement: 2.5, weekStartsOn: 1 },
          });
        }
        return parsed;
      },
      hardReplaceState: (next) =>
        set({
          workouts: next.workouts,
          routines: next.routines,
          library: next.library,
          prefs: next.prefs,
        }),

      computeAllTimePRs: () => computeAllPRs(get().workouts),
    }),
    {
      name: 'gymaker-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn('[Gymaker] Rehydrate error', error);
        if (!state) return;
        if (!state.routines?.length) {
          state.routines = buildDefaultRoutines();
        }
      },
    },
  ),
);
