import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PublicListDetailPage from '../PublicListDetailPage';
import { getPublicListDetail } from 'shared/api/lists';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useParams: () => ({ slug: 'my-list' }),
}));

vi.mock('shared/api/lists', () => ({
  getPublicListDetail: vi.fn(),
}));

vi.mock('shared/ui/SEO', () => ({
  SEO: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>,
}));

const listDetail = {
  id: 1,
  title: 'Публичный список',
  public_description: 'Описание',
  public_slug: 'my-list',
  published_at: '2026-01-01T00:00:00.000Z',
  owner_user_id: 1,
  owner_display_name: 'Иван',
  items_count: 3,
  persons_count: 1,
  achievements_count: 1,
  periods_count: 1,
  items: [
    {
      list_item_id: 1,
      type: 'person' as const,
      person_id: 'pushkin',
      name: 'Александр Пушкин',
      birth_year: 1799,
      death_year: 1837,
      category: 'Поэт',
    },
    {
      list_item_id: 2,
      type: 'achievement' as const,
      achievement_id: 11,
      description: 'Публикация поэмы',
      year: 1820,
      person_id: null,
      show_as_global: true,
    },
    {
      list_item_id: 3,
      type: 'period' as const,
      period_id: 22,
      start_year: 1812,
      end_year: 1815,
      period_type: 'war',
      person_id: null,
      show_as_global: true,
    },
  ],
};

describe('PublicListDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks items shown as global in the list', async () => {
    (getPublicListDetail as any).mockResolvedValue(listDetail);

    render(<PublicListDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('Публикация поэмы')).toBeInTheDocument()
    );

    expect(screen.getByText('Глобальное')).toBeInTheDocument();
    expect(screen.getByText('Глобальный период')).toBeInTheDocument();
    expect(screen.queryByText(/Личность: person-1/)).not.toBeInTheDocument();
    expect(screen.getByText('Александр Пушкин')).toBeInTheDocument();
  });

  it('does not show global badges for regular items', async () => {
    (getPublicListDetail as any).mockResolvedValue({
      ...listDetail,
      items: [
        {
          list_item_id: 2,
          type: 'achievement',
          achievement_id: 11,
          description: 'Обычное достижение',
          year: 1820,
          person_id: 'pushkin',
          show_as_global: false,
        },
      ],
    });

    render(<PublicListDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('Обычное достижение')).toBeInTheDocument()
    );

    expect(screen.queryByText('Глобальное')).not.toBeInTheDocument();
    expect(screen.getByText(/Личность: pushkin/)).toBeInTheDocument();
  });

  it('shows a load error', async () => {
    (getPublicListDetail as any).mockRejectedValue(new Error('Список не найден'));

    render(<PublicListDetailPage />);

    expect(await screen.findByText('Список не найден')).toBeInTheDocument();
  });
});
