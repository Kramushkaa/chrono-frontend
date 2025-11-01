export function buildMineParams(
  shouldApply: boolean,
  opts: {
    q?: string
    categoryList?: string[]
    countryList?: string[]
    statusMap?: Record<string, boolean>
    extra?: Record<string, string | undefined>
  }
): Record<string, string> {
  if (!shouldApply) return {};
  const params: Record<string, string> = {};
  const { q, categoryList, countryList, statusMap, extra } = opts;

  if (q && q.trim().length > 0) params.q = q;
  if (Array.isArray(categoryList) && categoryList.length > 0) params.category = categoryList.join(',');
  if (Array.isArray(countryList) && countryList.length > 0) params.country = countryList.join(',');
  if (statusMap && Object.entries(statusMap).some(([_, checked]) => checked)) {
    params.status = Object.entries(statusMap)
      .filter(([_, checked]) => checked)
      .map(([status]) => status)
      .join(',');
  }
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (typeof v === 'string' && v.trim().length > 0) params[k] = v;
    }
  }
  return params;
}





