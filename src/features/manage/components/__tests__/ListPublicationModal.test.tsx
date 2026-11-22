import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListPublicationModal } from '../ListPublicationModal'
import type { UserList } from 'shared/types'

vi.mock('shared/api/lists', () => ({
  requestListPublication: vi.fn(),
  updateList: vi.fn(),
}))

import { requestListPublication, updateList } from 'shared/api/lists'
const mockedRequest = vi.mocked(requestListPublication)
const mockedUpdate = vi.mocked(updateList)

function createBaseList(): UserList {
  return {
    id: 42,
    owner_user_id: 7,
    title: 'Испытательный список',
    created_at: '',
    updated_at: '',
    moderation_status: 'draft',
    public_description: '',
    moderation_requested_at: null,
    published_at: null,
    moderated_by: null,
    moderated_at: null,
    moderation_comment: null,
    public_slug: null,
    items_count: 3,
    persons_count: 2,
    achievements_count: 1,
    periods_count: 0,
  }
}

describe('ListPublicationModal', () => {
  beforeEach(() => {
    mockedRequest.mockReset().mockImplementation(async (listId: number) => ({
      ...createBaseList(),
      id: listId,
      moderation_status: 'pending',
      moderation_requested_at: '2025-11-08T10:00:00Z',
    }))
    mockedUpdate.mockReset().mockImplementation(async (listId: number, payload: any) => ({
      ...createBaseList(),
      id: listId,
      public_description: payload.public_description || '',
    }))
  })

  it('renders modal when open with submit button for draft list owned by user', () => {
    render(
      <ListPublicationModal
        isOpen={true}
        onClose={vi.fn()}
        list={createBaseList()}
        isOwner
        showToast={vi.fn()}
      />
    )

    expect(screen.getByText('Публикация списка')).toBeInTheDocument()
    expect(screen.getByText('Испытательный список')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /отправить на модерацию/i })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ListPublicationModal
        isOpen={false}
        onClose={vi.fn()}
        list={createBaseList()}
        isOwner
        showToast={vi.fn()}
      />
    )

    expect(screen.queryByText('Публикация списка')).not.toBeInTheDocument()
  })

  it('disables submission for non-owner', () => {
    render(
      <ListPublicationModal
        isOpen={true}
        onClose={vi.fn()}
        list={createBaseList()}
        isOwner={false}
        showToast={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /отправить/i })).not.toBeInTheDocument()
    expect(screen.getByText(/только владелец/i)).toBeInTheDocument()
  })

  it('shows copy link input when list is published', () => {
    const list: UserList = {
      ...createBaseList(),
      moderation_status: 'published',
      published_at: '2025-11-08T10:00:00Z',
      public_slug: 'ispytatelnyj-spisok',
    }

    render(
      <ListPublicationModal
        isOpen={true}
        onClose={vi.fn()}
        list={list}
        isOwner
        showToast={vi.fn()}
      />
    )

    expect(screen.getByDisplayValue(/lists\/public\/ispytatelnyj-spisok/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /скопировать/i })).toBeInTheDocument()
  })

  it('calls submission handler and closes modal when owner clicks', async () => {
    const onClose = vi.fn()
    const showToast = vi.fn()

    render(
      <ListPublicationModal
        isOpen={true}
        onClose={onClose}
        list={createBaseList()}
        isOwner
        showToast={showToast}
        onUpdated={vi.fn()}
        onReload={vi.fn()}
      />
    )

    const button = screen.getByRole('button', { name: /отправить на модерацию/i })
    fireEvent.click(button)

    await waitFor(() => expect(mockedRequest).toHaveBeenCalled())
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(showToast).toHaveBeenCalledWith('Заявка на публикацию отправлена', 'success')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()

    render(
      <ListPublicationModal
        isOpen={true}
        onClose={onClose}
        list={createBaseList()}
        isOwner
        showToast={vi.fn()}
      />
    )

    const closeButton = screen.getAllByRole('button').find(btn => btn.textContent === '✕')
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('shows save draft button for owner with non-published list', () => {
    render(
      <ListPublicationModal
        isOpen={true}
        onClose={vi.fn()}
        list={createBaseList()}
        isOwner
        showToast={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /сохранить черновик/i })).toBeInTheDocument()
  })

  it('does not show save draft button for published list', () => {
    const list: UserList = {
      ...createBaseList(),
      moderation_status: 'published',
      published_at: '2025-11-08T10:00:00Z',
    }

    render(
      <ListPublicationModal
        isOpen={true}
        onClose={vi.fn()}
        list={list}
        isOwner
        showToast={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /сохранить черновик/i })).not.toBeInTheDocument()
  })

  it('calls updateList when save draft button is clicked', async () => {
    const showToast = vi.fn()
    const onUpdated = vi.fn()
    const onReload = vi.fn()

    render(
      <ListPublicationModal
        isOpen={true}
        onClose={vi.fn()}
        list={createBaseList()}
        isOwner
        showToast={showToast}
        onUpdated={onUpdated}
        onReload={onReload}
      />
    )

    const textarea = screen.getByPlaceholderText(/расскажите/i)
    fireEvent.change(textarea, { target: { value: 'Новое описание для списка' } })

    const saveDraftButton = screen.getByRole('button', { name: /сохранить черновик/i })
    fireEvent.click(saveDraftButton)

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledWith(42, { public_description: 'Новое описание для списка' }))
    expect(showToast).toHaveBeenCalledWith('Описание сохранено', 'success')
  })
})

