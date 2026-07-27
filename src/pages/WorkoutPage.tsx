import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Dumbbell, Plus } from 'lucide-react';
import GhostButton from '@/components/ui/GhostButton';
import ExerciseCard from '@/components/workout/ExerciseCard';
import MiniCalendarModal from '@/components/workout/MiniCalendarModal';
import RoutinePickerModal from '@/components/workout/RoutinePickerModal';
import { useStore } from '@/store';
import type { AppState } from '@/types';
import { addDays, formatLong, todayKey } from '@/utils/date';
import { computeAllPRs } from '@/utils/pr';

export default function WorkoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const [activeDateKey, setActiveDateKey] = useState<string>(
    () => dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayKey(),
  );

  useEffect(() => {
    const d = dateParam;
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && d !== activeDateKey) {
      setActiveDateKey(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateParam]);

  const updateDate = (next: string) => {
    setActiveDateKey(next);
    setSearchParams(next === todayKey() ? {} : { date: next });
  };
  const [calOpen, setCalOpen] = useState(false);
  const [routineOpen, setRoutineOpen] = useState(false);

  const workouts = useStore((s) => s.workouts);
  const addExercise = useStore((s) => s.addExercise);
  const applyRoutine = useStore((s) => s.applyRoutine);
  const hardReplaceState = useStore((s) => s.hardReplaceState);

  const workout = workouts[activeDateKey];
  const exercises = workout?.exercises ?? [];

  const allTimePRs = useMemo(() => computeAllPRs(workouts), [workouts]);

  const setWorkoutTitle = (dateKey: string, title: string) => {
    const state = useStore.getState();
    const w = state.workouts[dateKey];
    if (!w) {
      if (!title) return;
      const next: AppState = {
        ...state,
        workouts: {
          ...state.workouts,
          [dateKey]: { dateKey, title, exercises: [] },
        },
      };
      hardReplaceState(next);
      return;
    }
    const next: AppState = {
      ...state,
      workouts: {
        ...state.workouts,
        [dateKey]: { ...w, title: title || undefined },
      },
    };
    hardReplaceState(next);
  };

  const handleRoutinePick = (routineId: string) => {
    applyRoutine(activeDateKey, routineId);
  };

  return (
    <div className="min-h-full pb-36">
      <header className="sticky top-0 z-30">
        <div className="glass border-b border-white/10 px-3 sm:px-5 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => updateDate(addDays(activeDateKey, -1))}
              aria-label="Previous day"
              className="h-9 w-9 shrink-0 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => setCalOpen(true)}
              className="flex-1 min-w-0 text-left px-2 sm:px-3 py-1.5 rounded-xl hover:bg-white/5 transition group"
            >
              <div className="text-[11px] tracking-wider uppercase text-crimson-100/80 font-medium">
                {activeDateKey === todayKey() ? 'Today' : 'Workout day'}
              </div>
              <div className="font-display text-sm sm:text-base font-semibold text-white/95 truncate group-hover:text-white transition">
                {formatLong(activeDateKey)}
              </div>
            </button>

            <button
              onClick={() => updateDate(addDays(activeDateKey, 1))}
              aria-label="Next day"
              className="h-9 w-9 shrink-0 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
            >
              <ChevronRight size={18} />
            </button>

            <div className="hidden sm:block w-px h-8 bg-white/10 mx-1" />

            <GhostButton
              size="md"
              variant="ghost"
              leftIcon={<Dumbbell size={16} />}
              onClick={() => setRoutineOpen(true)}
              className="shrink-0"
            >
              <span className="hidden sm:inline">+</span> Routine
            </GhostButton>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-5 pt-5">
        <div className="mb-4">
          <input
            type="text"
            defaultValue={workout?.title ?? ''}
            onChange={(e) => setWorkoutTitle(activeDateKey, e.target.value)}
            placeholder="Session title (optional)..."
            className="input-base font-display text-lg sm:text-xl font-semibold !py-3 bg-transparent border-0 px-1 placeholder:text-white/25 focus:!ring-0"
          />
        </div>

        <div className="flex flex-col gap-4">
          {exercises.length === 0 && (
            <div className="glass-soft rounded-xl3 py-14 px-6 flex flex-col items-center text-center animate-fadeIn">
              <div className="h-14 w-14 rounded-full border border-crimson/30 bg-crimson/10 grid place-items-center mb-4">
                <Dumbbell size={24} className="text-crimson-100" />
              </div>
              <h3 className="font-display font-semibold text-white/90 mb-1">
                No exercises yet
              </h3>
              <p className="text-sm text-white/50 max-w-xs mb-5">
                Start typing a name below, or inject a routine template.
              </p>
              <GhostButton
                variant="solid"
                leftIcon={<Dumbbell size={16} />}
                onClick={() => setRoutineOpen(true)}
              >
                Apply routine
              </GhostButton>
            </div>
          )}

          {exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              dateKey={activeDateKey}
              exercise={ex}
              allTimePRs={allTimePRs}
            />
          ))}
        </div>
      </main>

      <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 z-30 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <GhostButton
            size="lg"
            variant="solid"
            leftIcon={<Plus size={18} />}
            onClick={() => addExercise(activeDateKey, '', false)}
            className="shadow-[0_10px_40px_rgba(123,44,51,0.45)]"
          >
            Add exercise
          </GhostButton>
        </div>
      </div>

      <MiniCalendarModal
        open={calOpen}
        onClose={() => setCalOpen(false)}
        selectedKey={activeDateKey}
        onSelect={updateDate}
      />

      <RoutinePickerModal
        open={routineOpen}
        onClose={() => setRoutineOpen(false)}
        onPick={handleRoutinePick}
      />
    </div>
  );
}
