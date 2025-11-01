import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
  durationMs?: number;
  timestamp: number;
};

type ToastContextValue = {
  toasts: Toast[];
  removingIds: Set<number>;
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(1);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const removeToast = useCallback((id: number) => {
    setRemovingIds(prev => new Set(prev).add(id));
    // Удаляем из состояния после завершения анимации
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // Соответствует длительности анимации slideOutRight
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs?: number) => {
    const normalizedMessage = (message ?? '').toString().trim();
    if (!normalizedMessage) return;

    const duration = durationMs ?? (type === 'success' ? 3000 : type === 'error' ? 5000 : 2500);
    
    setToasts((list) => {
      const id = nextId;
      setNextId(id + 1);
      const toast: Toast = { 
        id, 
        message: normalizedMessage, 
        type, 
        durationMs: duration,
        timestamp: Date.now()
      };
      
      // Добавляем новый тост
      let newList = [...list, toast];
      
      // Ограничиваем количество тостов
      if (newList.length > MAX_TOASTS) {
        // Удаляем самый старый тост
        const oldestToast = newList.shift();
        if (oldestToast) {
          removeToast(oldestToast.id);
        }
      }
      
      // Schedule auto-removal только для нового тоста
      setTimeout(() => removeToast(id), duration);
      
      return newList;
    });
  }, [nextId, removeToast]);

  const value = useMemo<ToastContextValue>(() => ({ toasts, removingIds, showToast, removeToast }), [toasts, removingIds, showToast, removeToast]);

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





