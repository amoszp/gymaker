import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type Variant = 'ghost' | 'solid' | 'soft' | 'chip';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface GhostButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium tracking-tight rounded-xl select-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-crimson/60 focus:ring-offset-2 focus:ring-offset-ink-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

const variants: Record<Variant, string> = {
  ghost:
    'border border-crimson/60 text-crimson-100 bg-crimson/5 hover:bg-crimson/10 hover:border-crimson hover:shadow-crimson',
  solid:
    'bg-crimson text-white border border-crimson/70 shadow-crimson hover:bg-crimson-500/90',
  soft:
    'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white',
  chip: 'text-xs px-2.5 py-1 rounded-full border border-crimson/50 text-crimson-100 bg-crimson/10 hover:bg-crimson/20',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
  icon: 'h-9 w-9 p-0',
};

const GhostButton = forwardRef<HTMLButtonElement, GhostButtonProps>(
  function GhostButton(
    {
      className,
      variant = 'ghost',
      size = 'md',
      loading,
      leftIcon,
      rightIcon,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...rest}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 rounded-full border-2 border-crimson/40 border-t-crimson animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </button>
    );
  },
);

export default GhostButton;
