import { buildMineParams } from '../queryParams'

describe('queryParams', () => {
  describe('buildMineParams', () => {
    it('should return empty object when shouldApply is false', () => {
      const result = buildMineParams(false, { q: 'test' })

      expect(result).toEqual({})
    })

    it('should build params with search query', () => {
      const result = buildMineParams(true, { q: 'search term' })

      expect(result).toEqual({ q: 'search term' })
    })

    it('should ignore empty search query', () => {
      const result = buildMineParams(true, { q: '   ' })

      expect(result).toEqual({})
    })

    it('should build params with category list', () => {
      const result = buildMineParams(true, { categoryList: ['Cat1', 'Cat2'] })

      expect(result).toEqual({ category: 'Cat1,Cat2' })
    })

    it('should ignore empty category list', () => {
      const result = buildMineParams(true, { categoryList: [] })

      expect(result).toEqual({})
    })

    it('should build params with country list', () => {
      const result = buildMineParams(true, { countryList: ['Russia', 'France'] })

      expect(result).toEqual({ country: 'Russia,France' })
    })

    it('should ignore empty country list', () => {
      const result = buildMineParams(true, { countryList: [] })

      expect(result).toEqual({})
    })

    it('should build params with status map', () => {
      const statusMap = { approved: true, pending: false, draft: true }
      const result = buildMineParams(true, { statusMap })

      expect(result).toEqual({ status: 'approved,draft' })
    })

    it('should ignore status map with no checked items', () => {
      const statusMap = { approved: false, pending: false }
      const result = buildMineParams(true, { statusMap })

      expect(result).toEqual({})
    })

    it('should build params with extra fields', () => {
      const result = buildMineParams(true, { extra: { customField: 'value' } })

      expect(result).toEqual({ customField: 'value' })
    })

    it('should ignore empty extra fields', () => {
      const result = buildMineParams(true, { extra: { field1: '  ', field2: '' } })

      expect(result).toEqual({})
    })

    it('should build params with all options', () => {
      const result = buildMineParams(true, {
        q: 'search',
        categoryList: ['Cat1'],
        countryList: ['Russia'],
        statusMap: { approved: true },
        extra: { custom: 'value' },
      })

      expect(result).toEqual({
        q: 'search',
        category: 'Cat1',
        country: 'Russia',
        status: 'approved',
        custom: 'value',
      })
    })

    it('should handle undefined options', () => {
      const result = buildMineParams(true, {})

      expect(result).toEqual({})
    })

    it('should handle single item lists', () => {
      const result = buildMineParams(true, {
        categoryList: ['Single'],
        countryList: ['One'],
      })

      expect(result).toEqual({
        category: 'Single',
        country: 'One',
      })
    })

    it('should handle non-string extra values', () => {
      const result = buildMineParams(true, {
        extra: { num: 123 as any, bool: true as any, str: 'valid' },
      })

      expect(result).toEqual({ str: 'valid' })
    })
  })
})






