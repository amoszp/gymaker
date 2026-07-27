import Modal from '@/components/ui/Modal';
import GlassCard from '@/components/ui/GlassCard';
import GhostButton from '@/components/ui/GhostButton';
import { useStore } from '@/store';

interface RoutinePickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (routineId: string) => void;
}

export default function RoutinePickerModal({
  open,
  onClose,
  onPick,
}: RoutinePickerModalProps) {
  const routines = useStore((s) => s.routines);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply routine"
      subtitle="Inject a routine template into today's workout"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-3">
        {routines.length === 0 && (
          <p className="text-sm text-white/50 text-center py-6">
            No routines yet. Create one in Settings.
          </p>
        )}
        {routines.map((r) => (
          <GlassCard key={r.id} hover className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-display font-semibold text-white/95">
                  {r.name}
                </h4>
                <p className="text-xs text-white/50 mt-0.5">
                  {r.exercises.length} exercise
                  {r.exercises.length === 1 ? '' : 's'}
                </p>
              </div>
              <GhostButton
                size="sm"
                variant="solid"
                onClick={() => {
                  onPick(r.id);
                  onClose();
                }}
              >
                Use
              </GhostButton>
            </div>
            <ul className="text-xs text-white/55 space-y-0.5 pt-1">
              {r.exercises.map((e, i) => (
                <li key={i} className="truncate">
                  <span className="text-white/75 font-medium">
                    {e.sets}×
                  </span>{' '}
                  {e.name}
                  {e.defaultWeight ? ` · ${e.defaultWeight}kg` : ''}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </Modal>
  );
}
