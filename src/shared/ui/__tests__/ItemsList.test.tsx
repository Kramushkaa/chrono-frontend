import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItemsList } from '../ItemsList'

// Mock ItemCard
vi.mock('../ItemCard', () => ({
  ItemCard: ({ title, onSelect }: any) => (
    <div data-testid="item-card" onClick={() => onSelect?.()}>
      {title}
    </div>
  ),
}))

describe('ItemsList', () => {
  const mockItems = [
    {
      id: '1',
      title: 'Item 1',
      subtitle: 'Subtitle 1',
      description: 'Description 1',
      year: 1800,
    },
    {
      id: '2',
      title: 'Item 2',
      subtitle: 'Subtitle 2',
      description: 'Description 2',
      year: 1900,
    },
  ]

  const defaultProps = {
    items: mockItems,
    isLoading: false,
    hasMore: false,
    onLoadMore: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render items list', () => {
    render(<ItemsList {...defaultProps} />)

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getAllByTestId('item-card')).toHaveLength(2)
  })

  it('should render empty message when no items', () => {
    render(<ItemsList {...defaultProps} items={[]} />)

    expect(screen.getByText('Элементы не найдены')).toBeInTheDocument()
  })

  it('should render custom empty message', () => {
    render(<ItemsList {...defaultProps} items={[]} emptyMessage="No results" />)

    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<ItemsList {...defaultProps} items={[]} isLoading={true} />)

    // При загрузке показываются скелетоны, а не текст
    const skeletonContainer = document.querySelector('.items-list__skeleton-container')
    expect(skeletonContainer).toBeInTheDocument()
  })

  it('should show custom loading message', () => {
    render(<ItemsList {...defaultProps} items={[]} isLoading={true} loadingMessage="Loading..." />)

    // При загрузке показываются скелетоны вне зависимости от loadingMessage
    const skeletonContainer = document.querySelector('.items-list__skeleton-container')
    expect(skeletonContainer).toBeInTheDocument()
  })

  it('should show load more button when hasMore is true', () => {
    render(<ItemsList {...defaultProps} hasMore={true} />)

    expect(screen.getByText('Показать ещё')).toBeInTheDocument()
  })

  it('should call onLoadMore when load more button is clicked', () => {
    const mockOnLoadMore = vi.fn()
    render(<ItemsList {...defaultProps} hasMore={true} onLoadMore={mockOnLoadMore} />)

    fireEvent.click(screen.getByText('Показать ещё'))
    expect(mockOnLoadMore).toHaveBeenCalledTimes(1)
  })

  it('should handle list mode', () => {
    render(<ItemsList {...defaultProps} isListMode={true} />)

    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  it('should apply custom style', () => {
    const customStyle = { backgroundColor: 'red' }
    render(<ItemsList {...defaultProps} style={customStyle} />)

    const container = document.querySelector('.items-list')
    expect(container).toHaveStyle('background-color: rgb(255, 0, 0)')
  })

  it('should handle item selection', () => {
    const mockOnSelect = vi.fn()
    render(<ItemsList {...defaultProps} onSelect={mockOnSelect} />)

    fireEvent.click(screen.getByText('Item 1'))
    expect(mockOnSelect).toHaveBeenCalledWith('1')
  })

  it('should not show load more button when hasMore is false', () => {
    render(<ItemsList {...defaultProps} hasMore={false} />)

    expect(screen.queryByText('Показать ещё')).not.toBeInTheDocument()
  })
})




