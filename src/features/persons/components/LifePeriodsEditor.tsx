import React from 'react'
import { SearchableSelect, SelectOption } from 'shared/ui/SearchableSelect'

export type LifePeriodDraft = { countryId: string; start: number | ''; end: number | ''; error?: string }

type Props = {
  periods: LifePeriodDraft[]
  onChange: (periods: LifePeriodDraft[]) => void
  options: SelectOption[]
  minYear?: number
  maxYear?: number
  disableDeleteWhenSingle?: boolean
  periodErrors?: string[]
}

export function LifePeriodsEditor({ periods, onChange, options, minYear, maxYear, disableDeleteWhenSingle = true, periodErrors = [] }: Props) {
  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {periods.map((lp, idx) => {
        const hasError = periodErrors[idx] && periodErrors[idx] !== ''
        return (
          <div key={idx} style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr auto', 
            gap: 'clamp(4px, 1vw, 8px)', 
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <SearchableSelect
              placeholder="Страна"
              value={lp.countryId}
              options={options}
              onChange={(val) => onChange(periods.map((it, i) => i === idx ? { ...it, countryId: val } : it))}
            />
            <input
              type="number"
              placeholder="Начало"
              value={lp.start}
              min={minYear}
              max={maxYear}
              onChange={(e) => onChange(periods.map((it, i) => i === idx ? { ...it, start: (e.target.value === '' ? '' : Number(e.target.value)) } : it))}
              style={{ 
                borderColor: hasError ? '#ff8888' : (typeof lp.start === 'number' && minYear != null && lp.start < minYear) ? '#ff8888' : undefined,
                padding: '8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                minWidth: '0'
              }}
            />
            <input
              type="number"
              placeholder="Конец"
              value={lp.end}
              min={minYear}
              max={maxYear}
              onChange={(e) => onChange(periods.map((it, i) => i === idx ? { ...it, end: (e.target.value === '' ? '' : Number(e.target.value)) } : it))}
              style={{ 
                borderColor: hasError ? '#ff8888' : (typeof lp.end === 'number' && maxYear != null && lp.end > maxYear) ? '#ff8888' : undefined,
                padding: '8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                minWidth: '0'
              }}
            />
            <button
              type="button"
              disabled={disableDeleteWhenSingle && periods.length <= 1}
              title={disableDeleteWhenSingle && periods.length <= 1 ? 'Нельзя удалить единственную страну' : 'Удалить'}
              onClick={() => {
                if (disableDeleteWhenSingle && periods.length <= 1) return
                onChange(periods.filter((_, i) => i !== idx))
              }}
            >Удалить</button>
            {hasError && (
              <div 
                role="alert" 
                aria-live="polite"
                style={{ gridColumn: '1 / -1', color: '#d32f2f', fontSize: 12, marginTop: 4 }}
              >
                {periodErrors[idx]}
              </div>
            )}
            {lp.error && !hasError && (
              <div style={{ gridColumn: '1 / -1', color: '#ffaaaa', fontSize: 12 }}>{lp.error}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}






