import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useStore } from '@/store';
import {
  buildMonthGrid,
  formatMonthYear,
  fromDateKey,
  isToday,
  toDateKey,
  weekdayLabels,
} from '@/utils/date';
import { cn } from '@/lib/utils';

interface MiniCalendarModalProps {
  open: boolean;
  onClose: () => void;
  selectedKey: string;
  onSelect: (dateKey: string) => void;
}

export default function MiniCalendarModal({
  open,
  onClose,
  selectedKey,
  onSelect,
}: MiniCalendarModalProps) {
  const prefs = useStore((s) => s.prefs);
  const workouts = useStore((s) => s.workouts);
  const initialDate = useMemo(() => fromDateKey(selectedKey), [selectedKey]);
  const [cursor, setCursor] = useState<Date>(initialDate);

  const grid = useMemo(
    () => buildMonthGrid(cursor, prefs.weekStartsOn),
    [cursor, prefs.weekStartsOn],
  );
  const labels = useMemo(
    () => weekdayLabels(prefs.weekStartsOn),
    [prefs.weekStartsOn],
  );

  const prevMonth = () => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  };

  const handlePick = (d: Date) => {
    onSelect(toDateKey(d));
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={formatMonthYear(cursor)}
      subtitle="Pick a day"
      maxWidth="max-w-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="h-9 w-9 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={nextMonth}
          className="h-9 w-9 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {labels.map((l) => (
          <div
            key={l}
            className="text-[10px] tracking-widest uppercase text-white/40 text-center py-1"
          >
            {l[0]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = toDateKey(d);
          const hasWorkout = workouts[key]?.exercises?.length > 0;
          const today = isToday(key);
          const selected = key === selectedKey;
          return (
            <button
              key={i}
              onClick={() => handlePick(d)}
              className={cn(
                'relative aspect-square rounded-lg text-sm flex items-center justify-center transition font-medium',
                selected
                  ? 'bg-crimson text-white border border-crimson shadow-crimson'
                  : today
                    ? 'text-white border-2 border-crimson/70 hover:bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent',
              )}
            >
              {d.getDate()}
              {hasWorkout && !selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-forest shadow-[0_0_6px_rgba(29,185,84,0.6)]" />
              )}
              {hasWorkout && selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-white/90" />
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
