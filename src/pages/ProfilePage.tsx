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
      </div>
    </div>
  );
}


