import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import Modal from '@/components/ui/Modal';
import GhostButton from '@/components/ui/GhostButton';
import { Plus, Trash2 } from 'lucide-react';
import type { RoutineExerciseSeed, RoutineTemplate } from '@/types';
import { DEFAULT_REPS, DEFAULT_WEIGHT } from '@/utils/defaults';

interface Props {
  open: boolean;
  onClose: () => void;
  routine: RoutineTemplate | null;
}

function emptySeed(): RoutineExerciseSeed {
  return { name: '', sets: 3, defaultWeight: DEFAULT_WEIGHT, defaultReps: DEFAULT_REPS };
}

export default function RoutineEditModal({ open, onClose, routine }: Props) {
  const addRoutine = useStore((s) => s.addRoutine);
  const updateRoutine = useStore((s) => s.updateRoutine);

  const [name, setName] = useState('');
  const [seeds, setSeeds] = useState<RoutineExerciseSeed[]>([]);

  useEffect(() => {
    if (!open) return;
    if (routine) {
      setName(routine.name);
      setSeeds(
        routine.exercises.map((e) => ({
          name: e.name,
          sets: e.sets,
          defaultWeight: e.defaultWeight ?? DEFAULT_WEIGHT,
          defaultReps: e.defaultReps ?? DEFAULT_REPS,
        })),
      );
    } else {
      setName('');
      setSeeds([emptySeed()]);
    }
  }, [open, routine]);

  const updateSeed = (idx: number, patch: Partial<RoutineExerciseSeed>) => {
    setSeeds(seeds.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSeed = () => setSeeds([...seeds, emptySeed()]);

  const removeSeed = (idx: number) => {
    if (seeds.length <= 1) return;
    setSeeds(seeds.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const clean = seeds
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name.trim(),
        sets: Math.max(1, s.sets | 0),
        defaultWeight: s.defaultWeight,
        defaultReps: s.defaultReps,
      }));
    if (!name.trim()) {
      alert('Routine name required');
      return;
    }
    if (!clean.length) {
      alert('Add at least one exercise');
      return;
    }
    if (routine) {
      updateRoutine(routine.id, { name: name.trim(), exercises: clean });
    } else {
      addRoutine(name.trim(), clean);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={routine ? 'Edit Routine' : 'New Routine'}
      subtitle="Build exercise seeds with defaults"
      maxWidth="max-w-2xl"
      footer={
        <>
          <GhostButton variant="soft" onClick={onClose} className="border-white/10 text-white/70">
            Cancel
          </GhostButton>
          <GhostButton variant="solid" onClick={handleSave}>
            Save Routine
          </GhostButton>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-white/50 block mb-1">Routine Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. PUSH DAY"
            className="input-base"
          />
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 hardware-scroll">
          {seeds.map((seed, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <input
                  value={seed.name}
                  onChange={(e) => updateSeed(idx, { name: e.target.value })}
                  placeholder="Exercise name"
                  className="input-base !py-2 text-sm flex-1"
                />
                <button
                  aria-label="Remove exercise"
                  onClick={() => removeSeed(idx)}
                  disabled={seeds.length <= 1}
                  className="h-9 w-9 shrink-0 rounded-full border border-white/10 text-white/60 hover:text-crimson hover:border-crimson/50 hover:bg-crimson/10 flex items-center justify-center transition disabled:opacity-30"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wide block mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={seed.sets}
                    onChange={(e) =>
                      updateSeed(idx, { sets: Number(e.target.value) })
                    }
                    className="input-base !py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wide block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={seed.defaultWeight ?? ''}
                    onChange={(e) =>
                      updateSeed(idx, {
                        defaultWeight: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    className="input-base !py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wide block mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={seed.defaultReps ?? ''}
                    onChange={(e) =>
                      updateSeed(idx, {
                        defaultReps: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    className="input-base !py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <GhostButton variant="soft" onClick={addSeed} className="w-full border-white/10 text-white/70">
          <Plus size={16} /> Add Exercise Seed
        </GhostButton>
      </div>
    </Modal>
  );
}
