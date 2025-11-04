import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
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

const emitToast = (payload: Omit<ToastPayload, 'id'>) => {
  toastId += 1;
  const toast: ToastPayload = { id: toastId, ...payload };
  listeners.forEach((listener) => listener(toast));
};

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

export function Toaster({ position = 'top-right' }: ToasterProps) {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const listener: ToastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      const duration = toast.duration ?? DEFAULT_DURATION;
      if (duration !== Infinity) {
        const timer = window.setTimeout(() => {
          setToasts((prev) => prev.filter((item) => item.id !== toast.id));
          timers.current.delete(toast.id);
        }, duration);
        timers.current.set(toast.id, timer);
      }
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

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

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className={cn('fixed z-50 flex max-w-sm flex-col gap-2', positionClasses)}>
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          className={cn(
            'rounded-md border px-4 py-3 shadow-lg transition-all duration-200',
            'bg-white text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100',
            toastItem.type === 'success' && 'border-emerald-500',
            toastItem.type === 'error' && 'border-rose-500',
            toastItem.type === 'info' && 'border-slate-300'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium leading-tight">{toastItem.title}</p>
              {toastItem.description ? (
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                  {toastItem.description}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                const timer = timers.current.get(toastItem.id);
                if (timer) {
                  window.clearTimeout(timer);
                  timers.current.delete(toastItem.id);
                }
                setToasts((prev) => prev.filter((item) => item.id !== toastItem.id));
              }}
              className="text-xs text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
