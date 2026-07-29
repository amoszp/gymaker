import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import GhostButton from '@/components/ui/GhostButton';
import DayCell from '@/components/calendar/DayCell';
import DayCopyModal from '@/components/calendar/DayCopyModal';
import WeekReview from '@/components/calendar/WeekReview';
import { useStore } from '@/store';
import {
  buildMonthGrid,
  weekdayLabels,
  formatMonthYear,
  toDateKey,
  isToday as isTodayKey,
  startOfWeek,
  formatShort,
} from '@/utils/date';

export default function CalendarPage() {
  const navigate = useNavigate();
  const workouts = useStore((s) => s.workouts);
  const weekStartsOn = useStore((s) => s.prefs.weekStartsOn);

  const [cursor, setCursor] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyModalDate, setCopyModalDate] = useState<string | null>(null);
  const [weekExpanded, setWeekExpanded] = useState(true);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor, weekStartsOn]);

  const grid = useMemo(() => {
    if (view === 'week') return weekDays;
    return buildMonthGrid(cursor, weekStartsOn);
  }, [cursor, weekStartsOn, view, weekDays]);
  const wdLabels = useMemo(() => weekdayLabels(weekStartsOn), [weekStartsOn]);

  const prev = () => {
    if (view === 'week') {
      const d = new Date(cursor);
      d.setDate(d.getDate() - 7);
      setCursor(d);
      return;
    }
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  };

  const next = () => {
    if (view === 'week') {
      const d = new Date(cursor);
      d.setDate(d.getDate() + 7);
      setCursor(d);
      return;
    }
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  };

  const gotoToday = () => {
    setCursor(new Date());
    setActiveKey(toDateKey(new Date()));
  };

  const headerTitle = useMemo(() => {
    if (view === 'month') return formatMonthYear(cursor);
    const startKey = toDateKey(weekDays[0]);
    const endKey = toDateKey(weekDays[6]);
    return `${formatShort(startKey)} — ${formatShort(endKey)}`;
  }, [cursor, view, weekDays]);

  const handleDayClick = (d: Date, key: string) => {
    const hasWorkout = workouts[key]?.exercises?.length > 0;
    setActiveKey(key);
    if (hasWorkout) {
      setCopyModalDate(key);
      setCopyModalOpen(true);
    }
  };

  const handleLogWorkout = (key: string) => {
    navigate(`/workout?date=${key}`);
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-ink-950 via-ink-950/95 to-transparent pb-2 pt-3">
        <div className="flex items-center justify-between gap-2 mb-3 px-1">
          <GhostButton
            variant="soft"
            size="icon"
            onClick={prev}
            aria-label={view === 'week' ? 'Previous week' : 'Previous month'}
          >
            <ChevronLeft size={18} />
          </GhostButton>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={16} className="text-crimson-100" />
              <h1 className="font-display text-base sm:text-lg font-semibold text-white/95">
                {headerTitle}
              </h1>
            </div>
            <GhostButton variant="soft" size="sm" onClick={gotoToday}>
              Today
            </GhostButton>
          </div>
          <GhostButton
            variant="soft"
            size="icon"
            onClick={next}
            aria-label={view === 'week' ? 'Next week' : 'Next month'}
          >
            <ChevronRight size={18} />
          </GhostButton>
        </div>
        <div className="flex items-center justify-center gap-2 px-1 mb-3">
          <GhostButton
            size="sm"
            variant={view === 'month' ? 'chip' : 'soft'}
            onClick={() => setView('month')}
          >
            Month
          </GhostButton>
          <GhostButton
            size="sm"
            variant={view === 'week' ? 'chip' : 'soft'}
            onClick={() => setView('week')}
          >
            Week
          </GhostButton>
        </div>
        <div className="grid grid-cols-7 gap-1.5 px-1 mb-1.5">
          {wdLabels.map((l) => (
            <div
              key={l}
              className="text-center text-[10px] uppercase tracking-widest text-white/40 py-1 font-medium"
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-1 pb-4">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {grid.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} className="aspect-square" />;
            const key = toDateKey(d);
            return (
              <DayCell
                key={key}
                date={d}
                dateKey={key}
                workout={workouts[key]}
                isToday={isTodayKey(key)}
                isActive={activeKey === key}
                onClick={() => handleDayClick(d, key)}
                showLogButton={activeKey === key}
                onLogWorkout={() => handleLogWorkout(key)}
              />
            );
          })}
        </div>
      </div>

      <div className="px-1 pb-6">
        <WeekReview
          expanded={weekExpanded}
          onToggle={() => setWeekExpanded((e) => !e)}
          referenceDate={new Date()}
        />
      </div>

      {copyModalDate && (
        <DayCopyModal
          open={copyModalOpen}
          onClose={() => {
            setCopyModalOpen(false);
            setCopyModalDate(null);
          }}
          dateKey={copyModalDate}
        />
      )}
    </div>
  );
}
