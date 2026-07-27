import { memo } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/store';
import type { ExerciseSet } from '@/types';
import { brzycki } from '@/utils/pr';
import { cn } from '@/lib/utils';

interface SetCardProps {
  dateKey: string;
  exId: string;
  set: ExerciseSet;
  index: number;
  isPR: boolean;
  weightIncrement: number;
}

const SetCard = memo(function SetCard({
  dateKey,
  exId,
  set,
  index,
  isPR,
  weightIncrement,
}: SetCardProps) {
  const updateSet = useStore((s) => s.updateSet);
  const removeSet = useStore((s) => s.removeSet);
  return (
    <div
      className={cn(
        'shrink-0 w-[140px] rounded-xl border p-2.5 transition relative',
        isPR ? 'pr-glow' : 'border-white/10 bg-ink-950/50',
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'inline-flex items-center text-[10px] tracking-wider uppercase font-semibold rounded-full px-2 py-0.5',
            isPR
              ? 'bg-gold/20 text-gold-100 border border-gold/40'
              : 'bg-white/5 text-white/50 border border-white/10',
          )}
        >
          {isPR && '🔥 '}
          Set {index + 1}
        </span>
        <button
          onClick={() => removeSet(dateKey, exId, set.id)}
          aria-label="Remove set"
          className="h-5 w-5 rounded-md text-white/40 hover:text-crimson-100 hover:bg-crimson/10 flex items-center justify-center transition"
        >
          <X size={12} />
        </button>
      </div>
      <div className="space-y-1.5">
        <div>
          <label className="nowrap-weight block text-[10px] tracking-wider uppercase text-white/40 mb-0.5">
            Weight
          </label>
          <input
            type="number"
            step={weightIncrement}
            min={0}
            value={set.weight}
            onChange={(e) =>
              updateSet(dateKey, exId, set.id, {
                weight: Number(e.target.value) || 0,
              })
            }
            className="w-full h-8 rounded-lg bg-ink-950/80 border border-white/10 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-crimson/60"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-wider uppercase text-white/40 mb-0.5">
            Reps
          </label>
          <input
            type="number"
            step={1}
            min={0}
            value={set.reps}
            onChange={(e) =>
              updateSet(dateKey, exId, set.id, {
                reps: Number(e.target.value) || 0,
              })
            }
            className="w-full h-8 rounded-lg bg-ink-950/80 border border-white/10 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-crimson/60"
          />
        </div>
        <div className="pt-0.5 flex justify-between text-[10px] text-white/35">
          <span>
            e1RM:{' '}
            <span className="text-white/55 font-medium">
              {brzycki(set.weight, set.reps)}
            </span>
          </span>
          <span>{set.weight * set.reps}kg</span>
        </div>
      </div>
    </div>
  );
});

export default SetCard;
