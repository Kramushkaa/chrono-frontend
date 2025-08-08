import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/auth';

export function Profile() {
  const { state, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = state.accessToken;
        if (!token) throw new Error('Нет токена доступа');
        const data = await getProfile(token);
        setProfile(data?.data?.user || null);
      } catch (e) {
        setError('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    })();
  }, [state.accessToken]);

  if (loading) return <div>Загрузка профиля...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <h3>Личный кабинет</h3>
      {profile ? (
        <div>
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>Имя пользователя:</strong> {profile.username || '—'}</div>
          <div><strong>Роль:</strong> {profile.role}</div>
          <div><strong>Email подтвержден:</strong> {profile.email_verified ? 'да' : 'нет'}</div>
        </div>
      ) : (
        <div>Нет данных профиля</div>
      )}
      <button onClick={logout}>Выйти</button>
    </div>
  );
}

