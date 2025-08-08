import React from 'react';
import { useAuth } from '../context';
import { Profile } from '../components/Profile';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();

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


