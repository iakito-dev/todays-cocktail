import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ComponentType, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  description?: ReactNode;
  duration?: number;
  type?: ToastType;
}

interface ToastPayload extends ToastOptions {
  id: number;
  title: ReactNode;
}

type ToastListener = (toast: ToastPayload) => void;

const listeners = new Set<ToastListener>();
let toastId = 0;

const DEFAULT_DURATION = 3000;
const EXIT_ANIMATION_DURATION = 200;

const emitToast = (payload: Omit<ToastPayload, 'id'>) => {
  toastId += 1;
  const toast: ToastPayload = { id: toastId, ...payload };
  listeners.forEach((listener) => listener(toast));
};

interface InternalToast extends ToastPayload {
  duration: number;
  visible: boolean;
}

const createEmitter = (type: ToastType) => {
  return (title: ReactNode, options?: ToastOptions) => {
    emitToast({
      title,
      type,
      description: options?.description,
      duration: options?.duration,
    });
  };
};

export const toast = {
  success: createEmitter('success'),
  error: createEmitter('error'),
  info: createEmitter('info'),
};

export interface ToasterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

const ICON_MAP: Record<ToastType, ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ICON_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-100',
  error: 'bg-rose-100 text-rose-600 dark:bg-rose-400/20 dark:text-rose-100',
  info: 'bg-slate-100 text-slate-600 dark:bg-slate-400/20 dark:text-slate-100',
};

const SHADOW_STYLES: Record<ToastType, string> = {
  success: 'shadow-[0_18px_42px_-26px_rgba(4,120,87,0.55)]',
  error: 'shadow-[0_18px_42px_-26px_rgba(190,18,60,0.45)]',
  info: 'shadow-[0_18px_42px_-30px_rgba(15,23,42,0.35)]',
};

export function Toaster({ position = 'top-center' }: ToasterProps) {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const timers = useRef<Map<number, number>>(new Map());
  const exitTimers = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimer = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimer(id);

      setToasts((prev) =>
        prev.map((toastItem) =>
          toastItem.id === id ? { ...toastItem, visible: false } : toastItem
        )
      );

      if (exitTimers.current.has(id)) {
        return;
      }

      const exitTimer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((toastItem) => toastItem.id !== id));
        exitTimers.current.delete(id);
      }, EXIT_ANIMATION_DURATION);

      exitTimers.current.set(id, exitTimer);
    },
    [clearTimer]
  );

  useEffect(() => {
    const listener: ToastListener = (toastItem) => {
      const duration = toastItem.duration ?? DEFAULT_DURATION;
      const toastWithState: InternalToast = {
        ...toastItem,
        duration,
        visible: false,
      };

      setToasts((prev) => [...prev, toastWithState]);

      window.requestAnimationFrame(() => {
        setToasts((prev) =>
          prev.map((item) => (item.id === toastWithState.id ? { ...item, visible: true } : item))
        );
      });

      if (duration !== Infinity) {
        const timer = window.setTimeout(() => {
          dismiss(toastWithState.id);
        }, duration);
        timers.current.set(toastWithState.id, timer);
      }
    };

    listeners.add(listener);

    const timersMap = timers.current;
    const exitTimersMap = exitTimers.current;

    return () => {
      listeners.delete(listener);
      timersMap.forEach((timer) => window.clearTimeout(timer));
      timersMap.clear();
      exitTimersMap.forEach((timer) => window.clearTimeout(timer));
      exitTimersMap.clear();
    };
  }, [dismiss]);

  const positionClasses = useMemo(() => {
    switch (position) {
      case 'top-center':
        return 'top-6 left-1/2 -translate-x-1/2 items-center';
      case 'top-left':
        return 'top-6 left-4 items-start';
      case 'bottom-right':
        return 'bottom-6 right-4 items-end';
      case 'bottom-left':
        return 'bottom-6 left-4 items-start';
      case 'top-right':
      default:
        return 'top-6 right-4 items-end';
    }
  }, [position]);

  const stackDirection = position.includes('bottom') ? 'flex-col-reverse' : 'flex-col';
  const hiddenTransform = position.includes('top') ? '-translate-y-3' : 'translate-y-3';

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex w-full max-w-md gap-3 px-4 sm:px-0',
        stackDirection,
        positionClasses
      )}
    >
      {toasts.map((toastItem) => {
        const toastType: ToastType = toastItem.type ?? 'info';
        const Icon: ComponentType<{ className?: string }> = ICON_MAP[toastType] ?? Info;
        const isDestructive = toastType === 'error';

        return (
          <div
            key={toastItem.id}
            className={cn(
              'pointer-events-auto w-full overflow-hidden rounded-2xl border px-5 py-4 backdrop-blur',
              'transition-all duration-300 ease-out text-sm',
              toastItem.visible ? 'opacity-100 translate-y-0' : cn('opacity-0', hiddenTransform),
              toastType === 'success' &&
                cn(
                  'bg-emerald-50/90 text-emerald-700',
                  'border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-50 dark:border-emerald-500/40'
                ),
              toastType === 'error' &&
                cn(
                  'bg-rose-50/90 text-rose-700',
                  'border-rose-200/70 dark:bg-rose-500/15 dark:text-rose-50 dark:border-rose-500/40'
                ),
              toastType === 'info' &&
                cn(
                  'bg-slate-50/90 text-slate-700',
                  'border-slate-200/80 dark:bg-slate-500/15 dark:text-slate-50 dark:border-slate-500/40'
                ),
              SHADOW_STYLES[toastType]
            )}
            role={isDestructive ? 'alert' : 'status'}
            aria-live={isDestructive ? 'assertive' : 'polite'}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 gap-3">
                <span
                  className={cn(
                    'mt-[3px] flex h-7 w-7 items-center justify-center rounded-full text-base ring-1 ring-inset ring-black/5',
                    ICON_STYLES[toastType]
                  )}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-medium leading-tight">{toastItem.title}</p>
                  {toastItem.description ? (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {toastItem.description}
                    </div>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  dismiss(toastItem.id);
                }}
                className="text-base leading-none text-gray-400 transition hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-300 dark:text-gray-300 dark:hover:text-gray-50"
                aria-label="トーストを閉じる"
              >
                ×
              </button>
            </div>
            {toastItem.duration !== Infinity ? (
              <div className="mt-3 h-1 w-full rounded-full bg-black/10 dark:bg-white/15">
                <span
                  className="toast-progress block h-full w-full rounded-full bg-current/40"
                  style={{ animationDuration: `${toastItem.duration}ms` }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>,
    document.body
  );
}
