import { Search, ArrowUpDown } from 'lucide-react';

export type SortDirection = 'desc' | 'asc';

interface SearchBarProps {
  nameQuery: string;
  onNameQueryChange: (v: string) => void;
  tagQuery: string;
  onTagQueryChange: (v: string) => void;
  sortDir: SortDirection;
  onSortToggle: () => void;
}

export default function SearchBar({
  nameQuery,
  onNameQueryChange,
  tagQuery,
  onTagQueryChange,
  sortDir,
  onSortToggle,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          type="text"
          value={nameQuery}
          onChange={(e) => onNameQueryChange(e.target.value)}
          placeholder="Search by name"
          className="input-base pl-9"
        />
      </div>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          type="text"
          value={tagQuery}
          onChange={(e) => onTagQueryChange(e.target.value)}
          placeholder="Search by tag"
          className="input-base pl-9"
        />
      </div>
      <button
        onClick={onSortToggle}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07] hover:text-white transition self-start sm:self-auto"
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">
          Weight: {sortDir === 'desc' ? 'High → Low' : 'Low → High'}
        </span>
      </button>
    </div>
  );
}
