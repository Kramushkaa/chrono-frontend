import React, { useState, useEffect } from 'react';
import { getBackendInfo, testBackendConnection } from '../services/api';
import './BackendInfo.css';

interface BackendInfoProps {
  className?: string;
}

export const BackendInfo: React.FC<BackendInfoProps> = ({ className = '' }) => {
  const backendInfo = getBackendInfo();
  const env = (typeof process !== 'undefined' && (process as any).env) || {};
  const isDev = env.NODE_ENV === 'development';
  const useLocal = env.REACT_APP_USE_LOCAL_BACKEND === 'true';
  const showOverride = env.REACT_APP_SHOW_BACKEND_INFO === 'true';
  const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  // Показываем только в деве/локале/override
  const shouldHide = !showOverride && !(isDev || useLocal || backendInfo.isLocal || isLocalHost);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Тестируем подключение при загрузке
  useEffect(() => {
    if (!shouldHide) {
      testConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendInfo.baseUrl, shouldHide]);

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const connected = await testBackendConnection();
      setIsConnected(connected);
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  if (shouldHide) return null;

  const getStatusIcon = () => {
    if (isTesting) return '🔄';
    if (isConnected === null) return '❓';
    return isConnected ? '✅' : '❌';
  };

  const getStatusText = () => {
    if (isTesting) return 'Проверка...';
    if (isConnected === null) return 'Неизвестно';
    return isConnected ? 'Подключен' : 'Не подключен';
  };

  const getBackendType = () => {
    return backendInfo.isLocal ? 'Локальный' : 'Удаленный';
  };

  const getBackendColor = () => {
    return backendInfo.isLocal ? '#4CAF50' : '#2196F3';
  };

  return (
    <div className={`backend-info ${className}`}>
      <div className="backend-header" onClick={() => setShowDetails(!showDetails)}>
        <div className="backend-status">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>
        <div className="backend-type" style={{ color: getBackendColor() }}>
          {getBackendType()} Backend
        </div>
        <button 
          className="test-button"
          onClick={(e) => {
            e.stopPropagation();
            testConnection();
          }}
          disabled={isTesting}
        >
          {isTesting ? '🔄' : '🔄'}
        </button>
      </div>

      {showDetails && (
        <div className="backend-details">
          <div className="detail-item">
            <strong>URL:</strong> {backendInfo.baseUrl}
          </div>
          <div className="detail-item">
            <strong>Тип:</strong> {getBackendType()}
          </div>
          <div className="detail-item">
            <strong>Статус:</strong> {getStatusText()}
          </div>
          <div className="detail-item">
            <strong>Таймаут:</strong> {backendInfo.config.timeout}ms
          </div>
          <div className="detail-item">
            <strong>Повторы:</strong> {backendInfo.config.retries}
          </div>
          
          <div className="backend-tips">
            <h4>💡 Как переключиться:</h4>
            <ul>
              <li>Создайте файл <code>.env.local</code> в корне проекта</li>
              <li>Добавьте: <code>REACT_APP_USE_LOCAL_BACKEND=true</code></li>
              <li>Перезапустите приложение</li>
              <li>Убедитесь, что локальный backend запущен на порту 3001</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}; 