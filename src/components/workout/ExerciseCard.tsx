import {
  memo,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GhostButton from '@/components/ui/GhostButton';
import Tag from '@/components/ui/Tag';
import SetCard from '@/components/workout/SetCard';
import { useStore } from '@/store';
import type { ExerciseSet, LoggedExercise, PRBest } from '@/types';
import { comparePR } from '@/utils/pr';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  dateKey: string;
  exercise: LoggedExercise;
  allTimePRs: Record<string, PRBest>;
}

const ExerciseCard = memo(function ExerciseCard({
  dateKey,
  exercise,
  allTimePRs,
}: ExerciseCardProps) {
  const {
    renameExercise,
    removeExercise,
    addSet,
    setExerciseTags,
    setExerciseNotes,
    library,
    prefs,
    addLibraryExercise,
  } = useStore();
  const workouts = useStore((s) => s.workouts);

  const [acQuery, setAcQuery] = useState('');
  const [acOpen, setAcOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = acQuery.trim().toLowerCase();
    const entries = Object.values(library);
    if (!q) return entries.slice(0, 8);
    return entries
      .filter((e) => e.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [acQuery, library]);

  const prBestForEx = allTimePRs[exercise.name] ?? null;

  const setIsPR = (s: ExerciseSet, idx: number): boolean => {
    const prevSetsSameDay = exercise.sets.slice(0, idx);
    let rolling: { weight: number | ''; reps: number | '' } | null = prBestForEx
      ? { weight: prBestForEx.weight, reps: prBestForEx.reps }
      : null;
    if (!rolling) {
      const historySets: { weight: number | ''; reps: number | '' }[] = [];
      const keys = Object.keys(workouts).sort();
      for (const dk of keys) {
        if (dk >= dateKey) continue;
        const w = workouts[dk];
        for (const ex of w?.exercises ?? []) {
          if (ex.name.toLowerCase() !== exercise.name.toLowerCase()) continue;
          for (const st of ex.sets) historySets.push(st);
        }
      }
      for (const h of [...historySets, ...prevSetsSameDay]) {
        if (!rolling || comparePR(h, rolling)) rolling = h;
      }
      return comparePR(s, rolling);
    }
    for (const p of prevSetsSameDay) {
      if (comparePR(p, rolling)) rolling = p;
    }
    return comparePR(s, rolling);
  };

  const handlePickLibrary = (name: string) => {
    const key = name.toLowerCase();
    const entry = library[key];
    renameExercise(dateKey, exercise.id, name);
    if (entry) {
      const tags = entry.lastUsed?.tags?.length
        ? entry.lastUsed.tags
        : entry.tags ?? [];
      if (tags.length) setExerciseTags(dateKey, exercise.id, tags);
    }
    if (!entry) addLibraryExercise(name);
    setAcOpen(false);
    setAcQuery('');
  };

  const handleNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = (e.target as HTMLInputElement).value.trim();
      if (v) {
        renameExercise(dateKey, exercise.id, v);
        if (!library[v.toLowerCase()]) addLibraryExercise(v);
      }
      setAcOpen(false);
      setAcQuery('');
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleAddSet = () => {
    addSet(dateKey, exercise.id);
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const last = el.lastElementChild as HTMLElement | null;
          if (last) {
            const x =
              last.offsetLeft - el.clientWidth / 2 + last.clientWidth / 2;
            el.scrollTo({ left: x, behavior: 'smooth' });
          }
        });
      });
    }
  };

  const handleAddTag = () => {
    const t = newTag.trim();
    if (!t) return;
    if (exercise.tags.includes(t)) {
      setNewTag('');
      return;
    }
    setExerciseTags(dateKey, exercise.id, [...exercise.tags, t]);
    setNewTag('');
  };

  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <GlassCard className="relative">
      <button
        onClick={() => removeExercise(dateKey, exercise.id)}
        aria-label="Remove exercise"
        className="absolute top-3 right-3 h-8 w-8 rounded-lg border border-white/10 text-white/50 hover:text-crimson-100 hover:border-crimson/50 hover:bg-crimson/10 flex items-center justify-center transition"
      >
        <X size={14} />
      </button>

      <div className="relative mb-3 pr-10">
        <input
          type="text"
          defaultValue={exercise.name}
          onFocus={() => setAcOpen(true)}
          onBlur={() => setTimeout(() => setAcOpen(false), 150)}
          onChange={(e) => setAcQuery(e.target.value)}
          onKeyDown={handleNameKey}
          placeholder="Exercise name..."
          className={cn(
            'input-base font-display text-lg font-semibold',
            '!py-2.5',
          )}
        />
        {acOpen && (
          <div className="absolute z-30 left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-ink-950/95 backdrop-blur-lg shadow-2xl hardware-scroll">
            {matches.length === 0 && (
              <div className="px-3 py-4 text-sm text-white/40 text-center">
                No matches — press Enter to create &quot;
                {acQuery.trim() || 'new'}&quot;
              </div>
            )}
            {matches.map((m) => (
              <button
                key={m.name}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePickLibrary(m.name);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-white/10 transition flex flex-col gap-0.5 border-b border-white/5 last:border-0"
              >
                <span className="font-medium text-white/90">{m.name}</span>
                {m.lastUsed && (
                  <span className="text-[11px] text-white/45">
                    Last:{' '}
                    {m.lastUsed.sets
                      .map((s) => `${s.weight}×${s.reps}`)
                      .join(' · ') || '—'}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3">
        <button
          onClick={() => setTagsOpen((v) => !v)}
          className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-white/45 hover:text-white/70 transition"
        >
          Tags
          {tagsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {tagsOpen && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {exercise.tags.map((t) => (
              <Tag
                key={t}
                onRemove={() =>
                  setExerciseTags(
                    dateKey,
                    exercise.id,
                    exercise.tags.filter((x) => x !== t),
                  )
                }
              >
                {t}
              </Tag>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKey}
                placeholder="Add tag"
                className="w-24 h-7 rounded-lg bg-ink-950/60 border border-white/10 px-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-crimson/60"
              />
              <GhostButton
                size="icon"
                variant="soft"
                className="!h-7 !w-7"
                onClick={handleAddTag}
              >
                <Plus size={12} />
              </GhostButton>
            </div>
          </div>
        )}
      </div>

      <textarea
        rows={2}
        defaultValue={exercise.notes ?? ''}
        onChange={(e) => setExerciseNotes(dateKey, exercise.id, e.target.value)}
        placeholder="Notes..."
        className="input-base resize-none mb-4"
      />

      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 overflow-x-auto hardware-scroll row-scroll pb-2 -mx-1 px-1"
      >
        {exercise.sets.map((s, idx) => (
          <SetCard
            key={s.id}
            dateKey={dateKey}
            exId={exercise.id}
            set={s}
            index={idx}
            isPR={setIsPR(s, idx)}
            weightIncrement={prefs.weightIncrement}
          />
        ))}
        <button
          onClick={handleAddSet}
          className="shrink-0 w-[110px] rounded-xl border border-dashed border-white/15 bg-crimson/15 text-white/50 hover:text-crimson-100 hover:border-crimson/50 hover:bg-crimson/20 flex flex-col items-center justify-center gap-1 transition text-xs font-medium tracking-wide"
        >
          <Plus size={18} />
          Add Set
        </button>
      </div>
    </GlassCard>
  );
});

export default ExerciseCard;
