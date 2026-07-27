import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  soft?: boolean;
  hover?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { children, className, soft = false, hover = false, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-xl3 p-4 sm:p-5 animate-fadeIn',
        soft ? 'glass-soft' : 'glass',
        hover &&
          'transition duration-200 hover:-translate-y-0.5 hover:shadow-crimson',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export default GlassCard;
