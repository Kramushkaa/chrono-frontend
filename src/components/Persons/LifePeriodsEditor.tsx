import React from 'react'
import { SearchableSelect, SelectOption } from '../SearchableSelect'

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
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px auto', gap: 8, alignItems: 'center' }}>
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
            onChange={(e) => onChange(periods.map((it, i) => i === idx ? { ...it, start: (e.target.value === '' ? '' : Number(e.target.value)) as any } : it))}
            style={{ borderColor: (typeof lp.start === 'number' && minYear != null && lp.start < minYear) ? '#ff8888' : undefined }}
          />
          <input
            type="number"
            placeholder="Конец"
            value={lp.end}
            min={minYear}
            max={maxYear}
            onChange={(e) => onChange(periods.map((it, i) => i === idx ? { ...it, end: (e.target.value === '' ? '' : Number(e.target.value)) as any } : it))}
            style={{ borderColor: (typeof lp.end === 'number' && maxYear != null && lp.end > maxYear) ? '#ff8888' : undefined }}
          />
          <button
            type="button"
            disabled={disableDeleteWhenSingle && periods.length <= 1}
            title={disableDeleteWhenSingle && periods.length <= 1 ? 'Нельзя удалить единственную страну' : 'Удалить'}
            style={{ opacity: disableDeleteWhenSingle && periods.length <= 1 ? 0.5 : 1, cursor: disableDeleteWhenSingle && periods.length <= 1 ? 'not-allowed' : 'pointer' }}
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



