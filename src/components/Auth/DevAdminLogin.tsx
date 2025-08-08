import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBackendInfo } from '../../services/api';

export function DevAdminLogin() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const show = useMemo(() => {
    const info = getBackendInfo();
    const isDev = process.env.NODE_ENV !== 'production';
    return isDev && info.isLocal;
  }, []);

  if (!show) return null;

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('admin@chrononinja.app', 'admin123');
    } catch (e) {
      setError('Не удалось войти админом');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Входим как админ...' : 'Войти как админ (локально)'}
      </button>
      {error && <div style={{ color: 'red', fontSize: 12 }}>{error}</div>}
    </div>
  );
}

