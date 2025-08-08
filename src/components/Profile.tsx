import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../services/auth';

export function Profile() {
  const { state, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

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
    <div style={{ display: 'grid', gap: 16 }}>
      <section>
        <h3 style={{ marginBottom: 8 }}>Личный кабинет</h3>
        {profile ? (
          <div style={{ display: 'grid', gap: 6 }}>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Имя пользователя:</strong> {profile.username || '—'}</div>
            <div><strong>Роль:</strong> {profile.role}</div>
            <div><strong>Email подтвержден:</strong> {profile.email_verified ? 'да' : 'нет'}</div>
          </div>
        ) : (
          <div>Нет данных профиля</div>
        )}
      </section>

      <section style={{ display: 'grid', gap: 8 }}>
        <h4>Редактирование профиля</h4>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!state.accessToken) return;
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const payload = {
              username: String(formData.get('username') || ''),
              full_name: String(formData.get('full_name') || ''),
              avatar_url: String(formData.get('avatar_url') || ''),
            };
            setSaving(true);
            setError(null);
            try {
              await updateProfile(state.accessToken, payload);
              const data = await getProfile(state.accessToken);
              setProfile(data?.data?.user || null);
            } catch (e: any) {
              setError(e?.message || 'Не удалось сохранить профиль');
            } finally {
              setSaving(false);
            }
          }}
          style={{ display: 'grid', gap: 8, maxWidth: 420 }}
        >
          <input name="username" placeholder="Имя пользователя" defaultValue={profile?.username || ''} />
          <input name="full_name" placeholder="Полное имя" defaultValue={profile?.full_name || ''} />
          <input name="avatar_url" placeholder="URL аватара" defaultValue={profile?.avatar_url || ''} />
          <button type="submit" disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</button>
        </form>
      </section>

      <section style={{ display: 'grid', gap: 8 }}>
        <h4>Смена пароля</h4>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!state.accessToken) return;
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const current_password = String(formData.get('current_password') || '');
            const new_password = String(formData.get('new_password') || '');
            const new_password2 = String(formData.get('new_password2') || '');
            if (new_password !== new_password2) {
              setError('Новые пароли не совпадают');
              return;
            }
            setPwdSaving(true);
            setError(null);
            try {
              await changePassword(state.accessToken, { current_password, new_password });
              alert('Пароль изменён');
              form.reset();
            } catch (e: any) {
              setError(e?.message || 'Не удалось изменить пароль');
            } finally {
              setPwdSaving(false);
            }
          }}
          style={{ display: 'grid', gap: 8, maxWidth: 420 }}
        >
          <input name="current_password" type="password" placeholder="Текущий пароль" />
          <input name="new_password" type="password" placeholder="Новый пароль" />
          <input name="new_password2" type="password" placeholder="Повтор нового пароля" />
          <button type="submit" disabled={pwdSaving}>{pwdSaving ? 'Изменяем…' : 'Изменить пароль'}</button>
        </form>
      </section>

      <div>
        <button onClick={logout}>Выйти</button>
      </div>
    </div>
  );
}

