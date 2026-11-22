import React, { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ContentImportMode, ContentImportReport } from 'shared/dto/contentBundle'
import { importContent } from 'shared/api/content'
import { useAuth } from 'shared/context/AuthContext'
import { useToast } from 'shared/context/ToastContext'
import { Button } from 'shared/ui/Button'
import { ConfirmDialog } from 'shared/ui/ConfirmDialog'
import { SEO } from 'shared/ui/SEO'

const MAX_FILE_BYTES = 2 * 1024 * 1024

const ACTION_COLORS: Record<string, string> = {
  created: '#4ade80',
  updated: '#60a5fa',
  skipped: '#fbbf24',
  error: '#f87171',
}

const ACTION_LABELS: Record<string, string> = {
  created: 'создано',
  updated: 'обновлено',
  skipped: 'пропущено',
  error: 'ошибка',
}

const COLLECTION_LABELS: Record<string, string> = {
  persons: 'Персоны',
  achievements: 'Достижения',
  periods: 'Периоды',
  lists: 'Списки',
  listItems: 'Элементы списков',
}

export default function ContentImportPage() {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const isModerator = !!user && (user.role === 'admin' || user.role === 'moderator')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [content, setContent] = useState('')
  const [mode, setMode] = useState<ContentImportMode>('create-only')
  const [report, setReport] = useState<ContentImportReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const hasErrors = (report?.counts.errors ?? 0) > 0

  const countsSummary = useMemo(() => {
    if (!report) return null
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {(
          [
            ['created', report.counts.created],
            ['updated', report.counts.updated],
            ['skipped', report.counts.skipped],
            ['error', report.counts.errors],
          ] as const
        ).map(([action, value]) => (
          <div
            key={action}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${ACTION_COLORS[action]}55`,
              color: ACTION_COLORS[action],
              fontWeight: 600,
              minWidth: 110,
            }}
          >
            {ACTION_LABELS[action]}: {value}
          </div>
        ))}
      </div>
    )
  }, [report])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setReport(null)
    setError(null)

    if (file.size > MAX_FILE_BYTES) {
      setError('Файл больше 2 МБ')
      return
    }

    try {
      const text = await file.text()
      setFileName(file.name)
      setContent(text)
    } catch {
      setError('Не удалось прочитать файл')
    }
  }

  const runImport = async (dryRun: boolean) => {
    if (!content.trim()) {
      setError('Сначала выберите файл')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await importContent({ content, mode, dryRun })
      setReport(result)

      if (dryRun) {
        showToast(
          result.counts.errors > 0 ? 'Проверка нашла ошибки' : 'Проверка прошла успешно',
          result.counts.errors > 0 ? 'error' : 'success'
        )
      } else if (result.counts.errors > 0) {
        showToast('Импорт не применён: есть ошибки', 'error')
      } else {
        showToast('Импорт применён', 'success')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось выполнить импорт'
      setError(message)
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
      setConfirmOpen(false)
    }
  }

  if (!isAuthenticated || !isModerator) {
    return (
      <div style={{ minHeight: '100vh', background: '#1d120c', color: '#f7f2eb', padding: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Импорт контента</h1>
        <p style={{ opacity: 0.8 }}>Раздел доступен только администраторам и модераторам.</p>
        <Link to="/lists" style={{ color: '#f4e4c1' }}>
          Вернуться к спискам
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1d120c', color: '#f7f2eb' }}>
      <SEO title="Импорт контента — Хронониндзя" description="Массовый импорт персон, достижений, периодов и списков из YAML или JSON." />

      <header
        style={{
          padding: '48px 16px 24px',
          background: 'linear-gradient(135deg, rgba(44,24,16,0.95), rgba(30,18,12,0.95))',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>Импорт контента</h1>
          <p style={{ maxWidth: 760, opacity: 0.8, lineHeight: 1.6 }}>
            Загрузите YAML или JSON с персонами, достижениями, периодами и списками. Сначала выполните
            проверку — она показывает отчёт по ключам и ничего не сохраняет.
          </p>
          <div style={{ marginTop: 12 }}>
            <Link to="/lists" style={{ color: '#f4e4c1', textDecoration: 'underline' }}>
              Вернуться к спискам
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px' }}>
        <section
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml,.json,.txt,application/json,text/yaml"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              Выбрать файл
            </Button>
            <span style={{ opacity: 0.8 }}>{fileName || 'Файл не выбран'}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 18 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="radio"
                name="import-mode"
                checked={mode === 'create-only'}
                onChange={() => setMode('create-only')}
                disabled={isLoading}
              />
              Только создавать (create-only)
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="radio"
                name="import-mode"
                checked={mode === 'upsert'}
                onChange={() => setMode('upsert')}
                disabled={isLoading}
              />
              Обновлять существующие (upsert)
            </label>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
            <Button variant="primary" onClick={() => runImport(true)} loading={isLoading} disabled={!content}>
              Проверить (dry-run)
            </Button>
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(true)}
              loading={isLoading}
              disabled={!content || !report || hasErrors}
            >
              Применить импорт
            </Button>
          </div>

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 8,
                background: 'rgba(220,53,69,0.15)',
                border: '1px solid rgba(220,53,69,0.35)',
              }}
            >
              {error}
            </div>
          )}
        </section>

        {report && (
          <section
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, margin: 0 }}>
                {report.dryRun ? 'Результат проверки' : 'Результат импорта'}
              </h2>
              <span style={{ opacity: 0.7 }}>
                режим: {report.mode}, версия файла: {report.version ?? '—'}
              </span>
            </div>

            {countsSummary}

            <div style={{ overflowX: 'auto', marginTop: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.7 }}>
                    <th style={{ padding: '8px 10px' }}>Коллекция</th>
                    <th style={{ padding: '8px 10px' }}>Ключ</th>
                    <th style={{ padding: '8px 10px' }}>Действие</th>
                    <th style={{ padding: '8px 10px' }}>ID</th>
                    <th style={{ padding: '8px 10px' }}>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {report.entries.map((entry, index) => (
                    <tr
                      key={`${entry.collection}-${entry.key}-${index}`}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <td style={{ padding: '8px 10px' }}>{COLLECTION_LABELS[entry.collection] ?? entry.collection}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{entry.key}</td>
                      <td style={{ padding: '8px 10px', color: ACTION_COLORS[entry.action], fontWeight: 600 }}>
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </td>
                      <td style={{ padding: '8px 10px', opacity: 0.8 }}>{entry.id ?? '—'}</td>
                      <td style={{ padding: '8px 10px', opacity: 0.8 }}>{entry.message ?? ''}</td>
                    </tr>
                  ))}
                  {report.entries.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 16, textAlign: 'center', opacity: 0.7 }}>
                        Файл не содержит сущностей
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => runImport(false)}
        title="Применить импорт"
        message="Импорт выполнится в одной транзакции. При любой ошибке изменения будут отменены. Продолжить?"
        confirmText="Применить"
        variant="warning"
        isProcessing={isLoading}
      />
    </div>
  )
}
