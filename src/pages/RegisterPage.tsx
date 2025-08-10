import React from 'react';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хронониндзя — Регистрация">
      <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px' }}>
        <h1 style={{ marginBottom: 16 }}>Регистрация</h1>
        <RegisterForm onSuccess={() => navigate('/profile')} />
      </div>
    </div>
  );
}


