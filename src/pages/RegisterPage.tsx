import React from 'react';
import { RegisterForm } from '../components/Auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хроно ниндзя - Регистрация">
      <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px' }}>
        <h1 style={{ marginBottom: 16 }}>Регистрация</h1>
        <RegisterForm />
      </div>
    </div>
  );
}


