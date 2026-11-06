import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  durationMs?: number;
}

interface ToastItem {
  id: string;
  dedupeKey: string;
  type: ToastType;
  message: string;
}

interface ToastHelpers {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

interface ToastContextType {
  toast: ToastHelpers;
  dismissToast: (id: string) => void;
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 1500,
  info: 1500,
  warning: 2000,
  error: 2000,
};

const MAX_VISIBLE_TOASTS = 3;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((item) => item.id !== id));
    },
    [clearTimer]
  );

  const scheduleDismiss = useCallback(
    (id: string, durationMs: number) => {
      clearTimer(id);
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, durationMs);
      timersRef.current.set(id, timer);
    },
    [clearTimer]
  );

  const showToast = useCallback(
    (type: ToastType, rawMessage: string, options?: ToastOptions) => {
      const message = rawMessage.trim();
      if (!message) return;

      const dedupeKey = options?.id || `${type}:${message.toLowerCase()}`;
      const duration = options?.durationMs ?? DEFAULT_DURATIONS[type];

      setToasts((prev) => {
        const existing = prev.find((t) => t.dedupeKey === dedupeKey);
        if (existing) {
          scheduleDismiss(existing.id, duration);
          return prev.map((t) =>
            t.id === existing.id ? { ...t, type, message } : t
          );
        }

        const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const nextList = [...prev, { id: newId, dedupeKey, type, message }];

        if (nextList.length > MAX_VISIBLE_TOASTS) {
          const evicted = nextList.slice(0, nextList.length - MAX_VISIBLE_TOASTS);
          evicted.forEach((e) => clearTimer(e.id));
        }

        const visible = nextList.slice(-MAX_VISIBLE_TOASTS);
        scheduleDismiss(newId, duration);
        return visible;
      });
    },
    [clearTimer, scheduleDismiss]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const toast = useMemo<ToastHelpers>(
    () => ({
      success: (msg, opts) => showToast('success', msg, opts),
      error: (msg, opts) => showToast('error', msg, opts),
      warning: (msg, opts) => showToast('warning', msg, opts),
      info: (msg, opts) => showToast('info', msg, opts),
    }),
    [showToast]
  );

  const renderIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
      case 'info':
        return <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />;
    }
  };

  const getBorderAccent = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800/80';
      case 'error':
        return 'border-rose-200 dark:border-rose-800/80';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/80';
      case 'info':
        return 'border-brand-200 dark:border-brand-800/80';
    }
  };

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          aria-atomic="false"
          className="fixed top-20 right-4 sm:right-6 z-[60] flex flex-col gap-2.5 w-[calc(100vw-2rem)] sm:w-full max-w-sm pointer-events-none"
        >
          {toasts.map((item) => (
            <div
              key={item.id}
              role={item.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto rounded-xl border ${getBorderAccent(
                item.type
              )} bg-white/95 dark:bg-dark-elevated/95 backdrop-blur-md shadow-lg px-4 py-3 flex items-start justify-between gap-3 text-sm text-zinc-900 dark:text-zinc-100 animate-fadeIn`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {renderIcon(item.type)}
                <span className="font-medium leading-snug break-words">{item.message}</span>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                aria-label="Dismiss notification"
                className="shrink-0 p-1 -mr-1 -mt-0.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-dark-hover transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

