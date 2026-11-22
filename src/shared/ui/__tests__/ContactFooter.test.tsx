import React from 'react'
import { render, screen } from '@testing-library/react'
import { ContactFooter } from '../ContactFooter'

describe('ContactFooter', () => {
  it('should render contact information', () => {
    render(<ContactFooter />)
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText('Связь:')).toBeInTheDocument()
    expect(screen.getByText('admin@chrono.ninja')).toBeInTheDocument()
    expect(screen.getByText('t.me/chrono_ninja')).toBeInTheDocument()
  })

  it('should render email link', () => {
    render(<ContactFooter />)
    
    const emailLink = screen.getByRole('link', { name: 'admin@chrono.ninja' })
    expect(emailLink).toHaveAttribute('href', 'mailto:admin@chrono.ninja')
  })

  it('should render telegram link', () => {
    render(<ContactFooter />)
    
    const telegramLink = screen.getByRole('link', { name: 't.me/chrono_ninja' })
    expect(telegramLink).toHaveAttribute('href', 'https://t.me/chrono_ninja')
    expect(telegramLink).toHaveAttribute('target', '_blank')
    expect(telegramLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render with fixed positioning when fixed prop is true', () => {
    render(<ContactFooter fixed={true} />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveStyle('position: fixed')
    expect(footer).toHaveStyle('bottom: 0')
  })

  it('should render with static positioning by default', () => {
    render(<ContactFooter />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveStyle('position: static')
  })
})




