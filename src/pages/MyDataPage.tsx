import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { computeAllPRs, computeQuickStats } from '@/utils/pr';
import type { SortDirection } from '@/components/data/SearchBar';
import QuickStats from '@/components/data/QuickStats';
import SearchBar from '@/components/data/SearchBar';
import PRCard from '@/components/data/PRCard';
import type { PRBest } from '@/types';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border border-dashed border-white/10 bg-ink-950/30">
      <div className="text-5xl mb-4 opacity-40">🏋️</div>
      <h3 className="text-lg font-semibold text-white/70 mb-2">No PRs yet</h3>
      <p className="text-sm text-white/40 text-center max-w-xs">
        Start logging workouts to see your personal records and statistics appear here.
      </p>
    </div>
  );
}

export default function MyDataPage() {
  const workouts = useStore((s) => s.workouts);
  const [nameQuery, setNameQuery] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const prs = useMemo(() => computeAllPRs(workouts), [workouts]);
  const stats = useMemo(() => computeQuickStats(workouts), [workouts]);

  const filteredSortedPRs = useMemo(() => {
    const list: PRBest[] = Object.values(prs);
    const nq = nameQuery.trim().toLowerCase();
    const tq = tagQuery.trim().toLowerCase();

    const filtered = list.filter((pr) => {
      const nameMatch = !nq || pr.exercise.toLowerCase().includes(nq);
      const tagMatch =
        !tq || pr.tags.some((t) => t.toLowerCase().includes(tq));
      return nameMatch && tagMatch;
    });

    filtered.sort((a, b) =>
      sortDir === 'desc' ? b.e1RM - a.e1RM : a.e1RM - b.e1RM,
    );

    return filtered;
  }, [prs, nameQuery, tagQuery, sortDir]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          My Data
        </h1>
        <p className="text-sm text-white/40">
          Personal records &amp; statistics
        </p>
      </header>

      <QuickStats stats={stats} />

      <SearchBar
        nameQuery={nameQuery}
        onNameQueryChange={setNameQuery}
        tagQuery={tagQuery}
        onTagQueryChange={setTagQuery}
        sortDir={sortDir}
        onSortToggle={() =>
          setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
        }
      />

      {filteredSortedPRs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSortedPRs.map((pr) => (
            <PRCard key={pr.exercise} pr={pr} />
          ))}
        </div>
      )}
    </div>
  );
}
