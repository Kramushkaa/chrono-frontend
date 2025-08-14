import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type SelectOption = { label: string; value: string }

type SearchableSelectProps = {
  placeholder?: string
  value: string
  onChange: (value: string, option?: SelectOption) => void
  onSearchChange?: (query: string) => void
  options: SelectOption[]
  isLoading?: boolean
  disabled?: boolean
  allowClear?: boolean
  locale?: string
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  placeholder,
  value,
  onChange,
  onSearchChange,
  options,
  isLoading,
  disabled,
  allowClear = true,
  locale
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const listRef = useRef<HTMLDivElement>(null)
  const listboxIdRef = useRef<string>('ss-' + Math.random().toString(36).slice(2))

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const textKey = useCallback((s: string) => s.normalize('NFKD').toLocaleLowerCase(locale || undefined), [locale])
  const filtered = useMemo(() => {
    const q = textKey(query.trim())
    if (!q) return options
    return options.filter(o => textKey(o.label).includes(q))
  }, [options, query, textKey])

  const selectedOption = useMemo(() => options.find(o => o.value === value), [options, value])

  const canClear = allowClear && !disabled && !!value

  // Ensure active option stays visible when navigating
  useEffect(() => {
    if (!open) return
    if (!listRef.current) return
    if (activeIndex < 0) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-index='${activeIndex}']`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  // Reset activeIndex when opening / filtering
  useEffect(() => {
    if (!open) return
    if (filtered.length === 0) { setActiveIndex(-1); return }
    const idxOfSelected = filtered.findIndex(o => o.value === value)
    setActiveIndex(idxOfSelected >= 0 ? idxOfSelected : 0)
  }, [open, filtered, value])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxIdRef.current : undefined}
        style={{ width: '100%', padding: 6, textAlign: 'left' }}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
            // Active index will be set by effect
          }
          if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
      >
        {selectedOption ? selectedOption.label : (placeholder || 'Выбрать...')}
      </button>
      {canClear && (
        <button
          type="button"
          aria-label="Очистить выбор"
          title="Очистить"
          onClick={(e) => { e.stopPropagation(); onChange(''); setQuery(''); setOpen(false) }}
          style={{ position: 'absolute', right: 6, top: 6, background: 'transparent', color: '#f4e4c1', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
        >
          ×
        </button>
      )}
      {open && (
        <div ref={listRef} id={listboxIdRef.current} role="listbox" aria-label="Варианты" style={{ position: 'absolute', zIndex: 1000, top: '100%', left: 0, right: 0, background: 'rgba(44,24,16,0.98)', border: '1px solid rgba(139,69,19,0.3)', borderRadius: 6, marginTop: 4, maxHeight: 240, overflowY: 'auto' }}>
          <div style={{ padding: 6 }}>
            <input
              value={query}
              onChange={(e) => {
                const q = e.target.value
                setQuery(q)
                if (debounceRef.current) window.clearTimeout(debounceRef.current)
                debounceRef.current = window.setTimeout(() => onSearchChange?.(q), 300)
              }}
              placeholder="Поиск..."
              style={{ width: '100%', padding: 6 }}
              autoFocus
              aria-activedescendant={activeIndex >= 0 ? `ss-option-${activeIndex}` : undefined}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setActiveIndex(i => {
                    const next = (i < 0 ? 0 : i) + 1
                    return next >= filtered.length ? 0 : next
                  })
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setActiveIndex(i => {
                    const prev = (i < 0 ? filtered.length : i) - 1
                    return prev < 0 ? filtered.length - 1 : prev
                  })
                } else if (e.key === 'Home') {
                  e.preventDefault()
                  setActiveIndex(filtered.length > 0 ? 0 : -1)
                } else if (e.key === 'End') {
                  e.preventDefault()
                  setActiveIndex(filtered.length > 0 ? filtered.length - 1 : -1)
                } else if (e.key === 'PageDown') {
                  e.preventDefault()
                  setActiveIndex(i => {
                    if (filtered.length === 0) return -1
                    const next = (i < 0 ? 0 : i) + 5
                    return next >= filtered.length ? filtered.length - 1 : next
                  })
                } else if (e.key === 'PageUp') {
                  e.preventDefault()
                  setActiveIndex(i => {
                    if (filtered.length === 0) return -1
                    const prev = (i < 0 ? filtered.length - 1 : i) - 5
                    return prev < 0 ? 0 : prev
                  })
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  if (activeIndex >= 0 && activeIndex < filtered.length) {
                    const opt = filtered[activeIndex]
                    onChange(opt.value, opt)
                    setOpen(false)
                  }
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  if (query) setQuery('')
                  else setOpen(false)
                }
              }}
            />
          </div>
          {isLoading && <div style={{ padding: 6, opacity: 0.8 }}>Загрузка...</div>}
          {filtered.map((o, idx) => {
            const isActive = idx === activeIndex
            const isSelected = o.value === value
            return (
              <div
                key={o.value}
                id={`ss-option-${idx}`}
                data-index={idx}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => { onChange(o.value, o); setOpen(false) }}
                style={{ padding: 6, cursor: 'pointer', background: isActive ? 'rgba(139,69,19,0.25)' : (isSelected ? 'rgba(139,69,19,0.15)' : 'transparent') }}
              >
                {o.label}
              </div>
            )
          })}
          {!isLoading && filtered.length === 0 && (
            <div style={{ padding: 6, opacity: 0.8 }}>Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  )
}


