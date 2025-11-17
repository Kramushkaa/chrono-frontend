import React, { useState } from 'react';
import { register as apiRegister } from 'features/auth/services/auth';
import { useAuth } from 'shared/context/AuthContext';
import { useToast } from 'shared/context/ToastContext';

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const errors: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Некорректный email');
    if (password.length < 8) errors.push('Пароль: минимум 8 символов');
    if (!/[A-Z]/.test(password)) errors.push('Пароль: хотя бы одна заглавная буква');
    if (!/[a-z]/.test(password)) errors.push('Пароль: хотя бы одна строчная буква');
    if (!/\d/.test(password)) errors.push('Пароль: хотя бы одна цифра');
    if (loginName) {
      if (loginName.length < 3) errors.push('Логин: минимум 3 символа');
      if (loginName.length > 50) errors.push('Логин: не более 50 символов');
      if (!/^[a-zA-Z0-9_-]+$/.test(loginName)) errors.push('Логин: только латинские буквы, цифры, - и _');
    }
    if (userName && userName.length > 255) errors.push('Имя пользователя: не более 255 символов');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationErrors = validate();
    if (validationErrors.length) {
      setError(validationErrors.join('\n'));
      return;
    }
    setLoading(true);
    try {
      await apiRegister({ email, password, login: loginName, full_name: userName });
      showToast('Регистрация успешна', 'success');
      // Автовход после успешной регистрации
      try {
        await login(email, password);
        showToast('Вход выполнен', 'success');
      } catch (_) {
        // если автологин не удался — просто идём дальше по потоку
        showToast('Не удалось автоматически войти', 'info');
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Ошибка регистрации');
      showToast(err?.message || 'Ошибка регистрации', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
      <h2>Регистрация</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type="text" placeholder="Логин" value={loginName} onChange={(e) => setLoginName(e.target.value)} />
      <input type="text" placeholder="Имя пользователя" value={userName} onChange={(e) => setUserName(e.target.value)} />
      {error && <pre style={{ whiteSpace: 'pre-wrap', color: 'red', fontSize: 12 }}>{error}</pre>}
      <button type="submit" disabled={loading}>{loading ? 'Регистрируем...' : 'Зарегистрироваться'}</button>
      <div style={{ fontSize: 12, color: '#999' }}>
        Пароль: минимум 8 символов, хотя бы одна заглавная, строчная буква и цифра. Логин — латиница/цифры/"-"/"_".
      </div>
    </form>
  );
}




