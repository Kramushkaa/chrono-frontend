import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { SEO } from '../SEO'

// Mock window.location
const mockLocation = {
  href: 'https://example.com/test-page',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('SEO', () => {
  const renderWithHelmet = (component: React.ReactElement) => {
    return render(<HelmetProvider>{component}</HelmetProvider>)
  }

  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = ''
  })

  it('should render title', async () => {
    renderWithHelmet(<SEO title="Test Title" />)

    await waitFor(() => {
      const helmet = document.querySelector('title')
      expect(helmet).toBeInTheDocument()
      expect(helmet?.textContent).toBe('Test Title')
    })
  })

  it('should render description meta tag when provided', async () => {
    renderWithHelmet(<SEO title="Test" description="Test description" />)

    await waitFor(() => {
      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription).toBeInTheDocument()
      expect(metaDescription).toHaveAttribute('content', 'Test description')
    })
  })

  it('should not render description meta tag when not provided', async () => {
    renderWithHelmet(<SEO title="Test" />)

    await waitFor(() => {
      const metaDescription = document.querySelector('meta[name="description"]')
      expect(metaDescription).not.toBeInTheDocument()
    })
  })

  it('should render canonical link when provided', async () => {
    const canonical = 'https://example.com/canonical'
    renderWithHelmet(<SEO title="Test" canonical={canonical} />)

    await waitFor(() => {
      const canonicalLink = document.querySelector('link[rel="canonical"]')
      expect(canonicalLink).toBeInTheDocument()
      expect(canonicalLink).toHaveAttribute('href', canonical)
    })
  })

  it('should render Open Graph meta tags', async () => {
    renderWithHelmet(
      <SEO title="Test Title" description="Test description" canonical="https://example.com/test" />
    )

    await waitFor(() => {
      expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'website')
      expect(document.querySelector('meta[property="og:site_name"]')).toHaveAttribute(
        'content',
        'Хронониндзя'
      )
      expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Test Title')
      expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
        'content',
        'Test description'
      )
      expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
        'content',
        'https://example.com/test'
      )
    })
  })

  it('should render Open Graph image when provided', async () => {
    const image = 'https://example.com/image.jpg'
    renderWithHelmet(<SEO title="Test" image={image} />)

    await waitFor(() => {
      const ogImage = document.querySelector('meta[property="og:image"]')
      expect(ogImage).toBeInTheDocument()
      expect(ogImage).toHaveAttribute('content', image)
    })
  })

  it('should render Twitter Card meta tags', async () => {
    renderWithHelmet(<SEO title="Test Title" description="Test description" />)

    await waitFor(() => {
      expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image'
      )
      expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute('content', 'Test Title')
      expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
        'content',
        'Test description'
      )
    })
  })

  it('should render Twitter image when provided', async () => {
    const image = 'https://example.com/twitter-image.jpg'
    renderWithHelmet(<SEO title="Test" image={image} />)

    await waitFor(() => {
      const twitterImage = document.querySelector('meta[name="twitter:image"]')
      expect(twitterImage).toBeInTheDocument()
      expect(twitterImage).toHaveAttribute('content', image)
    })
  })

  it('should render JSON-LD structured data', async () => {
    renderWithHelmet(<SEO title="Test" canonical="https://example.com/test" />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      expect(script).toBeInTheDocument()

      const structuredData = JSON.parse(script?.textContent || '{}')
      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Хронониндзя',
        url: 'https://example.com/test',
      })
    })
  })

  it('should use window.location.href when canonical is not provided', async () => {
    renderWithHelmet(<SEO title="Test" />)

    await waitFor(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      const structuredData = JSON.parse(script?.textContent || '{}')
      expect(structuredData.url).toBe('https://example.com/test-page')
    })
  })

  it('should not render optional meta tags when values are not provided', async () => {
    renderWithHelmet(<SEO title="Test" />)

    await waitFor(() => {
      // Check that title is rendered (required)
      expect(document.querySelector('title')).toBeInTheDocument()

      // Check that optional tags are not rendered
      expect(document.querySelector('meta[name="description"]')).not.toBeInTheDocument()
      expect(document.querySelector('link[rel="canonical"]')).not.toBeInTheDocument()
      expect(document.querySelector('meta[property="og:description"]')).not.toBeInTheDocument()
      expect(document.querySelector('meta[property="og:url"]')).not.toBeInTheDocument()
      expect(document.querySelector('meta[property="og:image"]')).not.toBeInTheDocument()
      expect(document.querySelector('meta[name="twitter:description"]')).not.toBeInTheDocument()
      expect(document.querySelector('meta[name="twitter:image"]')).not.toBeInTheDocument()
    })
  })
})
