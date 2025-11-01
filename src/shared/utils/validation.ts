export type LifePeriodDraft = { countryId: string; start: number | ''; end: number | '' }

export function validateLifePeriodsClient(
  periods: LifePeriodDraft[],
  birthYear?: number,
  deathYear?: number,
  isRequired: boolean = false
): { ok: boolean; message?: string } {
  if (!periods || periods.length === 0) {
    if (isRequired) {
      return { ok: false, message: 'Необходимо указать хотя бы один период жизни' };
    }
    return { ok: true };
  }
  for (const lp of periods) {
    if (!lp.countryId || lp.start === '' || lp.end === '') {
      return { ok: false, message: 'Заполните страну и годы начала/конца для каждого периода' };
    }
    const s = Number(lp.start), e = Number(lp.end);
    if (!Number.isInteger(s) || !Number.isInteger(e)) {
      return { ok: false, message: 'Годы периода должны быть целыми числами' };
    }
    if (s > e) {
      return { ok: false, message: 'Год начала периода не может быть больше года окончания' };
    }
    if (birthYear != null && s < birthYear) {
      return { ok: false, message: `Год начала периода не может быть меньше года рождения (${birthYear})` };
    }
    if (deathYear != null && e > deathYear) {
      return { ok: false, message: `Год окончания периода не может быть больше года смерти (${deathYear})` };
    }
  }
  const sorted = periods
    .map(lp => ({ countryId: lp.countryId, start: Number(lp.start), end: Number(lp.end) }))
    .sort((a, b) => a.start - b.start);
  if (birthYear != null && sorted[0].start > birthYear) {
    return { ok: false, message: 'Периоды должны покрывать все годы жизни: первый период начинается позже года рождения' };
  }
  if (deathYear != null && sorted[sorted.length - 1].end < deathYear) {
    return { ok: false, message: 'Периоды должны покрывать все годы жизни: последний период заканчивается раньше года смерти' };
  }
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.start > prev.end + 1) {
      return { ok: false, message: 'Между периодами не должно быть разрывов' };
    }
    // Разрешаем общую границу (curr.start === prev.end), но запрещаем пересечение
    if (curr.start < prev.end) {
      return { ok: false, message: 'Периоды не должны пересекаться' };
    }
  }
  return { ok: true };
}






