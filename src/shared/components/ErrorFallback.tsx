import React, { ErrorInfo } from 'react'

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReset?: () => void
}

export function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '1rem',
          }}
        >
          Что-то пошло не так
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#4b5563',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
          }}
        >
          Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернитесь на главную.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: isDevelopment ? '1.5rem' : '0',
          }}
        >
          {onReset && (
            <button
              onClick={onReset}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }}
            >
              Попробовать снова
            </button>
          )}

          <button
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6b7280'
            }}
          >
            На главную
          </button>
        </div>

        {isDevelopment && error && (
          <details
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderRadius: '6px',
              border: '1px solid #fecaca',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontWeight: '500',
                color: '#dc2626',
                marginBottom: '0.5rem',
              }}
            >
              Информация об ошибке (dev mode)
            </summary>

            <div
              style={{
                marginTop: '0.75rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#7f1d1d',
                overflowX: 'auto',
              }}
            >
              <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                <strong>Error:</strong> {error.message}
              </p>
              {error.stack && (
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: '#fff',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #fecaca',
                  }}
                >
                  {error.stack}
                </pre>
              )}
              {errorInfo && errorInfo.componentStack && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                    Component Stack
                  </summary>
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: '#fff',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #fecaca',
                    }}
                  >
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

