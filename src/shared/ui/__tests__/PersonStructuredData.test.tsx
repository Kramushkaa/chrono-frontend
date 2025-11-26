import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { PersonStructuredData } from '../PersonStructuredData'
import type { Person } from 'shared/types'

// Mock window.location
const mockLocation = {
  href: 'https://example.com/person/test-person',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('PersonStructuredData', () => {
  const renderWithHelmet = (component: React.ReactElement) => {
    return render(<HelmetProvider>{component}</HelmetProvider>)
  }

  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = ''
  })

  const createMockPerson = (overrides: Partial<Person> = {}): Person => ({
    id: 'test-person',
    name: 'Test Person',
    birthYear: -500,
    deathYear: -400,
    category: 'Философ',
    country: 'Греция',
    description: 'Test description',
    imageUrl: 'https://example.com/image.jpg',
    wikiLink: 'https://wikipedia.org/test',
    achievements: [],
    periods: [],
    ...overrides,
  })

  it('should render structured data for person with all fields', async () => {
    const person = createMockPerson()
    renderWithHelmet(<PersonStructuredData person={person} />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      expect(script).toBeInTheDocument()

      const structuredData = JSON.parse(script?.textContent || '{}')
      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Test Person',
        birthDate: '-500',
        deathDate: '-400',
        description: 'Test description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/person/test-person',
        jobTitle: 'Философ',
        nationality: 'Греция',
        sameAs: ['https://wikipedia.org/test'],
      })
    })
  })

  it('should render structured data for person with minimal fields', async () => {
    const person = createMockPerson({
      birthYear: undefined,
      deathYear: undefined,
      description: undefined,
      imageUrl: undefined,
      wikiLink: undefined,
      category: undefined,
      country: undefined,
    })
    renderWithHelmet(<PersonStructuredData person={person} />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      const structuredData = JSON.parse(script?.textContent || '{}')

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Test Person',
        url: 'https://example.com/person/test-person',
      })

      // Should not have undefined fields
      expect(structuredData).not.toHaveProperty('birthDate')
      expect(structuredData).not.toHaveProperty('deathDate')
      expect(structuredData).not.toHaveProperty('description')
      expect(structuredData).not.toHaveProperty('image')
      expect(structuredData).not.toHaveProperty('jobTitle')
      expect(structuredData).not.toHaveProperty('nationality')
      expect(structuredData).not.toHaveProperty('sameAs')
    })
  })

  it('should handle person with only birthYear', async () => {
    const person = createMockPerson({
      deathYear: undefined,
    })
    renderWithHelmet(<PersonStructuredData person={person} />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      const structuredData = JSON.parse(script?.textContent || '{}')

      expect(structuredData).toHaveProperty('birthDate', '-500')
      expect(structuredData).not.toHaveProperty('deathDate')
    })
  })

  it('should handle person with only deathYear', async () => {
    const person = createMockPerson({
      birthYear: undefined,
    })
    renderWithHelmet(<PersonStructuredData person={person} />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      const structuredData = JSON.parse(script?.textContent || '{}')

      expect(structuredData).not.toHaveProperty('birthDate')
      expect(structuredData).toHaveProperty('deathDate', '-400')
    })
  })

  it('should include sameAs only when wikiLink is provided', async () => {
    const personWithWiki = createMockPerson({ wikiLink: 'https://wikipedia.org/test' })
    const { rerender } = renderWithHelmet(<PersonStructuredData person={personWithWiki} />)

    await waitFor(() => {
      let script = document.querySelector('script[type="application/ld+json"]')
      let structuredData = JSON.parse(script?.textContent || '{}')
      expect(structuredData).toHaveProperty('sameAs', ['https://wikipedia.org/test'])
    })

    const personWithoutWiki = createMockPerson({ wikiLink: undefined })
    rerender(<HelmetProvider><PersonStructuredData person={personWithoutWiki} /></HelmetProvider>)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      const structuredData = JSON.parse(script?.textContent || '{}')
      expect(structuredData).not.toHaveProperty('sameAs')
    })
  })

  it('should use window.location.href for url when available', async () => {
    const person = createMockPerson()
    renderWithHelmet(<PersonStructuredData person={person} />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      const structuredData = JSON.parse(script?.textContent || '{}')
      expect(structuredData.url).toBe('https://example.com/person/test-person')
    })
  })

  it('should handle empty string values correctly', async () => {
    const person = createMockPerson({
      description: '',
      imageUrl: '',
      wikiLink: '',
      category: '',
      country: '',
    })
    renderWithHelmet(<PersonStructuredData person={person} />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      const structuredData = JSON.parse(script?.textContent || '{}')

      // Empty strings should be treated as undefined
      expect(structuredData).not.toHaveProperty('description')
      expect(structuredData).not.toHaveProperty('image')
      expect(structuredData).not.toHaveProperty('jobTitle')
      expect(structuredData).not.toHaveProperty('nationality')
      expect(structuredData).not.toHaveProperty('sameAs')
    })
  })

  it('should convert years to strings in structured data', async () => {
    const person = createMockPerson({
      birthYear: 1800,
      deathYear: 1900,
    })
    renderWithHelmet(<PersonStructuredData person={person} />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      const structuredData = JSON.parse(script?.textContent || '{}')

      expect(typeof structuredData.birthDate).toBe('string')
      expect(structuredData.birthDate).toBe('1800')
      expect(typeof structuredData.deathDate).toBe('string')
      expect(structuredData.deathDate).toBe('1900')
    })
  })
})
