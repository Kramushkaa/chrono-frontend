import React from 'react'
import { render, screen } from '@testing-library/react'
import Skeleton from '../Skeleton'

// Mock CSS import
vi.mock('../Skeleton.css', () => ({}))

describe('Skeleton', () => {
  it('should render with default props', () => {
    const { container } = render(<Skeleton />)

    const skeleton = container.querySelector('.skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('skeleton--text')
    expect(skeleton).not.toHaveClass('skeleton--slow')
    expect(skeleton).not.toHaveClass('skeleton--fast')
  })

  it('should apply variant classes correctly', () => {
    const { rerender, container } = render(<Skeleton variant="text" />)
    let skeleton = container.querySelector('.skeleton')
    expect(skeleton).toHaveClass('skeleton--text')

    rerender(<Skeleton variant="circle" />)
    skeleton = container.querySelector('.skeleton')
    expect(skeleton).toHaveClass('skeleton--circle')

    rerender(<Skeleton variant="rectangle" />)
    skeleton = container.querySelector('.skeleton')
    expect(skeleton).toHaveClass('skeleton--rectangle')
  })

  it('should apply speed classes correctly', () => {
    const { rerender, container } = render(<Skeleton speed="normal" />)
    let skeleton = container.querySelector('.skeleton')
    expect(skeleton).not.toHaveClass('skeleton--slow')
    expect(skeleton).not.toHaveClass('skeleton--fast')

    rerender(<Skeleton speed="slow" />)
    skeleton = container.querySelector('.skeleton')
    expect(skeleton).toHaveClass('skeleton--slow')

    rerender(<Skeleton speed="fast" />)
    skeleton = container.querySelector('.skeleton')
    expect(skeleton).toHaveClass('skeleton--fast')
  })

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />)

    const skeleton = container.querySelector('.skeleton')
    expect(skeleton).toHaveClass('custom-skeleton')
  })

  it('should apply custom height and width', () => {
    const { container } = render(<Skeleton height={100} width={200} />)

    const skeleton = container.querySelector('.skeleton') as HTMLElement
    expect(skeleton).toHaveStyle({ height: '100px', width: '200px' })
  })

  it('should apply custom height and width as strings', () => {
    const { container } = render(<Skeleton height="50%" width="75%" />)

    const skeleton = container.querySelector('.skeleton') as HTMLElement
    expect(skeleton).toHaveStyle({ height: '50%', width: '75%' })
  })

  it('should use default dimensions for text variant', () => {
    const { container } = render(<Skeleton variant="text" />)

    const skeleton = container.querySelector('.skeleton') as HTMLElement
    expect(skeleton).toHaveStyle({ height: '16px', width: '100%' })
  })

  it('should use default dimensions for circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />)

    const skeleton = container.querySelector('.skeleton') as HTMLElement
    expect(skeleton).toHaveStyle({ height: '40px', width: '40px' })
  })

  it('should use default dimensions for rectangle variant', () => {
    const { container } = render(<Skeleton variant="rectangle" />)

    const skeleton = container.querySelector('.skeleton') as HTMLElement
    expect(skeleton).toHaveStyle({ height: '120px', width: '100%' })
  })

  it('should render single line for text variant when lines is 1', () => {
    const { container } = render(<Skeleton variant="text" lines={1} />)

    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons).toHaveLength(1)
    expect(container.querySelector('.skeleton-container')).not.toBeInTheDocument()
  })

  it('should render multiple lines for text variant when lines > 1', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />)

    const containerEl = container.querySelector('.skeleton-container')
    expect(containerEl).toBeInTheDocument()

    const skeletons = containerEl?.querySelectorAll('.skeleton')
    expect(skeletons).toHaveLength(3)
  })

  it('should apply correct styles to multiple lines', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />)

    const skeletons = container.querySelectorAll('.skeleton') as NodeListOf<HTMLElement>
    expect(skeletons).toHaveLength(3)

    // First two lines should be 100% width with margin-bottom
    expect(skeletons[0]).toHaveStyle({ width: '100%', marginBottom: '8px' })
    expect(skeletons[1]).toHaveStyle({ width: '100%', marginBottom: '8px' })

    // Last line should be 60% width without margin-bottom
    expect(skeletons[2]).toHaveStyle({ width: '60%', marginBottom: '0px' })
  })

  it('should not render multiple lines for non-text variants', () => {
    const { container } = render(<Skeleton variant="circle" lines={3} />)

    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons).toHaveLength(1)
    expect(container.querySelector('.skeleton-container')).not.toBeInTheDocument()
  })

  it('should combine all classes correctly', () => {
    const { container } = render(
      <Skeleton variant="rectangle" speed="fast" className="custom-class" />
    )

    const skeleton = container.querySelector('.skeleton')
    expect(skeleton).toHaveClass('skeleton')
    expect(skeleton).toHaveClass('skeleton--rectangle')
    expect(skeleton).toHaveClass('skeleton--fast')
    expect(skeleton).toHaveClass('custom-class')
  })

  it('should override default dimensions with custom height/width', () => {
    const { container } = render(
      <Skeleton variant="circle" height={50} width={50} />
    )

    const skeleton = container.querySelector('.skeleton') as HTMLElement
    expect(skeleton).toHaveStyle({ height: '50px', width: '50px' })
  })
})

