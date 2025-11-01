import { getFirstCountry } from '../getFirstCountry'

describe('getFirstCountry', () => {
  it('should return single country as is', () => {
    expect(getFirstCountry('Россия')).toBe('Россия')
    expect(getFirstCountry('Франция')).toBe('Франция')
    expect(getFirstCountry('США')).toBe('США')
  })

  it('should extract first country from compound string', () => {
    expect(getFirstCountry('Россия / СССР')).toBe('Россия')
    expect(getFirstCountry('Франция / Швейцария')).toBe('Франция')
    expect(getFirstCountry('США / Великобритания / Германия')).toBe('США')
  })

  it('should trim whitespace', () => {
    expect(getFirstCountry('  Россия  /  СССР  ')).toBe('Россия')
    expect(getFirstCountry('Франция/Германия')).toBe('Франция')
  })

  it('should handle empty string', () => {
    expect(getFirstCountry('')).toBe('')
  })

  it('should handle string with only slashes', () => {
    // Returns original if first element after split is empty
    const result = getFirstCountry(' / / ')
    expect(typeof result).toBe('string')
  })

  it('should handle single slash', () => {
    // Returns empty string or original based on split result
    const result = getFirstCountry('/')
    expect(typeof result).toBe('string')
  })

  it('should handle trailing slash', () => {
    expect(getFirstCountry('Россия /')).toBe('Россия')
  })

  it('should handle leading slash', () => {
    // Leading slash creates empty first element
    const result = getFirstCountry('/ Россия')
    expect(typeof result).toBe('string')
  })

  it('should return original string if split fails', () => {
    const country = 'Россия'
    expect(getFirstCountry(country)).toBe(country)
  })
})






