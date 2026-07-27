import { useState } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, Weight, Layers, Activity, Trophy, Calendar } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import type { QuickStats as QuickStatsType } from '@/utils/pr';
import { formatShort } from '@/utils/date';

interface QuickStatsProps {
  stats: QuickStatsType;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="rounded-xl bg-ink-950/40 border border-white/5 p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-white/40">
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        {value}
      </div>
      <div className="text-xs text-white/50 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function formatVolume(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}k`;
  }
  return `${Math.round(kg)}`;
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const [expanded, setExpanded] = useState(true);

  const statCards: StatCardProps[] = [
    {
      icon: <Calendar className="w-4 h-4" />,
      value: stats.totalWorkouts.toString(),
      label: 'Total Workouts',
    },
    {
      icon: <Weight className="w-4 h-4" />,
      value: formatVolume(stats.totalVolume),
      label: 'Total Volume (kg)',
    },
    {
      icon: <Layers className="w-4 h-4" />,
      value: stats.totalSets.toString(),
      label: 'Total Sets',
    },
    {
      icon: <Dumbbell className="w-4 h-4" />,
      value: stats.totalExercises.toString(),
      label: 'Total Exercises',
    },
    {
      icon: <Trophy className="w-4 h-4" />,
      value: stats.prCount.toString(),
      label: 'PR Count',
    },
    {
      icon: <Activity className="w-4 h-4" />,
      value: stats.lastWorkoutDate ? formatShort(stats.lastWorkoutDate) : '—',
      label: 'Last Workout',
    },
  ];

  return (
    <GlassCard className="p-0 overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition"
      >
        <h3 className="text-base font-semibold text-white tracking-tight">
          Quick Stats
        </h3>
        <div className={cn(
          'p-1.5 rounded-lg text-crimson-200 transition-transform',
          expanded && 'rotate-180',
        )}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <div className={cn(
        'grid gap-3 px-5 pb-5 transition-all duration-300 overflow-hidden',
        expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pb-0',
      )}>
        <div className="min-h-0 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
