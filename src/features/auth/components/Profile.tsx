import React, { useEffect, useState } from 'react';
import { useAuth } from 'shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword } from 'features/auth/services/auth';
import { apiFetch } from 'shared/api/core';
import { useToast } from 'shared/context/ToastContext';
import styles from './Profile.module.css';

export function Profile() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [draft, setDraft] = useState<{ username: string; full_name: string; avatar_url: string }>({ 
    username: '', 
    full_name: '', 
    avatar_url: '' 
  });
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Change password state
  const [pwdSaving, setPwdSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // Resend verification state
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [state.accessToken]);

  const loadProfile = async () => {
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
  };

  const handleEditClick = () => {
    setValidationError(null);
    setUpdateError(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    setDraft({ 
      username: profile.username || '', 
      full_name: profile.full_name || '', 
      avatar_url: profile.avatar_url || '' 
    });
    setIsEditing(true);
    setIsChangingPassword(false);
  };

  const handleChangePasswordClick = () => {
    setValidationError(null);
    setUpdateError(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsChangingPassword(true);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setValidationError(null);
    setUpdateError(null);
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
              e.preventDefault();
              if (!state.accessToken) return;
    
    // Validation
              if (draft.username && (draft.username.length < 3 || draft.username.length > 30)) {
      setValidationError('Логин должен содержать от 3 до 30 символов');
                return;
              }
              if (draft.full_name.length > 100) {
      setValidationError('Имя не может быть длиннее 100 символов');
                return;
              }
    
              setValidationError(null);
              setSaving(true);
              setUpdateError(null);
    
              try {
                await updateProfile(state.accessToken, draft);
      await loadProfile();
      showToast('Профиль успешно обновлён', 'success');
                setIsEditing(false);
              } catch (e: any) {
                setUpdateError(e?.message || 'Не удалось сохранить профиль');
      showToast('Ошибка при сохранении профиля', 'error');
              } finally {
                setSaving(false);
              }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!state.accessToken) return;
    
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const current_password = String(formData.get('current_password') || '');
            const new_password = String(formData.get('new_password') || '');
            const new_password2 = String(formData.get('new_password2') || '');
    
    if (!current_password || !new_password) {
      setPasswordError('Заполните все поля');
      return;
    }
    
    if (new_password.length < 8) {
      setPasswordError('Новый пароль должен содержать минимум 8 символов');
      return;
    }
    
            if (new_password !== new_password2) {
              setPasswordError('Новые пароли не совпадают');
              return;
            }
    
            setPwdSaving(true);
            setPasswordError(null);
            setPasswordSuccess(null);
    
            try {
              await changePassword(state.accessToken, { current_password, new_password });
      setPasswordSuccess('Пароль успешно изменён');
      showToast('Пароль успешно изменён', 'success');
              form.reset();
      // Закрываем форму после успешной смены пароля
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess(null);
      }, 2000);
            } catch (e: any) {
              setPasswordError(e?.message || 'Не удалось изменить пароль');
      showToast('Ошибка при смене пароля', 'error');
            } finally {
              setPwdSaving(false);
            }
  };

  const handleResendVerification = async () => {
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
      showToast(err?.message || 'Ошибка отправки письма', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {loadError && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          ⚠️ {loadError}
        </div>
      )}

      <div className={styles.grid}>
        {/* Profile Card */}
        {profile && (
          <div className={styles.card}>
            {!isEditing && !isChangingPassword ? (
              <>
                <div className={styles.profileWrapper}>
                  <div className={styles.profileContent}>
                    <div className={styles.profileHeader}>
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Аватар" 
                          className={styles.avatar}
                          onError={(e) => { 
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {getInitials(profile.full_name, profile.email)}
                        </div>
                      )}
                      
                      <div className={styles.profileInfo}>
                        <h3 className={styles.profileName}>
                          {profile.full_name || profile.username || 'Пользователь'}
                        </h3>
                        <p className={styles.profileEmail}>{profile.email}</p>
                        <div className={styles.badges}>
                          {profile.email_verified ? (
                            <span className={`${styles.badge} ${styles.badgeVerified}`}>
                              ✓ Email подтверждён
                            </span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeUnverified}`}>
                              ⚠ Email не подтверждён
                            </span>
                          )}
                          <span className={`${styles.badge} ${styles.badgeRole}`}>
                            {profile.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.infoGrid}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Логин:</span>
                        <span className={styles.infoValue}>{profile.username || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.profileActions}>
                    <button 
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={handleEditClick}
                    >
                      ✏️ Редактировать
                    </button>
                    <button 
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={handleChangePasswordClick}
                    >
                      🔑 Сменить пароль
                    </button>
                  </div>
                </div>
              </>
            ) : isEditing ? (
              <>
                <form onSubmit={handleSaveProfile} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Логин</label>
                    <input
                      className={styles.input}
                      name="username"
                      placeholder="Введите логин (3-30 символов)"
                      value={draft.username}
                      onChange={(e) => setDraft(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Полное имя</label>
                    <input
                      className={styles.input}
                      name="full_name"
                      placeholder="Ваше имя"
                      value={draft.full_name}
                      onChange={(e) => setDraft(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>URL аватара</label>
                    <input
                      className={styles.input}
                      name="avatar_url"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={draft.avatar_url}
                      onChange={(e) => setDraft(prev => ({ ...prev, avatar_url: e.target.value }))}
                    />
                  </div>

                  {draft.avatar_url && (
                    <div className={styles.avatarPreview}>
                      <img 
                        src={draft.avatar_url} 
                        alt="Предпросмотр" 
                        className={styles.avatarPreviewImg}
                        onError={(e) => { 
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className={styles.avatarPreviewText}>Предпросмотр аватара</span>
                    </div>
                  )}

                  {validationError && (
                    <div className={`${styles.alert} ${styles.alertWarning}`}>
                      ⚠️ {validationError}
                    </div>
                  )}

                  {updateError && (
                    <div className={`${styles.alert} ${styles.alertError}`}>
                      ❌ {updateError}
                    </div>
                  )}

                  <div className={styles.buttonGroup}>
                    <button 
                      type="submit" 
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={saving}
                    >
                      {saving ? '💾 Сохраняем...' : '💾 Сохранить'}
                    </button>
                    <button 
                      type="button"
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </>
            ) : isChangingPassword ? (
              <>
                <form onSubmit={handleChangePassword} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Текущий пароль</label>
                    <input 
                      className={styles.input}
                      name="current_password" 
                      type="password" 
                      placeholder="Введите текущий пароль"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Новый пароль</label>
                    <input 
                      className={styles.input}
                      name="new_password" 
                      type="password" 
                      placeholder="Минимум 8 символов"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Повторите новый пароль</label>
                    <input 
                      className={styles.input}
                      name="new_password2" 
                      type="password" 
                      placeholder="Повторите новый пароль"
                      autoComplete="new-password"
                    />
                  </div>

                  {passwordError && (
                    <div className={`${styles.alert} ${styles.alertError}`}>
                      ❌ {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className={`${styles.alert} ${styles.alertSuccess}`}>
                      ✓ {passwordSuccess}
                    </div>
                  )}

                  <div className={styles.buttonGroup}>
                    <button 
                      type="submit" 
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={pwdSaving}
                    >
                      {pwdSaving ? '🔄 Изменяем...' : '💾 Сохранить новый пароль'}
                    </button>
                    <button 
                      type="button"
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={handleCancelEdit}
                      disabled={pwdSaving}
                    >
                      Отмена
                    </button>
                  </div>
        </form>
              </>
            ) : null}
          </div>
        )}

        {/* Email Verification Card */}
        {profile && !profile.email_verified && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}>📧</span>
                Подтверждение email
              </h3>
            </div>
            
            <div className={`${styles.alert} ${styles.alertWarning}`}>
              ⚠️ Ваш email не подтверждён. Пожалуйста, проверьте почту и перейдите по ссылке из письма.
            </div>
            
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? '📮 Отправляем...' : '📮 Отправить письмо повторно'}
            </button>
          </div>
        )}

        {/* Quiz History Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span className={styles.cardIcon}>🎯</span>
              История квизов
            </h3>
          </div>
          
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '16px' }}>
            Просмотрите все ваши прошлые прохождения квизов с подробными результатами.
          </p>
          
          <button 
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => navigate('/quiz/history')}
          >
            📊 Посмотреть историю
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={styles.footerActions}>
        <button 
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={() => navigate('/menu')}
        >
          ← В меню
        </button>
        <button 
          className={`${styles.button} ${styles.buttonDanger}`}
          onClick={logout}
        >
          🚪 Выйти
        </button>
      </div>
    </div>
  );
}



