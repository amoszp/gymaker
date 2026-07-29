import { useMemo } from 'react';
import { ChevronDown, Dumbbell, Trophy, Flame, Layers } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Tag from '@/components/ui/Tag';
import GhostButton from '@/components/ui/GhostButton';
import { useStore } from '@/store';
import { startOfWeek, endOfWeek, toDateKey, inRange } from '@/utils/date';
import { brzycki } from '@/utils/pr';
import { cn } from '@/lib/utils';
import type { PRBest } from '@/types';

interface WeekReviewProps {
  expanded: boolean;
  onToggle: () => void;
  referenceDate: Date;
}

export default function WeekReview({ expanded, onToggle, referenceDate }: WeekReviewProps) {
  const workouts = useStore((s) => s.workouts);
  const weekStartsOn = useStore((s) => s.prefs.weekStartsOn);

  const stats = useMemo(() => {
    const s = startOfWeek(referenceDate, weekStartsOn);
    const e = endOfWeek(referenceDate, weekStartsOn);
    const startKey = toDateKey(s);
    const endKey = toDateKey(e);

    let totalWorkouts = 0;
    let totalVolume = 0;
    let totalSets = 0;
    let bestPR: (PRBest & { setWeight: number; setReps: number }) | null = null;

    for (const key of Object.keys(workouts)) {
      if (!inRange(key, startKey, endKey)) continue;
      const w = workouts[key];
      if (!w?.exercises?.length) continue;
      totalWorkouts++;
      for (const ex of w.exercises) {
        for (const set of ex.sets) {
          const wNum = Number(set.weight || 0);
          const rNum = Number(set.reps || 0);
          totalVolume += wNum * rNum;
          totalSets++;
          const e1rm = brzycki(set.weight, set.reps);
          if (e1rm > 0 && (!bestPR || e1rm > bestPR.e1RM)) {
            bestPR = {
              exercise: ex.name,
              weight: wNum,
              reps: rNum,
              e1RM: e1rm,
              dateKey: key,
              tags: [...ex.tags],
              setWeight: wNum,
              setReps: rNum,
            };
          }
        }
      }
    }

    return { totalWorkouts, totalVolume, totalSets, bestPR };
  }, [workouts, weekStartsOn, referenceDate]);

  return (
    <GlassCard hover={false} className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-crimson/15 border border-crimson/40 flex items-center justify-center text-crimson-100">
            <Trophy size={17} />
          </div>
          <div className="text-left">
            <h3 className="font-display text-base font-semibold text-white/95 leading-tight">
              Weekly Review
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Stats for this week
            </p>
          </div>
        </div>
        <GhostButton
          variant="soft"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label="Toggle week review"
        >
          <ChevronDown
            size={16}
            className={cn('text-white/60 transition-transform duration-200', expanded && 'rotate-180')}
          />
        </GhostButton>
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          expanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden min-h-0">
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="glass-soft rounded-xl2 p-3">
              <div className="flex items-center gap-1.5 text-white/50 text-[10px] uppercase tracking-wide mb-1">
                <Flame size={11} /> Workouts
              </div>
              <div className="font-display text-2xl font-bold text-white/95 leading-none">
                {stats.totalWorkouts}
              </div>
            </div>
            <div className="glass-soft rounded-xl2 p-3">
              <div className="flex items-center gap-1.5 text-white/50 text-[10px] uppercase tracking-wide mb-1">
                <Dumbbell size={11} /> Volume
              </div>
              <div className="font-display text-2xl font-bold text-forest-100 leading-none">
                {stats.totalVolume >= 1000
                  ? `${(stats.totalVolume / 1000).toFixed(1)}k`
                  : stats.totalVolume.toLocaleString()}
              </div>
            </div>
            <div className="glass-soft rounded-xl2 p-3">
              <div className="flex items-center gap-1.5 text-white/50 text-[10px] uppercase tracking-wide mb-1">
                <Layers size={11} /> Sets
              </div>
              <div className="font-display text-2xl font-bold text-white/95 leading-none">
                {stats.totalSets}
              </div>
            </div>
          </div>

          <div className="glass-soft rounded-xl2 p-3.5">
            <div className="flex items-center gap-1.5 text-white/50 text-[10px] uppercase tracking-wide mb-2.5">
              <Trophy size={11} className="text-gold-300" /> Best PR this week
            </div>
            {stats.bestPR ? (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-sm font-semibold text-white/95 truncate">
                    {stats.bestPR.exercise}
                  </div>
                  <div className="text-xs text-white/55 mt-0.5">
                    {stats.bestPR.setWeight} kg × {stats.bestPR.setReps} reps
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <Tag tone="gold">e1RM</Tag>
                  <span className="font-display text-xl font-bold text-gold-100 leading-none">
                    {stats.bestPR.e1RM}
                    <span className="text-xs text-white/50 font-normal ml-1">kg</span>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/40 italic">No PRs recorded this week.</p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
