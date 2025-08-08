import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from './Auth/LoginForm';

type UserMenuProps = {
  style?: React.CSSProperties;
  className?: string;
};

export function UserMenu({ style, className }: UserMenuProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} className={className} style={{ position: 'relative', ...style }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={isAuthenticated ? (user?.username || user?.email || 'Профиль') : 'Войти'}
        style={{
          padding: '6px 10px',
          background: 'rgba(244, 228, 193, 0.12)',
          border: '1px solid rgba(244, 228, 193, 0.3)',
          color: '#f4e4c1',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {isAuthenticated ? (user?.username || 'Профиль') : 'Войти'}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 6,
            minWidth: 260,
            background: 'rgba(29, 29, 27, 0.98)',
            border: '1px solid rgba(244, 228, 193, 0.15)',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
            zIndex: 1000,
          }}
        >
          {isAuthenticated ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 600, color: '#f4e4c1' }}>
                {user?.username || user?.email}
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                style={{ padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
              >
                Профиль
              </button>
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
                style={{ padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
              >
                Выйти
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              <LoginForm onSuccess={() => setOpen(false)} />
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/register');
                }}
                style={{ padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
              >
                Зарегистрироваться
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


