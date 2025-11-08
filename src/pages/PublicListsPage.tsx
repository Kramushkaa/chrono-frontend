import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicLists } from 'shared/api/lists'
import type { PublicListSummary, PaginationMeta } from 'shared/types'
import { SEO } from 'shared/ui/SEO'

interface LoadState {
  loading: boolean
  error: string | null
}

function trimDescription(description: string, max = 220) {
  if (!description) return ''
  if (description.length <= max) return description
  return `${description.slice(0, max).trim()}…`
}

export default function PublicListsPage() {
  const [lists, setLists] = useState<PublicListSummary[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loadState, setLoadState] = useState<LoadState>({ loading: false, error: null })

  const loadLists = async (offset = 0, append = false) => {
    setLoadState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const payload = await getPublicLists({ limit: 12, offset })
      setLists((prev) => (append ? [...prev, ...payload.data] : payload.data))
      setMeta(payload.meta)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить публичные списки'
      setLoadState({ loading: false, error: message })
      return
    }
    setLoadState({ loading: false, error: null })
  }

  useEffect(() => {
    loadLists(0, false)
  }, [])

  const hasMore = meta?.hasMore ?? false
  const nextOffset = meta ? meta.offset + meta.limit : lists.length

  return (
    <div style={{ minHeight: '100vh', background: '#1d120c' }}>
      <SEO
        title="Публичные списки — Хронониндзя"
        description="Подборки исторических Личностей, событий и периодов, прошедшие модерацию и доступные всем посетителям."
        canonical={typeof window !== 'undefined' ? `${window.location.origin}/lists/public` : undefined}
      />
      <header
        style={{
          padding: '48px 16px 32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(44,24,16,0.95), rgba(30,18,12,0.95))',
          color: '#f7f2eb',
        }}
      >
        <h1 style={{ fontSize: 36, marginBottom: 12, fontWeight: 700 }}>Публичные списки</h1>
        <p style={{ maxWidth: 640, margin: '0 auto', opacity: 0.8, fontSize: 16, lineHeight: 1.6 }}>
          Отборные коллекции исторических Личностей, достижений и периодов, подготовленные участниками
          сообщества и прошедшие модерацию. Изучайте подборки, открывайте новые имена и делитесь ссылками с
          друзьями.
        </p>
      </header>

      <main style={{ margin: '0 auto', maxWidth: 1100, padding: '32px 16px 80px', color: '#f7f2eb' }}>
        {loadState.error && (
          <div
            style={{
              background: 'rgba(220,53,69,0.15)',
              border: '1px solid rgba(220,53,69,0.35)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Ошибка загрузки</div>
            <div style={{ marginBottom: 12 }}>{loadState.error}</div>
            <button
              onClick={() => loadLists(0, false)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid rgba(139,69,19,0.5)',
                background: 'rgba(139,69,19,0.2)',
                color: '#f7f2eb',
              }}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {lists.length === 0 && !loadState.loading && !loadState.error && (
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 24,
              textAlign: 'center',
              opacity: 0.8,
            }}
          >
            Пока нет опубликованных списков. Загляните позже или станьте первым автором!
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {lists.map((list) => {
            const slug = list.public_slug || `list-${list.id}`
            return (
              <article
                key={list.id}
                style={{
                  background: 'rgba(37,22,15,0.9)',
                  border: '1px solid rgba(139,69,19,0.3)',
                  borderRadius: 16,
                  padding: 20,
                  display: 'grid',
                  gap: 12,
                  boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{list.title}</h2>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: 'rgba(46,160,67,0.2)',
                      color: '#8ddf8a',
                      fontSize: 11,
                      letterSpacing: 0.3,
                      alignSelf: 'flex-start',
                    }}
                  >
                    Опубликован
                  </span>
                </div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  {list.owner_display_name ? `Автор: ${list.owner_display_name}` : 'Автор неизвестен'}
                  {list.published_at && (
                    <span style={{ display: 'block', marginTop: 4 }}>
                      Дата: {new Date(list.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {list.public_description && (
                  <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.85 }}>
                    {trimDescription(list.public_description)}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    fontSize: 12,
                    opacity: 0.75,
                  }}
                >
                  <span>Личности: {list.persons_count}</span>
                  <span>Достижения: {list.achievements_count}</span>
                  <span>Периоды: {list.periods_count}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <Link
                    to={`/lists/public/${slug}`}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: 'rgba(139,69,19,0.35)',
                      color: '#f7f2eb',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Читать список
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${window.location.origin}/lists/public/${slug}`)
                      } catch {}
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(139,69,19,0.35)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#f7f2eb',
                      fontSize: 13,
                    }}
                  >
                    Копировать ссылку
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {hasMore && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              onClick={() => loadLists(nextOffset ?? lists.length, true)}
              disabled={loadState.loading}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid rgba(139,69,19,0.5)',
                background: 'rgba(139,69,19,0.25)',
                color: '#f7f2eb',
                fontWeight: 600,
              }}
            >
              {loadState.loading ? 'Загрузка…' : 'Показать ещё'}
            </button>
          </div>
        )}

        {loadState.loading && lists.length === 0 && (
          <div style={{ marginTop: 24, textAlign: 'center', opacity: 0.7 }}>Загрузка списков…</div>
        )}
      </main>
    </div>
  )
}


