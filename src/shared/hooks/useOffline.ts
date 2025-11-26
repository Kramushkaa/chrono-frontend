import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Хук для отслеживания состояния offline/online соединения
 * Показывает toast уведомления при изменении состояния
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.navigator.onLine;
  });
  const { showToast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Соединение восстановлено', 'success', 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      showToast('Нет соединения с интернетом', 'error', 5000);
    };

    // Устанавливаем начальное состояние
    if (typeof window !== 'undefined') {
      setIsOffline(!window.navigator.onLine);
    }

    // Подписываемся на события
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [showToast]);

  return isOffline;
}


