import { memo } from 'react';
import { Flame, Layers, Weight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Tag from '@/components/ui/Tag';
import { formatShort } from '@/utils/date';
import type { PRBest } from '@/types';
import { cn } from '@/lib/utils';

interface PRCardProps {
  pr: PRBest;
}

function PRCardImpl({ pr }: PRCardProps) {
  const isHeavyPR = pr.e1RM >= 100;

  return (
    <GlassCard hover className="flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-lg font-bold text-white truncate tracking-tight" title={pr.exercise}>
          {pr.exercise}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          {pr.totalSets !== undefined && (
            <span className="inline-flex items-center gap-1 text-[10px] text-white/50 uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/5">
              <Layers className="w-3 h-3" />
              {pr.totalSets}
            </span>
          )}
          {pr.totalVolume !== undefined && (
            <span className="inline-flex items-center gap-1 text-[10px] text-white/50 uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/5">
              <Weight className="w-3 h-3" />
              {pr.totalVolume >= 1000
                ? `${(pr.totalVolume / 1000).toFixed(1)}k`
                : Math.round(pr.totalVolume)}
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          'py-3 px-3 rounded-xl border transition-all',
          isHeavyPR
            ? 'bg-crimson/[0.08] border-crimson/30 shadow-[0_0_30px_-10px_rgba(220,38,38,0.5)]'
            : 'bg-ink-950/50 border-white/[0.05]',
        )}
      >
        <div className="text-center">
          <span
            className={cn(
              'text-4xl sm:text-5xl font-black tracking-tight',
              isHeavyPR ? 'text-crimson-100 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]' : 'text-white',
            )}
          >
            {pr.weight}
            <span className="text-lg font-semibold text-white/40 ml-1">kg</span>
            <span className="text-2xl font-bold text-white/30 mx-2">×</span>
            {pr.reps}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-white/60">Estimated 1RM =</span>
        <span className="pr-glow text-gold-100 font-extrabold text-base px-3 py-1 rounded-lg border border-gold/30 inline-flex items-center gap-1.5">
          {pr.e1RM.toFixed(1)}
          <span className="text-xs text-gold-200/60">kg</span>
          <Tag tone="gold" className="!text-[9px] !px-1.5 !py-px">
            <Flame className="w-3 h-3" />
          </Tag>
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <span className="text-xs text-white/40">
          {formatShort(pr.dateKey)}
        </span>
        <div className="flex flex-wrap gap-1 justify-end">
          {pr.tags.map((tag) => (
            <Tag key={tag} tone="crimson">
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export const PRCard = memo(PRCardImpl, (prev, next) => {
  const a = prev.pr;
  const b = next.pr;
  return (
    a.exercise === b.exercise &&
    a.weight === b.weight &&
    a.reps === b.reps &&
    a.e1RM === b.e1RM &&
    a.dateKey === b.dateKey &&
    a.totalVolume === b.totalVolume &&
    a.totalSets === b.totalSets &&
    a.tags.length === b.tags.length &&
    a.tags.every((t, i) => t === b.tags[i])
  );
});

export default PRCard;
