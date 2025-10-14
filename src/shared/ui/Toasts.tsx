import React from 'react';
import { useToast } from 'shared/context/ToastContext';

export function Toasts() {
  const { toasts, removeToast } = useToast();
  
  // Separate toasts by type for different aria-live regions
  const errorToasts = toasts.filter(t => t.type === 'error');
  const otherToasts = toasts.filter(t => t.type !== 'error');
  
  return (
    <>
      {/* Error toasts with assertive announcements */}
      {errorToasts.length > 0 && (
        <div 
          style={{ position: 'fixed', top: 16, right: 16, display: 'grid', gap: 8, zIndex: 2000 }} 
          aria-live="assertive" 
          aria-atomic="true" 
          role="alert"
        >
          {errorToasts.map((t) => (
            <div 
              key={t.id} 
              role="alert"
              aria-label={`Ошибка: ${t.message}`}
              style={{
                background: 'rgba(192, 57, 43, 0.95)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 6,
                minWidth: 220,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>{t.message}</div>
                <button 
                  onClick={() => removeToast(t.id)} 
                  aria-label="Закрыть уведомление"
                  style={{ background: 'transparent', color: '#fff', border: 0, cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Success and info toasts with polite announcements */}
      {otherToasts.length > 0 && (
        <div 
          style={{ position: 'fixed', top: 16, right: 16, display: 'grid', gap: 8, zIndex: 2000, marginTop: errorToasts.length > 0 ? `${errorToasts.length * 60}px` : 0 }} 
          aria-live="polite" 
          aria-atomic="true" 
          role="status"
        >
          {otherToasts.map((t) => (
            <div 
              key={t.id}
              role="status"
              aria-label={`${t.type === 'success' ? 'Успех' : 'Информация'}: ${t.message}`}
              style={{
                background: t.type === 'success' ? 'rgba(39, 174, 96, 0.95)' : 'rgba(44, 62, 80, 0.95)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 6,
                minWidth: 220,
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>{t.message}</div>
                <button 
                  onClick={() => removeToast(t.id)} 
                  aria-label="Закрыть уведомление"
                  style={{ background: 'transparent', color: '#fff', border: 0, cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}


