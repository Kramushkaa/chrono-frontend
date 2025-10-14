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
}

export function LifePeriodsEditor({ periods, onChange, options, minYear, maxYear, disableDeleteWhenSingle = true }: Props) {
  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {periods.map((lp, idx) => (
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
              borderColor: (typeof lp.start === 'number' && minYear != null && lp.start < minYear) ? '#ff8888' : undefined,
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
              borderColor: (typeof lp.end === 'number' && maxYear != null && lp.end > maxYear) ? '#ff8888' : undefined,
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
            style={{ 
              opacity: disableDeleteWhenSingle && periods.length <= 1 ? 0.5 : 1, 
              cursor: disableDeleteWhenSingle && periods.length <= 1 ? 'not-allowed' : 'pointer',
              padding: '6px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: '#f8f9fa',
              minWidth: '0',
              whiteSpace: 'nowrap'
            }}
            onClick={() => {
              if (disableDeleteWhenSingle && periods.length <= 1) return
              onChange(periods.filter((_, i) => i !== idx))
            }}
          >Удалить</button>
          {lp.error && (
            <div style={{ gridColumn: '1 / -1', color: '#ffaaaa', fontSize: 12 }}>{lp.error}</div>
          )}
        </div>
      ))}
    </div>
  )
}



