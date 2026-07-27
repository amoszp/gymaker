import { useStore } from '@/store';
import GhostButton from '@/components/ui/GhostButton';
import type { WeightIncrement, WeekStartsOn } from '@/types';

const WEIGHT_OPTS: WeightIncrement[] = [0.5, 1, 2.5];
const WEEK_OPTS: { label: string; value: WeekStartsOn }[] = [
  { label: 'Monday', value: 1 },
  { label: 'Sunday', value: 0 },
];

export default function Preferences() {
  const prefs = useStore((s) => s.prefs);
  const setPrefs = useStore((s) => s.setPrefs);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-white/80 mb-2.5 font-display">
          Weight Increment
        </p>
        <div className="flex flex-wrap gap-2">
          {WEIGHT_OPTS.map((v) => {
            const selected = prefs.weightIncrement === v;
            return (
              <GhostButton
                key={v}
                variant={selected ? 'solid' : 'soft'}
                size="md"
                onClick={() => setPrefs({ weightIncrement: v })}
                className={
                  selected
                    ? ''
                    : 'border-white/10 text-white/70 hover:text-white'
                }
              >
                {v} kg
              </GhostButton>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-white/80 mb-2.5 font-display">
          Week Starts On
        </p>
        <div className="flex flex-wrap gap-2">
          {WEEK_OPTS.map((opt) => {
            const selected = prefs.weekStartsOn === opt.value;
            return (
              <GhostButton
                key={opt.value}
                variant={selected ? 'solid' : 'soft'}
                size="md"
                onClick={() => setPrefs({ weekStartsOn: opt.value })}
                className={
                  selected
                    ? ''
                    : 'border-white/10 text-white/70 hover:text-white'
                }
              >
                {opt.label}
              </GhostButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}
