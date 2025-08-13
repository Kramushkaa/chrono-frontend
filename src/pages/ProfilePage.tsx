import React, { useEffect, useEffect as ReactEffect, useState, useRef } from 'react';
import { useAuth } from '../context';
import { Profile } from '../components/Profile';
import { apiFetch } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { useFilters } from '../hooks/useFilters';
import { AppHeader } from '../components/AppHeader';
import { getCategories, getCountries } from '../services/api';
import { getGroupColor } from '../utils/groupingUtils';

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { filters, setFilters, groupingType, setGroupingType, yearInputs, setYearInputs, applyYearFilter, handleYearKeyPress, resetAllFilters } = useFilters();
  const [categories, setCategories] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const hasHandledVerify = useRef(false);
  useEffect(() => {
    if (hasHandledVerify.current) return;
    hasHandledVerify.current = true;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify_token');
    if (!token) return;
    (async () => {
      try {
        const res = await apiFetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json().catch(() => null);
        if (res.ok) {
          showToast('Email подтвержден', 'success');
        } else {
          const msg = data?.message || 'Не удалось подтвердить email';
          if (/истек/i.test(msg)) {
            showToast('Срок действия токена истек. Отправьте письмо повторно из профиля.', 'error');
          } else {
            showToast(msg, 'error');
          }
        }
      } catch {
        showToast('Ошибка подтверждения', 'error');
      } finally {
        // Удаляем токен из URL, чтобы не повторять запросы
        const url = new URL(window.location.href);
        url.searchParams.delete('verify_token');
        window.history.replaceState({}, '', url.toString());
      }
    })();
  }, []); // намеренно один раз на монтирование

  ReactEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, cntrs] = await Promise.all([getCategories(), getCountries()]);
        if (!mounted) return;
        setCategories(cats || []);
        setCountries(cntrs || []);
      } catch {}
    })();
    const onScroll = () => setIsScrolled((window.pageYOffset || document.documentElement.scrollTop) > 50);
    window.addEventListener('scroll', onScroll);
    return () => { mounted = false; window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хронониндзя — Личный кабинет">
      <AppHeader
        isScrolled={isScrolled}
        showControls={showControls}
        setShowControls={setShowControls}
        mode="minimal"
        filters={filters as any}
        setFilters={setFilters as any}
        groupingType={groupingType}
        setGroupingType={setGroupingType}
        allCategories={categories}
        allCountries={countries}
        yearInputs={yearInputs}
        setYearInputs={setYearInputs as any}
        applyYearFilter={applyYearFilter}
        handleYearKeyPress={handleYearKeyPress}
        resetAllFilters={resetAllFilters}
        getCategoryColor={getGroupColor}
        sortedData={[]}
        handleSliderMouseDown={() => {}}
        handleSliderMouseMove={() => {}}
        handleSliderMouseUp={() => {}}
        isDraggingSlider={false}
      />
      <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px' }}>
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => { window.location.href = '/menu' }} aria-label="В меню">← В меню</button>
        </div>
        <h1 style={{ marginBottom: 16 }}>Личный кабинет</h1>
        {isAuthenticated ? (
          <Profile />
        ) : (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <LoginForm />
            <RegisterForm />
          </div>
        )}
        {!isAuthenticated && (
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
            Для регистрации используется подтверждение почты — письмо придёт с адреса profiles@chrono.ninja
          </div>
        )}
      </div>
    </div>
  );
}


