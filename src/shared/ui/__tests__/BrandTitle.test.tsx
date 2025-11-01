import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { BrandTitle } from '../BrandTitle'

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('BrandTitle', () => {
  it('should render brand title without link by default', () => {
    render(
      <TestWrapper>
        <BrandTitle />
      </TestWrapper>
    )

    expect(screen.getByText('ХР')).toBeInTheDocument()
    expect(screen.getByText('НОНИНДЗЯ')).toBeInTheDocument()
    expect(screen.getByAltText('')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('should render brand title with link when asLink is true', () => {
    render(
      <TestWrapper>
        <BrandTitle asLink={true} />
      </TestWrapper>
    )

    expect(screen.getByText('ХР')).toBeInTheDocument()
    expect(screen.getByText('НОНИНДЗЯ')).toBeInTheDocument()
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/menu')
    expect(screen.getByLabelText('Перейти в меню')).toBeInTheDocument()
  })

  it('should render without link when asLink is false', () => {
    render(
      <TestWrapper>
        <BrandTitle asLink={false} />
      </TestWrapper>
    )

    expect(screen.getByText('ХР')).toBeInTheDocument()
    expect(screen.getByText('НОНИНДЗЯ')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('should have proper image attributes', () => {
    render(
      <TestWrapper>
        <BrandTitle />
      </TestWrapper>
    )

    const image = screen.getByAltText('')
    expect(image).toHaveAttribute('src', '/logo192.png')
    expect(image).toHaveAttribute('alt', '')
    expect(image).toHaveAttribute('aria-hidden', 'true')
  })

  it('should have proper styling', () => {
    render(
      <TestWrapper>
        <BrandTitle />
      </TestWrapper>
    )

    // Check that the main container has inline styles
    const brandElement = screen.getByText('ХР')
    expect(brandElement.parentElement).toHaveStyle({
      display: 'inline-flex',
      alignItems: 'center',
    })
  })
})




