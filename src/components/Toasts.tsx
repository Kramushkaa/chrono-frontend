import React from 'react';
import { useToast } from '../context/ToastContext';

export function Toasts() {
  const { toasts, removeToast } = useToast();
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, display: 'grid', gap: 8, zIndex: 2000 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'success' ? 'rgba(39, 174, 96, 0.95)' : t.type === 'error' ? 'rgba(192, 57, 43, 0.95)' : 'rgba(44, 62, 80, 0.95)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 6,
          minWidth: 220,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}>{t.message}</div>
            <button onClick={() => removeToast(t.id)} style={{ background: 'transparent', color: '#fff', border: 0, cursor: 'pointer' }}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
}


