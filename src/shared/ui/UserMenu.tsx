import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from 'shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from 'features/auth/components/LoginForm';

// Функция определения, находимся ли мы на manage page
const isManagePage = () => window.location.pathname.includes('/manage') || window.location.pathname.includes('/lists');

type UserMenuProps = {
  style?: React.CSSProperties;
  className?: string;
};

export function UserMenu({ style, className }: UserMenuProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isOnManagePage, setIsOnManagePage] = useState(isManagePage());
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

  // Отслеживание изменения страницы
  useEffect(() => {
    const handleLocationChange = () => {
      setIsOnManagePage(isManagePage());
    };

    // Слушаем изменения location через popstate
    window.addEventListener('popstate', handleLocationChange);

    // Также проверяем при монтировании компонента
    handleLocationChange();

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <div
      ref={ref}
      className={`user-menu ${isOnManagePage ? 'user-menu--manage' : ''} ${className || ''}`}
      style={{ position: 'relative', ...style }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            setOpen(false);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isAuthenticated ? (user?.username || user?.email || 'Профиль') : 'Войти'}
        title={isAuthenticated ? (user?.username || user?.email || 'Профиль') : 'Войти'}
        style={{
          padding: '6px 8px',
          background: 'rgba(244, 228, 193, 0.12)',
          border: '1px solid rgba(244, 228, 193, 0.3)',
          color: '#f4e4c1',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        <span aria-hidden="true">👤</span>
      </button>

      {open && (
        <div
          role="menu"
          className="user-menu__dropdown"
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
              <div style={{ fontWeight: 600, color: '#f4e4c1' }} aria-label={`Вы вошли как ${user?.username || user?.email}`}>
                {user?.username || user?.email}
              </div>
              <button
                role="menuitem"
                aria-label="Перейти в профиль"
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                style={{ padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
              >
                Профиль
              </button>
              <button
                role="menuitem"
                aria-label="Выйти из аккаунта"
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
                role="menuitem"
                aria-label="Перейти на страницу регистрации"
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


