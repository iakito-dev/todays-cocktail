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
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ICON_MAP: Record<ToastType, ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ICON_STYLES: Record<ToastType, string> = {
  success:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200',
  error: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200',
  info: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-200',
};

const BORDER_STYLES: Record<ToastType, string> = {
  success:
    'border-emerald-200/80 text-emerald-950 dark:border-emerald-500/40 dark:text-emerald-50',
  error: 'border-rose-200/80 text-rose-950 dark:border-rose-500/40 dark:text-rose-50',
  info: 'border-slate-200/80 text-slate-900 dark:border-slate-500/40 dark:text-slate-50',
};

export function Toaster({ position = 'top-right' }: ToasterProps) {
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
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  }, [position]);

  const stackDirection = position.startsWith('bottom') ? 'flex-col-reverse' : 'flex-col';
  const hiddenTransform = position.startsWith('top') ? '-translate-y-3' : 'translate-y-3';

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex w-full max-w-sm gap-2 sm:max-w-md',
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
              'pointer-events-auto overflow-hidden rounded-xl border px-4 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur',
              'bg-white/90 text-sm text-gray-900 dark:bg-gray-900/90 dark:text-gray-100',
              'transition-all duration-300 ease-out',
              toastItem.visible ? 'opacity-100 translate-y-0' : cn('opacity-0', hiddenTransform),
              BORDER_STYLES[toastType],
              'shadow-[0px_8px_20px_-12px_rgba(15,23,42,0.4)]'
            )}
            role={isDestructive ? 'alert' : 'status'}
            aria-live={isDestructive ? 'assertive' : 'polite'}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-1 gap-3">
                <span
                  className={cn('mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-base', ICON_STYLES[toastType])}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold leading-tight">{toastItem.title}</p>
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
                className="text-xs text-gray-500 transition hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="トーストを閉じる"
              >
                ×
              </button>
            </div>
            {toastItem.duration !== Infinity ? (
              <div className="mt-3 h-1 w-full rounded-full bg-black/10 dark:bg-white/10">
                <span
                  className="toast-progress block h-full w-full rounded-full bg-current/50"
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
