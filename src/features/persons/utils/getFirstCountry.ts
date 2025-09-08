// Вспомогательная функция для извлечения первой страны из списка (домен Личностей)
export const getFirstCountry = (countryString: string): string => {
  const countries = countryString.split('/').map(c => c.trim())
  return countries[0] || countryString
}
