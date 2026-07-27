import { cn } from '@/lib/utils';

interface TagProps {
  children: React.ReactNode;
  tone?: 'default' | 'crimson' | 'forest' | 'gold';
  onRemove?: () => void;
  className?: string;
}

export default function Tag({
  children,
  tone = 'default',
  onRemove,
  className,
}: TagProps) {
  const toneClass =
    tone === 'crimson'
      ? 'chip--crimson'
      : tone === 'forest'
        ? 'chip--forest'
        : tone === 'gold'
          ? 'chip--gold'
          : '';
  return (
    <span className={cn('chip', toneClass, className)}>
      <span className="truncate max-w-[140px]">{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-white/60 hover:text-white/90 leading-none"
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
}
