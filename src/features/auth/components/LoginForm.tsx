import React, { useState } from 'react';
import { useAuth } from 'shared/context/AuthContext';
import { useToast } from 'shared/context/ToastContext';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginOrEmail, password);
      showToast('Вход выполнен', 'success');
      onSuccess?.();
    } catch (err) {
      setError('Неверный логин или пароль');
      showToast('Ошибка входа', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
      <h3>Вход</h3>
      <input
        type="text"
        placeholder="Логин или Email"
        value={loginOrEmail}
        onChange={(e) => setLoginOrEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div style={{ color: 'red', fontSize: 12 }}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Входим...' : 'Войти'}</button>
    </form>
  );
}

