import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayWorkout } from '@/types';

interface DayCellProps {
  date: Date | null;
  dateKey: string;
  workout?: DayWorkout;
  isToday: boolean;
  isActive: boolean;
  onClick: () => void;
  showLogButton: boolean;
  onLogWorkout: () => void;
}

export default function DayCell({
  date,
  dateKey,
  workout,
  isToday,
  isActive,
  onClick,
  showLogButton,
  onLogWorkout,
}: DayCellProps) {
  if (!date) {
    return <div className="aspect-square" />;
  }

  const hasExercises = workout && workout.exercises.length > 0;

  return (
    <div
      onClick={onClick}
      title={dateKey}
      className={cn(
        'relative aspect-square glass-soft rounded-xl3 p-2 cursor-pointer select-none',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-crimson',
        isToday && 'ring-2 ring-crimson ring-offset-2 ring-offset-ink-950',
        isActive && 'bg-crimson/20',
      )}
    >
      <span
        className={cn(
          'absolute top-2 left-2 text-xs font-medium',
          isToday ? 'text-crimson-100 font-bold' : 'text-white/70',
        )}
      >
        {date.getDate()}
      </span>

      {hasExercises && (
        <span className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-forest-500 shadow-[0_0_6px_rgba(29,185,84,0.5)]" />
      )}

      {hasExercises && (
        <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 text-white/40">
          <Dumbbell size={10} />
          <span className="text-[10px] font-medium">{workout!.exercises.length}</span>
        </div>
      )}

      {showLogButton && !hasExercises && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLogWorkout();
          }}
          className="absolute inset-x-2 bottom-2 h-7 text-[10px] rounded-lg border border-crimson/50 text-crimson-100 bg-crimson/10 hover:bg-crimson/20 transition flex items-center justify-center font-medium"
        >
          Log Workout
        </button>
      )}
    </div>
  );
}
