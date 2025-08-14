import React, { useEffect, useState } from 'react';
import { useAuth } from 'shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword } from 'features/auth/services/auth';
import { apiFetch } from 'shared/api/api';
import { useToast } from 'shared/context/ToastContext';

export function Profile() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<{ username: string; full_name: string; avatar_url: string }>({ username: '', full_name: '', avatar_url: '' });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const token = state.accessToken;
        if (!token) throw new Error('Нет токена доступа');
        const data = await getProfile(token);
        setProfile(data?.data?.user || null);
      } catch (e) {
        setLoadError('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    })();
  }, [state.accessToken]);

  if (loading) return <div>Загрузка профиля...</div>;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {profile && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isEditing ? (
            <button onClick={() => { setValidationError(null); setDraft({ username: profile.username || '', full_name: profile.full_name || '', avatar_url: profile.avatar_url || '' }); setIsEditing(true); }}>Редактировать</button>
          ) : (
            <button onClick={() => { setIsEditing(false); setValidationError(null); }}>Отмена</button>
          )}
        </div>
      )}
      {loadError && (
        <div style={{ color: 'red' }}>{loadError}</div>
      )}
      <section>
        <h3 style={{ marginBottom: 8 }}>Личный кабинет</h3>
        {profile ? (
          <div style={{ display: 'grid', gap: 6 }}>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Логин:</strong> {profile.username || '—'}</div>
            <div><strong>Имя пользователя:</strong> {profile.full_name || '—'}</div>
            <div><strong>Роль:</strong> {profile.role}</div>
            <div><strong>Email подтвержден:</strong> {profile.email_verified ? 'да' : 'нет'}</div>
            <div style={{ marginTop: 8 }}>
              {!isEditing ? (
                <button onClick={() => { setValidationError(null); setDraft({ username: profile.username || '', full_name: profile.full_name || '', avatar_url: profile.avatar_url || '' }); setIsEditing(true); }}>Редактировать</button>
              ) : (
                <button onClick={() => { setIsEditing(false); setValidationError(null); }}>Отмена</button>
              )}
            </div>
          </div>
        ) : (
          <div>Нет данных профиля</div>
        )}
      </section>

      {!profile?.email_verified && (
        <section style={{ display: 'grid', gap: 8 }}>
          <h4>Подтверждение почты</h4>
          <div>Ваш email не подтвержден. Пожалуйста, перейдите по ссылке из письма.</div>
          <div>
            <button
              onClick={async () => {
                setResendError(null);
                setResendLoading(true);
                try {
                  const token = state.accessToken;
                  if (!token) throw new Error('Нет токена доступа');
                  const res = await apiFetch('/api/auth/resend-verification', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (!res.ok) throw new Error('Не удалось отправить письмо');
                  showToast('Письмо отправлено повторно', 'success');
                } catch (err: any) {
                  setResendError(err?.message || 'Ошибка отправки');
                  showToast('Ошибка отправки письма', 'error');
                } finally {
                  setResendLoading(false);
                }
              }}
              disabled={resendLoading}
            >
              {resendLoading ? 'Отправляем...' : 'Отправить письмо повторно'}
            </button>
          </div>
          {resendError && <div style={{ color: 'red', fontSize: 12 }}>{resendError}</div>}
        </section>
      )}

      {isEditing && (
        <section style={{ display: 'grid', gap: 8 }}>
          <h4>Редактирование профиля</h4>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!state.accessToken) return;
              // Простая валидация
              if (draft.username && (draft.username.length < 3 || draft.username.length > 30)) {
                setValidationError('Логин: 3–30 символов');
                return;
              }
              if (draft.full_name.length > 100) {
                setValidationError('Имя: максимум 100 символов');
                return;
              }
              setValidationError(null);
              setSaving(true);
              setUpdateError(null);
              setUpdateSuccess(null);
              try {
                await updateProfile(state.accessToken, draft);
                const data = await getProfile(state.accessToken);
                setProfile(data?.data?.user || null);
                setUpdateSuccess('Профиль сохранён');
                showToast('Профиль сохранён', 'success');
                setIsEditing(false);
              } catch (e: any) {
                setUpdateError(e?.message || 'Не удалось сохранить профиль');
              } finally {
                setSaving(false);
              }
            }}
            style={{ display: 'grid', gap: 8, maxWidth: 420 }}
          >
            <input
              name="username"
              placeholder="Логин"
              value={draft.username}
              onChange={(e) => setDraft(prev => ({ ...prev, username: e.target.value }))}
            />
            <input
              name="full_name"
              placeholder="Имя пользователя"
              value={draft.full_name}
              onChange={(e) => setDraft(prev => ({ ...prev, full_name: e.target.value }))}
            />
            <input
              name="avatar_url"
              placeholder="URL аватара"
              value={draft.avatar_url}
              onChange={(e) => setDraft(prev => ({ ...prev, avatar_url: e.target.value }))}
            />
            {draft.avatar_url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={draft.avatar_url} alt="Предпросмотр аватара" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                <span style={{ opacity: 0.8, fontSize: 12 }}>Предпросмотр</span>
              </div>
            )}
            {validationError && <div style={{ color: 'orange', fontSize: 12 }}>{validationError}</div>}
            <button type="submit" disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</button>
          </form>
          {(updateError || updateSuccess) && (
            <div style={{ fontSize: 12, marginTop: 4, color: updateError ? 'red' as const : 'green' as const }}>
              {updateError || updateSuccess}
            </div>
          )}
        </section>
      )}

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
              setPasswordError('Новые пароли не совпадают');
              return;
            }
            setPwdSaving(true);
            setPasswordError(null);
            setPasswordSuccess(null);
            try {
              await changePassword(state.accessToken, { current_password, new_password });
              setPasswordSuccess('Пароль изменён');
              showToast('Пароль изменён', 'success');
              form.reset();
            } catch (e: any) {
              setPasswordError(e?.message || 'Не удалось изменить пароль');
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
        {(passwordError || passwordSuccess) && (
          <div style={{ fontSize: 12, marginTop: 4, color: passwordError ? 'red' as const : 'green' as const }}>
            {passwordError || passwordSuccess}
          </div>
        )}
      </section>

      <div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/menu')}>В меню</button>
          <button onClick={logout}>Выйти</button>
        </div>
      </div>
    </div>
  );
}

