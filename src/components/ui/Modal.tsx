import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  showClose?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const node = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative z-10 w-full rounded-t-2xl sm:rounded-xl3 glass animate-popIn overflow-hidden',
          maxWidth,
          'max-h-[92vh] flex flex-col',
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div className="min-w-0 pr-3">
              {title && (
                <h3 className="font-display text-lg sm:text-xl font-semibold text-white/95 leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-white/55 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {showClose && (
              <button
                aria-label="Close"
                onClick={onClose}
                className="shrink-0 h-9 w-9 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto overflow-x-hidden flex-1 px-5 pb-4 hardware-scroll">
          {children}
        </div>
        {footer && (
          <div className="border-t border-white/5 px-5 py-3 flex flex-col sm:flex-row sm:justify-end gap-2 bg-black/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}
