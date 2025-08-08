import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(1);

  const removeToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3000) => {
    setToasts((list) => {
      const id = nextId;
      setNextId(id + 1);
      const toast: Toast = { id, message, type };
      // schedule removal
      window.setTimeout(() => removeToast(id), durationMs);
      return [...list, toast];
    });
  }, [nextId, removeToast]);

  const value = useMemo<ToastContextValue>(() => ({ toasts, showToast, removeToast }), [toasts, showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}


