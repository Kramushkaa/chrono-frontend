import React from 'react';
import { useToast } from 'shared/context/ToastContext';

interface ToastItemProps {
  toast: {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
    durationMs?: number;
    timestamp: number;
  };
  isRemoving: boolean;
  onClose: (id: number) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, isRemoving, onClose }) => {
  const getRoleAndLabel = () => {
    switch (toast.type) {
      case 'error':
        return { role: 'alert' as const, ariaLabel: `Ошибка: ${toast.message}` };
      case 'success':
        return { role: 'status' as const, ariaLabel: `Успех: ${toast.message}` };
      default:
        return { role: 'status' as const, ariaLabel: `Информация: ${toast.message}` };
    }
  };

  const { role, ariaLabel } = getRoleAndLabel();

  return (
    <div 
      className={`toast-item toast-item--${toast.type} ${isRemoving ? 'toast-item--removing' : ''}`}
      role={role}
      aria-label={ariaLabel}
    >
      <div className="toast-content">
        <div className="toast-message">{toast.message}</div>
        <button 
          className="toast-close"
          onClick={() => onClose(toast.id)} 
          aria-label="Закрыть уведомление"
          type="button"
        >
          ×
        </button>
      </div>
      {toast.durationMs && (
        <div 
          className="toast-progress"
          style={{ 
            animationDuration: `${toast.durationMs}ms`
          }}
        />
      )}
    </div>
  );
};

export function Toasts() {
  const { toasts, removingIds, removeToast } = useToast();
  
  if (toasts.length === 0) return null;

  // Check if there are any error toasts for aria-live region selection
  const hasErrors = toasts.some(t => t.type === 'error');
  
  return (
    <div 
      className="toast-container"
      aria-live={hasErrors ? "assertive" : "polite"} 
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          isRemoving={removingIds.has(toast.id)}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}


