export type LifePeriodDraft = { countryId: string; start: number | ''; end: number | '' }

export interface LifePeriodValidationResult {
  ok: boolean
  message?: string
  periodErrors?: string[]
}

export function validateLifePeriodsClient(
  periods: LifePeriodDraft[],
  birthYear?: number,
  deathYear?: number,
  isRequired: boolean = false
): LifePeriodValidationResult {
  if (!periods || periods.length === 0) {
    if (isRequired) {
      return { ok: false, message: 'Необходимо указать хотя бы один период жизни', periodErrors: [] };
    }
    return { ok: true, periodErrors: [] };
  }

  const periodErrors: string[] = new Array(periods.length).fill('')
  let hasErrors = false

  // Валидация каждого периода
  for (let i = 0; i < periods.length; i++) {
    const lp = periods[i]
    
    if (!lp.countryId) {
      periodErrors[i] = 'Не указана страна'
      hasErrors = true
      continue
    }
    
    if (lp.start === '' || lp.end === '') {
      periodErrors[i] = 'Заполните годы начала и конца периода'
      hasErrors = true
      continue
    }
    
    const s = Number(lp.start), e = Number(lp.end)
    
    if (!Number.isInteger(s) || !Number.isInteger(e)) {
      periodErrors[i] = 'Годы должны быть целыми числами'
      hasErrors = true
      continue
    }
    
    if (s > e) {
      periodErrors[i] = 'Год начала не может быть больше года окончания'
      hasErrors = true
      continue
    }
    
    if (birthYear != null && s < birthYear) {
      periodErrors[i] = `Начало периода раньше года рождения (${birthYear})`
      hasErrors = true
      continue
    }
    
    if (deathYear != null && e > deathYear) {
      periodErrors[i] = `Конец периода позже года смерти (${deathYear})`
      hasErrors = true
      continue
    }
  }

  if (hasErrors) {
    return { ok: false, message: 'Исправьте ошибки в периодах', periodErrors }
  }

  // Проверка покрытия и разрывов между периодами
  const sorted = periods
    .map((lp, idx) => ({ 
      countryId: lp.countryId, 
      start: Number(lp.start), 
      end: Number(lp.end),
      originalIndex: idx 
    }))
    .sort((a, b) => a.start - b.start)

  if (birthYear != null && sorted[0].start > birthYear) {
    periodErrors[sorted[0].originalIndex] = 'Первый период начинается позже года рождения'
    hasErrors = true
  }

  if (deathYear != null && sorted[sorted.length - 1].end < deathYear) {
    periodErrors[sorted[sorted.length - 1].originalIndex] = 'Последний период заканчивается раньше года смерти'
    hasErrors = true
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    
    if (curr.start > prev.end + 1) {
      periodErrors[curr.originalIndex] = 'Разрыв с предыдущим периодом'
      hasErrors = true
    } else if (curr.start < prev.end) {
      periodErrors[curr.originalIndex] = 'Пересекается с предыдущим периодом'
      hasErrors = true
    }
  }

  if (hasErrors) {
    return { ok: false, message: 'Исправьте ошибки в периодах', periodErrors }
  }

  return { ok: true, periodErrors: [] }
}







