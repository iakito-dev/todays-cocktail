import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  description?: ReactNode;
  duration?: number;
  type?: ToastType;
}

export interface ToastPayload extends ToastOptions {
  id: number;
  title: ReactNode;
}

export type ToastListener = (toast: ToastPayload) => void;

const listeners = new Set<ToastListener>();
let toastId = 0;

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

export function subscribeToToast(listener: ToastListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
