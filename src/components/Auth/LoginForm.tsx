import React, { useState } from 'react';
import { useAuth } from '../../context';
import { useToast } from '../../context/ToastContext';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      showToast('Вход выполнен', 'success');
      onSuccess?.();
    } catch (err) {
      setError('Неверный email или пароль');
      showToast('Ошибка входа', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
      <h3>Вход</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

