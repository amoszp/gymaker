import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import GlassCard from '@/components/ui/GlassCard';
import GhostButton from '@/components/ui/GhostButton';
import Preferences from '@/components/settings/Preferences';
import DataSection from '@/components/settings/DataSection';
import LibraryModal from '@/components/settings/LibraryModal';
import RoutineRow from '@/components/settings/RoutineRow';
import RoutineEditModal from '@/components/settings/RoutineEditModal';
import { Plus, RotateCcw, Dumbbell, Cog, HardDrive } from 'lucide-react';
import type { RoutineTemplate } from '@/types';

interface Toast {
  id: number;
  msg: string;
  ok: boolean;
}

export default function SettingsPage() {
  const library = useStore((s) => s.library);
  const routines = useStore((s) => s.routines);
  const resetRoutinesToDefaults = useStore((s) => s.resetRoutinesToDefaults);

  const [libOpen, setLibOpen] = useState(false);
  const [routineEditOpen, setRoutineEditOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (msg: string, ok = true) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, ok }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2500);
  };

  const openNewRoutine = () => {
    setEditingRoutine(null);
    setRoutineEditOpen(true);
  };

  const openEditRoutine = (r: RoutineTemplate) => {
    setEditingRoutine(r);
    setRoutineEditOpen(true);
  };

  const handleReset = () => {
    if (window.confirm('Reset routines to defaults? This will delete your custom routines.')) {
      resetRoutinesToDefaults();
      pushToast('Routines reset');
    }
  };

  useEffect(() => {
    if (toasts.length > 3) {
      setToasts((t) => t.slice(-3));
    }
  }, [toasts]);

  const sectionTitle = (icon: React.ReactNode, title: string) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-crimson-300">{icon}</span>
        <h2 className="font-display font-bold text-white/95 text-lg sm:text-xl">
          {title}
        </h2>
      </div>
      <div className="h-1 w-16 rounded-full bg-crimson/70" />
    </div>
  );

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-5">
      <div className="mb-2">
        <h1 className="font-display font-bold text-white text-2xl sm:text-3xl tracking-tight">
          Settings
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Configure your gym tracking preferences
        </p>
      </div>

      <GlassCard className="p-5">
        {sectionTitle(<Cog size={20} />, 'Preferences')}
        <Preferences />
      </GlassCard>

      <GlassCard className="p-5">
        {sectionTitle(<Dumbbell size={20} />, 'Exercise Library')}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/70">
            Total Exercises:{' '}
            <span className="font-display font-semibold text-white/95">
              {Object.keys(library).length}
            </span>
          </span>
          <GhostButton variant="ghost" size="md" onClick={() => setLibOpen(true)}>
            Manage Exercises
          </GhostButton>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(library)
            .slice(0, 30)
            .map((e) => (
              <span
                key={e.name}
                className="chip"
                title={e.tags.join(', ') || e.name}
              >
                {e.name}
              </span>
            ))}
          {Object.keys(library).length > 30 && (
            <span className="chip text-white/50">
              +{Object.keys(library).length - 30} more
            </span>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-start justify-between mb-4">
          {sectionTitle(<Dumbbell size={20} />, 'Routine Templates')}
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <GhostButton
              variant="chip"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              <RotateCcw size={12} /> Reset
            </GhostButton>
            <GhostButton variant="ghost" size="sm" onClick={openNewRoutine}>
              <Plus size={15} /> New Routine
            </GhostButton>
          </div>
        </div>
        <div className="space-y-2">
          {routines.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-6">
              No routines yet. Create one to get started.
            </p>
          ) : (
            routines.map((r) => (
              <RoutineRow
                key={r.id}
                routine={r}
                onEdit={() => openEditRoutine(r)}
              />
            ))
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        {sectionTitle(<HardDrive size={20} />, 'Data Management')}
        <DataSection onToast={pushToast} />
      </GlassCard>

      <LibraryModal open={libOpen} onClose={() => setLibOpen(false)} />
      <RoutineEditModal
        open={routineEditOpen}
        onClose={() => setRoutineEditOpen(false)}
        routine={editingRoutine}
      />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'pointer-events-auto animate-popIn rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg border ' +
              (t.ok
                ? 'bg-forest/20 border-forest/40 text-forest-100 backdrop-blur-md'
                : 'bg-crimson/20 border-crimson/40 text-crimson-100 backdrop-blur-md')
            }
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
