import React, { useEffect } from 'react';
import { useAuth } from '../context';
import { Profile } from '../components/Profile';
import { apiFetch } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify_token');
    if (!token) return;
    (async () => {
      try {
        const res = await apiFetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json().catch(() => null);
        if (res.ok) {
          showToast('Email подтвержден', 'success');
        } else {
          const msg = data?.message || 'Не удалось подтвердить email';
          if (/истек/i.test(msg)) {
            showToast('Срок действия токена истек. Отправьте письмо повторно из профиля.', 'error');
          } else {
            showToast(msg, 'error');
          }
        }
      } catch {
        showToast('Ошибка подтверждения', 'error');
      }
    })();
  }, [showToast]);

  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хроно ниндзя - Личный кабинет">
      <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px' }}>
        <h1 style={{ marginBottom: 16 }}>Личный кабинет</h1>
        {isAuthenticated ? (
          <Profile />
        ) : (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <LoginForm />
            <RegisterForm />
          </div>
        )}
        {!isAuthenticated && (
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
            Для регистрации используется подтверждение почты — письмо придёт с адреса profiles@chrono.ninja
          </div>
        )}
      </div>
    </div>
  );
}


