import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import Modal from '@/components/ui/Modal';
import GhostButton from '@/components/ui/GhostButton';
import Tag from '@/components/ui/Tag';
import { Search, Plus, Trash2 } from 'lucide-react';
import type { ExerciseLibraryEntry } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LibraryModal({ open, onClose }: Props) {
  const library = useStore((s) => s.library);
  const workouts = useStore((s) => s.workouts);
  const renameLibraryExercise = useStore((s) => s.renameLibraryExercise);
  const removeLibraryExercise = useStore((s) => s.removeLibraryExercise);
  const setLibraryTags = useStore((s) => s.setLibraryTags);
  const addLibraryExercise = useStore((s) => s.addLibraryExercise);

  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [editNames, setEditNames] = useState<Record<string, string>>({});

  const entries = useMemo<ExerciseLibraryEntry[]>(() => {
    const list = Object.values(library);
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : list;
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [library, query]);

  const hasPastLogs = (name: string) => {
    const key = name.toLowerCase();
    for (const dk of Object.keys(workouts)) {
      const w = workouts[dk];
      if (w?.exercises?.some((e) => e.name.toLowerCase() === key)) {
        return true;
      }
    }
    for (const r of useStore.getState().routines) {
      if (r.exercises.some((e) => e.name.toLowerCase() === key)) return true;
    }
    return false;
  };

  const handleRename = (entry: ExerciseLibraryEntry) => {
    const newVal = editNames[entry.name] ?? entry.name;
    if (!newVal.trim() || newVal.trim() === entry.name) return;
    if (hasPastLogs(entry.name)) {
      const ok = window.confirm(
        `Renaming "${entry.name}" will update past workouts and routines. Continue?`,
      );
      if (!ok) return;
    }
    renameLibraryExercise(entry.name, newVal.trim());
  };

  const handleAddTag = (entry: ExerciseLibraryEntry) => {
    const raw = tagInputs[entry.name] ?? '';
    const t = raw.trim();
    if (!t) return;
    if (entry.tags.includes(t)) return;
    setLibraryTags(entry.name, [...entry.tags, t]);
    setTagInputs({ ...tagInputs, [entry.name]: '' });
  };

  const handleRemoveTag = (entry: ExerciseLibraryEntry, tag: string) => {
    setLibraryTags(
      entry.name,
      entry.tags.filter((t) => t !== tag),
    );
  };

  const handleAddNew = () => {
    const n = newName.trim();
    if (!n) return;
    addLibraryExercise(n);
    setNewName('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Exercise Library"
      subtitle={`${entries.length} exercises`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises or tags..."
            className="input-base pl-9"
          />
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 hardware-scroll">
          {entries.map((entry) => (
            <div
              key={entry.name}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <input
                  value={editNames[entry.name] ?? entry.name}
                  onChange={(e) =>
                    setEditNames({ ...editNames, [entry.name]: e.target.value })
                  }
                  onBlur={() => handleRename(entry)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  className="input-base !py-1.5 text-sm flex-1"
                />
                <button
                  aria-label="Delete exercise"
                  onClick={() => {
                    if (
                      window.confirm(`Delete exercise "${entry.name}" from library?`)
                    ) {
                      removeLibraryExercise(entry.name);
                    }
                  }}
                  className="h-9 w-9 shrink-0 rounded-full border border-white/10 text-white/60 hover:text-crimson hover:border-crimson/50 hover:bg-crimson/10 flex items-center justify-center transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {entry.tags.map((t) => (
                  <Tag
                    key={t}
                    tone="crimson"
                    onRemove={() => handleRemoveTag(entry, t)}
                  >
                    {t}
                  </Tag>
                ))}
                <div className="flex items-center gap-1.5">
                  <input
                    value={tagInputs[entry.name] ?? ''}
                    onChange={(e) =>
                      setTagInputs({ ...tagInputs, [entry.name]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(entry);
                      }
                    }}
                    placeholder="Add tag"
                    className="!w-32 !py-1 !text-xs input-base"
                  />
                  <GhostButton
                    size="sm"
                    variant="soft"
                    onClick={() => handleAddTag(entry)}
                    className="border-white/10 text-white/70"
                  >
                    <Plus size={14} />
                  </GhostButton>
                </div>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <p className="text-sm text-white/40 text-center py-8">
              No exercises found
            </p>
          )}
        </div>

        <div className="rounded-xl border border-dashed border-white/10 p-3 flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddNew();
            }}
            placeholder="New exercise name..."
            className="input-base !py-2 text-sm flex-1"
          />
          <GhostButton variant="ghost" onClick={handleAddNew}>
            <Plus size={16} /> Add
          </GhostButton>
        </div>
      </div>
    </Modal>
  );
}
