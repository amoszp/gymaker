import { useEffect, useMemo, useState } from 'react';
import { Copy, CalendarDays } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import GhostButton from '@/components/ui/GhostButton';
import Tag from '@/components/ui/Tag';
import { useStore } from '@/store';
import { toDateKey, formatLong, buildMonthGrid, weekdayLabels, isToday as isTodayKey } from '@/utils/date';
import { cn } from '@/lib/utils';
import type { DayWorkout } from '@/types';

interface DayCopyModalProps {
  open: boolean;
  onClose: () => void;
  dateKey: string;
}

export default function DayCopyModal({ open, onClose, dateKey }: DayCopyModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pickDateOpen, setPickDateOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<Date>(new Date());

  const workout = useStore((s) => s.workouts[dateKey]) as DayWorkout | undefined;
  const copyExercises = useStore((s) => s.copyExercises);
  const weekStartsOn = useStore((s) => s.prefs.weekStartsOn);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setPickDateOpen(false);
    } else {
      setPickerMonth(new Date());
    }
  }, [open]);

  const exercisesWithVolume = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.map((ex) => {
      const volume = ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      return { ...ex, volume };
    });
  }, [workout]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allSelected = exercisesWithVolume.length > 0 && selectedIds.length === exercisesWithVolume.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(exercisesWithVolume.map((e) => e.id));
  };

  const handleCopySelected = () => {
    if (selectedIds.length === 0) return;
    setPickDateOpen(true);
  };

  const handlePickDate = (targetKey: string) => {
    copyExercises(dateKey, targetKey, selectedIds);
    setPickDateOpen(false);
    onClose();
  };

  const grid = useMemo(() => buildMonthGrid(pickerMonth, weekStartsOn), [pickerMonth, weekStartsOn]);
  const wdLabels = useMemo(() => weekdayLabels(weekStartsOn), [weekStartsOn]);

  if (!workout) return null;

  return (
    <>
      <Modal
        open={open && !pickDateOpen}
        onClose={onClose}
        title={formatLong(dateKey)}
        subtitle={`${workout.exercises.length} exercises logged`}
        footer={
          <GhostButton
            variant="solid"
            leftIcon={<Copy size={16} />}
            onClick={handleCopySelected}
            disabled={selectedIds.length === 0}
            className="sm:w-auto w-full"
          >
            Copy Selected {selectedIds.length > 0 && `(${selectedIds.length})`}
          </GhostButton>
        }
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/50 uppercase tracking-wide">Select exercises</span>
          <button
            onClick={toggleSelectAll}
            className="text-xs text-crimson-100 hover:text-crimson-200 transition font-medium"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="space-y-2">
          {exercisesWithVolume.map((ex) => {
            const checked = selectedIds.includes(ex.id);
            return (
              <label
                key={ex.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/5 transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelect(ex.id)}
                  className="h-4 w-4 rounded border-white/20 bg-ink-950/60 text-crimson focus:ring-crimson/60 focus:ring-offset-ink-950"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/90 truncate">{ex.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{ex.sets.length} sets</div>
                </div>
                <Tag tone="forest">{ex.volume.toLocaleString()} kg</Tag>
              </label>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={pickDateOpen}
        onClose={() => setPickDateOpen(false)}
        title="Choose target date"
        subtitle="Copy selected exercises to this date"
        maxWidth="max-w-md"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <GhostButton
            variant="soft"
            size="icon"
            onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            <span className="text-white/70">‹</span>
          </GhostButton>
          <span className="font-display text-sm font-semibold text-white/90">
            {pickerMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <GhostButton
            variant="soft"
            size="icon"
            onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            <span className="text-white/70">›</span>
          </GhostButton>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {wdLabels.map((l) => (
            <div key={l} className="text-center text-[10px] uppercase tracking-wide text-white/40 py-1">
              {l}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((d, i) => {
            if (!d) return <div key={i} className="aspect-square" />;
            const k = toDateKey(d);
            const today = isTodayKey(k);
            return (
              <button
                key={k}
                onClick={() => handlePickDate(k)}
                className={cn(
                  'aspect-square rounded-lg text-sm transition',
                  'bg-white/5 border border-white/5 hover:bg-crimson/20 hover:border-crimson/50 text-white/80',
                  today && 'ring-2 ring-crimson ring-offset-1 ring-offset-ink-950 font-bold text-crimson-100',
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
          <GhostButton
            variant="ghost"
            size="sm"
            leftIcon={<CalendarDays size={14} />}
            onClick={() => handlePickDate(toDateKey(new Date()))}
          >
            Today
          </GhostButton>
        </div>
      </Modal>
    </>
  );
}
