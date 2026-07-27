import { useStore } from '@/store';
import GhostButton from '@/components/ui/GhostButton';
import Tag from '@/components/ui/Tag';
import { Pencil, Trash2 } from 'lucide-react';
import type { RoutineTemplate } from '@/types';

interface Props {
  routine: RoutineTemplate;
  onEdit: () => void;
}

export default function RoutineRow({ routine, onEdit }: Props) {
  const removeRoutine = useStore((s) => s.removeRoutine);

  const handleDelete = () => {
    if (window.confirm(`Delete routine "${routine.name}"?`)) {
      removeRoutine(routine.id);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <Tag tone="crimson" className="shrink-0 font-display text-[11px] px-3 py-1">
        {routine.name}
      </Tag>
      <span className="text-sm text-white/60 flex-1">
        {routine.exercises.length} exs
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <GhostButton
          variant="soft"
          size="icon"
          onClick={onEdit}
          className="border-white/10 text-white/70 hover:text-white"
          aria-label="Edit routine"
        >
          <Pencil size={15} />
        </GhostButton>
        <GhostButton
          variant="soft"
          size="icon"
          onClick={handleDelete}
          className="border-white/10 text-white/60 hover:text-crimson hover:border-crimson/50"
          aria-label="Delete routine"
        >
          <Trash2 size={15} />
        </GhostButton>
      </div>
    </div>
  );
}
