import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicListDetail } from 'shared/api/lists'
import type { PublicListDetail, PublicListItem } from 'shared/types'
import { SEO } from 'shared/ui/SEO'

type LoadState = 'idle' | 'loading' | 'error'

function formatYears(start?: number | null, end?: number | null) {
  if (start != null && end != null) {
    return `${start} — ${end}`
  }
  if (start != null) return `с ${start}`
  if (end != null) return `до ${end}`
  return 'годы неизвестны'
}

function renderItem(item: PublicListItem) {
  if (item.type === 'person') {
    return (
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{item.name}</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          {item.category || 'Категория неизвестна'} • {formatYears(item.birth_year, item.death_year)}
        </div>
      </div>
    )
  }

  if (item.type === 'achievement') {
    return (
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{item.description}</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          {item.year ? `Год: ${item.year}` : 'Год неизвестен'}
          {item.person_id && <span style={{ marginLeft: 12 }}>Личность: {item.person_id}</span>}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div style={{ fontWeight: 600, fontSize: 16 }}>{item.period_type || 'Период'}</div>
      <div style={{ fontSize: 13, opacity: 0.75 }}>{formatYears(item.start_year, item.end_year)}</div>
      {item.person_id && <div style={{ fontSize: 12, opacity: 0.7 }}>Личность: {item.person_id}</div>}
    </div>
  )
}

export default function PublicListDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [state, setState] = useState<LoadState>('loading')
  const [list, setList] = useState<PublicListDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setState('loading')
      setError(null)
      try {
        const payload = await getPublicListDetail(slug)
        if (mounted) {
          setList(payload)
          setState('idle')
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Не удалось загрузить список'
          setError(message)
          setState('error')
        }
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [slug])

  const shareUrl = useMemo(() => {
    if (!list) return window.location.href
    const actualSlug = list.public_slug || `list-${list.id}`
    return `${window.location.origin}/lists/public/${actualSlug}`
  }, [list])

  return (
    <div style={{ minHeight: '100vh', background: '#1d120c', color: '#f7f2eb' }}>
      <SEO
        title={list ? `${list.title} — Публичный список` : 'Публичный список — Хронониндзя'}
        description={list?.public_description || 'Подборка исторических данных в проекте Хронониндзя.'}
        canonical={typeof window !== 'undefined' ? shareUrl : undefined}
      />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 16px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <Link
            to="/lists/public"
            style={{ color: '#d7b48a', textDecoration: 'none', fontSize: 14 }}
          >
            ← Ко всем спискам
          </Link>
        </div>

        {state === 'loading' && (
          <div style={{ opacity: 0.8 }}>Загрузка списка…</div>
        )}

        {state === 'error' && (
          <div
            style={{
              background: 'rgba(220,53,69,0.15)',
              border: '1px solid rgba(220,53,69,0.35)',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Ошибка</div>
            <div>{error}</div>
          </div>
        )}

        {state === 'idle' && list && (
          <>
            <header style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 40, marginBottom: 12, fontWeight: 700 }}>{list.title}</h1>
              <div style={{ fontSize: 14, opacity: 0.75, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>Автор: {list.owner_display_name || `#${list.owner_user_id}`}</span>
                {list.published_at && <span>Опубликован: {new Date(list.published_at).toLocaleDateString()}</span>}
              </div>
              {list.public_description && (
                <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.6, maxWidth: 720 }}>
                  {list.public_description}
                </p>
              )}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, fontSize: 13, opacity: 0.8 }}>
                <span>Всего элементов: {list.items_count}</span>
                <span>Личности: {list.persons_count}</span>
                <span>Достижения: {list.achievements_count}</span>
                <span>Периоды: {list.periods_count}</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareUrl)
                    } catch {}
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(139,69,19,0.5)',
                    background: 'rgba(139,69,19,0.25)',
                    color: '#f7f2eb',
                    fontWeight: 600,
                  }}
                >
                  Скопировать ссылку
                </button>
              </div>
            </header>

            <section style={{ display: 'grid', gap: 16 }}>
              {list.items.length === 0 && (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    padding: 20,
                    opacity: 0.8,
                  }}
                >
                  В этом списке пока нет элементов.
                </div>
              )}
              {list.items.map((item) => (
                <div
                  key={`${item.type}-${item.list_item_id}`}
                  style={{
                    background: 'rgba(37,22,15,0.9)',
                    border: '1px solid rgba(139,69,19,0.25)',
                    borderRadius: 12,
                    padding: 18,
                    display: 'grid',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 0.4,
                      opacity: 0.6,
                    }}
                  >
                    {item.type === 'person' && 'Личность'}
                    {item.type === 'achievement' && 'Достижение'}
                    {item.type === 'period' && 'Период'}
                  </div>
                  {renderItem(item)}
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

