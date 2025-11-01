import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterDropdown } from '../FilterDropdown'

// Mock hooks
const mockHandleClick = vi.fn()
const mockHandleKeyDown = vi.fn()
const mockHandleMouseEnter = vi.fn()
const mockHandleMouseLeave = vi.fn()

vi.mock('../../hooks/useMobile', () => ({
  useMobile: () => false,
}))

vi.mock('../../hooks/useFilterDropdownPosition', () => ({
  useFilterDropdownPosition: () => ({
    dropdownPosition: { top: 0, left: 0 },
    horizontalPosition: 'left',
    getMobilePopupPosition: () => ({ top: '', left: '', transform: '' }),
  }),
}))

vi.mock('../../hooks/useFilterDropdownState', () => ({
  useFilterDropdownState: vi.fn(() => ({
    isOpen: false,
    setIsOpen: vi.fn(),
    activeIndex: -1,
    setActiveIndex: vi.fn(),
    portalContainer: null,
    handleMouseEnter: mockHandleMouseEnter,
    handleMouseLeave: mockHandleMouseLeave,
    handleClick: mockHandleClick,
    handleButtonKeyDown: mockHandleKeyDown,
    handleContentMouseEnter: vi.fn(),
    handleContentMouseLeave: vi.fn(),
  })),
}))

// Mock FilterDropdownContent
vi.mock('../FilterDropdownContent', () => ({
  FilterDropdownContent: ({ title }: { title: string }) => <div data-testid="dropdown-content">{title}</div>,
}))

describe('FilterDropdown', () => {
  const defaultProps = {
    title: 'Test Filter',
    items: ['Item 1', 'Item 2', 'Item 3'],
    selectedItems: [],
    onSelectionChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockHandleClick.mockClear()
    mockHandleKeyDown.mockClear()
    mockHandleMouseEnter.mockClear()
    mockHandleMouseLeave.mockClear()
  })

  it('should render with basic props', () => {
    render(<FilterDropdown {...defaultProps} />)
    
    expect(screen.getByText('Test Filter')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show active state when items are selected', () => {
    const { rerender } = render(<FilterDropdown {...defaultProps} selectedItems={[]} />)
    let button = screen.getByRole('button')
    expect(button).not.toHaveClass('active')

    rerender(<FilterDropdown {...defaultProps} selectedItems={['Item 1']} />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('active')
  })

  it('should not show active state when no items are selected', () => {
    render(<FilterDropdown {...defaultProps} selectedItems={[]} />)
    
    const button = screen.getByRole('button')
    expect(button).not.toHaveClass('active')
  })

  it('should render icon when provided', () => {
    const icon = <span data-testid="test-icon">🔍</span>
    render(<FilterDropdown {...defaultProps} icon={icon} />)
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('should render text label when provided', () => {
    render(<FilterDropdown {...defaultProps} textLabel="Custom Label" />)
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument()
  })

  it('should handle button click', () => {
    render(<FilterDropdown {...defaultProps} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockHandleClick).toHaveBeenCalledTimes(1)
  })

  it('should handle keyboard events', () => {
    render(<FilterDropdown {...defaultProps} />)
    
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(mockHandleKeyDown).toHaveBeenCalledTimes(1)
  })

  it('should handle mouse events', () => {
    render(<FilterDropdown {...defaultProps} />)
    
    const container = screen.getByRole('button').closest('div')
    fireEvent.mouseEnter(container!)
    fireEvent.mouseLeave(container!)
    
    expect(mockHandleMouseEnter).toHaveBeenCalledTimes(1)
    expect(mockHandleMouseLeave).toHaveBeenCalledTimes(1)
  })
})




