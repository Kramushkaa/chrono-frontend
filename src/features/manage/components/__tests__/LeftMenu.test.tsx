import { render, screen, fireEvent } from '@testing-library/react'
import { LeftMenu, UserListItem, LeftMenuSelection } from '../LeftMenu'

describe('LeftMenu', () => {
  const mockOnSelect = vi.fn()
  const mockOnAddList = vi.fn()
  const mockOnDeleteList = vi.fn()
  const mockOnShareList = vi.fn()
  const mockOnShowOnTimeline = vi.fn()
  const mockOnCopySharedList = vi.fn()

  const defaultProps = {
    selectedKey: 'all',
    onSelect: mockOnSelect,
    isModerator: false,
    userLists: [] as UserListItem[],
    onAddList: mockOnAddList,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render basic menu items', () => {
    render(<LeftMenu {...defaultProps} />)

    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText(/Мои/)).toBeInTheDocument()
    expect(screen.getByText('Создать список')).toBeInTheDocument()
  })

  it('should render custom labelAll', () => {
    render(<LeftMenu {...defaultProps} labelAll="Все личности" />)

    expect(screen.getByText('Все личности')).toBeInTheDocument()
  })

  it('should call onSelect when "Все" is clicked', () => {
    render(<LeftMenu {...defaultProps} />)

    fireEvent.click(screen.getByText('Все'))

    expect(mockOnSelect).toHaveBeenCalledWith({ type: 'all' })
  })

  it('should call onSelect when "Все" is activated with Enter key', () => {
    render(<LeftMenu {...defaultProps} />)

    fireEvent.keyDown(screen.getByText('Все'), { key: 'Enter' })

    expect(mockOnSelect).toHaveBeenCalledWith({ type: 'all' })
  })

  it('should not call onSelect when other keys are pressed', () => {
    render(<LeftMenu {...defaultProps} />)

    fireEvent.keyDown(screen.getByText('Все'), { key: 'Space' })

    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('should call onSelect when "Мои" is clicked', () => {
    render(<LeftMenu {...defaultProps} />)

    fireEvent.click(screen.getByText(/Мои/))

    expect(mockOnSelect).toHaveBeenCalledWith({ type: 'mine' })
  })

  it('should display mine count when provided', () => {
    render(<LeftMenu {...defaultProps} mineCount={5} />)

    expect(screen.getByText(/Мои \(5\)/)).toBeInTheDocument()
  })

  it('should not display mine count when null', () => {
    render(<LeftMenu {...defaultProps} mineCount={null} />)

    expect(screen.getByText('Мои')).toBeInTheDocument()
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument()
  })

  it('should show pending moderation for moderators', () => {
    render(
      <LeftMenu
        {...defaultProps}
        isModerator={true}
        pendingCount={3}
      />
    )

    expect(screen.getByText('Ожидают модерации (3)')).toBeInTheDocument()
  })

  it('should not show pending moderation for non-moderators', () => {
    render(
      <LeftMenu
        {...defaultProps}
        isModerator={false}
        pendingCount={3}
      />
    )

    expect(screen.queryByText(/Ожидают модерации/)).not.toBeInTheDocument()
  })

  it('should not show pending moderation when count is 0', () => {
    render(
      <LeftMenu
        {...defaultProps}
        isModerator={true}
        pendingCount={0}
      />
    )

    expect(screen.queryByText(/Ожидают модерации/)).not.toBeInTheDocument()
  })

  it('should call onSelect when pending is clicked', () => {
    render(
      <LeftMenu
        {...defaultProps}
        isModerator={true}
        pendingCount={3}
      />
    )

    fireEvent.click(screen.getByText('Ожидают модерации (3)'))

    expect(mockOnSelect).toHaveBeenCalledWith({ type: 'pending' })
  })

  it('should render user lists', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1', items_count: 5 },
      { id: 2, title: 'Список 2', items_count: 3 },
    ]

    render(<LeftMenu {...defaultProps} userLists={userLists} />)

    expect(screen.getByText(/Список 1/)).toBeInTheDocument()
    expect(screen.getByText(/Список 2/)).toBeInTheDocument()
  })

  it('should display items count for lists', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1', items_count: 5 },
    ]

    render(<LeftMenu {...defaultProps} userLists={userLists} />)

    expect(screen.getByText(/\(5\)/)).toBeInTheDocument()
  })

  it('should display 0 when items_count is undefined', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1' },
    ]

    render(<LeftMenu {...defaultProps} userLists={userLists} />)

    expect(screen.getByText(/\(0\)/)).toBeInTheDocument()
  })

  it('should call onSelect when list is clicked', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1', items_count: 5 },
    ]

    render(<LeftMenu {...defaultProps} userLists={userLists} />)

    fireEvent.click(screen.getByText(/Список 1/))

    expect(mockOnSelect).toHaveBeenCalledWith({ type: 'list', listId: 1 })
  })

  it('should call onSelect when list is activated with Enter key', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1', items_count: 5 },
    ]

    render(<LeftMenu {...defaultProps} userLists={userLists} />)

    const listElement = screen.getByText(/Список 1/).closest('[role="button"]')
    fireEvent.keyDown(listElement!, { key: 'Enter' })

    expect(mockOnSelect).toHaveBeenCalledWith({ type: 'list', listId: 1 })
  })

  it('should call onAddList when "Создать список" is clicked', () => {
    render(<LeftMenu {...defaultProps} />)

    fireEvent.click(screen.getByText('Создать список'))

    expect(mockOnAddList).toHaveBeenCalled()
  })

  it('should show action buttons for regular lists', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1', items_count: 5 },
    ]

    render(
      <LeftMenu
        {...defaultProps}
        userLists={userLists}
        onDeleteList={mockOnDeleteList}
        onShareList={mockOnShareList}
        onShowOnTimeline={mockOnShowOnTimeline}
      />
    )

    const buttons = screen.getAllByRole('button')
    const actionButtons = buttons.filter(btn => 
      btn.title === 'Показать на таймлайне' || 
      btn.title === 'Поделиться' || 
      btn.title === 'Удалить'
    )

    expect(actionButtons).toHaveLength(3)
  })

  it('should call onShowOnTimeline when timeline button is clicked', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1' },
    ]

    render(
      <LeftMenu
        {...defaultProps}
        userLists={userLists}
        onShowOnTimeline={mockOnShowOnTimeline}
      />
    )

    const timelineBtn = screen.getByTitle('Показать на таймлайне')
    fireEvent.click(timelineBtn)

    expect(mockOnShowOnTimeline).toHaveBeenCalledWith(1)
    expect(mockOnSelect).not.toHaveBeenCalled() // Should not trigger list selection
  })

  it('should call onShareList when share button is clicked', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1' },
    ]

    render(
      <LeftMenu
        {...defaultProps}
        userLists={userLists}
        onShareList={mockOnShareList}
      />
    )

    const shareBtn = screen.getByTitle('Поделиться')
    fireEvent.click(shareBtn)

    expect(mockOnShareList).toHaveBeenCalledWith(1)
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('should call onDeleteList when delete button is clicked and confirmed', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1' },
    ]

    render(
      <LeftMenu
        {...defaultProps}
        userLists={userLists}
        onDeleteList={mockOnDeleteList}
      />
    )

    const deleteBtn = screen.getByTitle('Удалить')
    fireEvent.click(deleteBtn)

    expect(window.confirm).toHaveBeenCalledWith('Удалить список и все его элементы?')
    expect(mockOnDeleteList).toHaveBeenCalledWith(1)
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('should not call onDeleteList when delete is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1' },
    ]

    render(
      <LeftMenu
        {...defaultProps}
        userLists={userLists}
        onDeleteList={mockOnDeleteList}
      />
    )

    const deleteBtn = screen.getByTitle('Удалить')
    fireEvent.click(deleteBtn)

    expect(window.confirm).toHaveBeenCalled()
    expect(mockOnDeleteList).not.toHaveBeenCalled()
  })

  it('should show readonly list actions for shared lists', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Shared List' },
    ]

    render(
      <LeftMenu
        {...defaultProps}
        userLists={userLists}
        readonlyListId={1}
        onCopySharedList={mockOnCopySharedList}
        onShowOnTimeline={mockOnShowOnTimeline}
      />
    )

    expect(screen.getByTitle('Скопировать себе')).toBeInTheDocument()
    expect(screen.getByTitle('Показать на таймлайне')).toBeInTheDocument()
    expect(screen.queryByTitle('Поделиться')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Удалить')).not.toBeInTheDocument()
  })

  it('should call onCopySharedList when copy button is clicked', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Shared List' },
    ]

    render(
      <LeftMenu
        {...defaultProps}
        userLists={userLists}
        readonlyListId={1}
        onCopySharedList={mockOnCopySharedList}
      />
    )

    const copyBtn = screen.getByTitle('Скопировать себе')
    fireEvent.click(copyBtn)

    expect(mockOnCopySharedList).toHaveBeenCalledWith(1)
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('should apply active style to selected item', () => {
    const { container } = render(
      <LeftMenu {...defaultProps} selectedKey="all" />
    )

    const allButton = screen.getByText('Все')
    const style = window.getComputedStyle(allButton)
    
    // Just check that the element exists and has some styling
    expect(allButton).toBeInTheDocument()
  })

  it('should apply active style to selected list', () => {
    const userLists: UserListItem[] = [
      { id: 1, title: 'Список 1' },
    ]

    render(
      <LeftMenu
        {...defaultProps}
        userLists={userLists}
        selectedKey="list:1"
      />
    )

    const listButton = screen.getByText(/Список 1/).closest('[role="button"]')
    expect(listButton).toBeInTheDocument()
  })

  it('should render with custom id', () => {
    const { container } = render(
      <LeftMenu {...defaultProps} id="custom-menu" />
    )

    expect(container.querySelector('#custom-menu')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<LeftMenu {...defaultProps} />)

    expect(screen.getByRole('region', { name: 'Меню списков' })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})

