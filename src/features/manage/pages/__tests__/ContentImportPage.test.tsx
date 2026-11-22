import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentImportPage from '../ContentImportPage';
import { useAuth } from 'shared/context/AuthContext';
import { importContent } from 'shared/api/content';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock('shared/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const showToast = vi.fn();
vi.mock('shared/context/ToastContext', () => ({
  useToast: () => ({ showToast }),
}));

vi.mock('shared/api/content', () => ({
  importContent: vi.fn(),
}));

vi.mock('shared/ui/SEO', () => ({
  SEO: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>,
}));

const report = {
  ok: true,
  dryRun: true,
  mode: 'create-only' as const,
  version: 1,
  counts: { created: 2, updated: 0, skipped: 1, errors: 0 },
  entries: [
    { collection: 'persons' as const, key: 'pushkin', id: 'pushkin', action: 'created' as const },
    {
      collection: 'achievements' as const,
      key: 'a1',
      action: 'skipped' as const,
      message: 'Такая запись уже существует',
    },
  ],
};

const renderPage = () =>
  render(
    <ContentImportPage />
  );

const selectFile = (container: HTMLElement, file: File) => {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
};

/** jsdom не реализует File.text(), поэтому подставляем реализацию вручную. */
const makeFile = (content: string, name = 'content.yaml') => {
  const file = new File([content], name);
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(content) });
  return file;
};

describe('ContentImportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { id: 1, role: 'moderator' },
      isAuthenticated: true,
    });
  });

  it('denies access to regular users', () => {
    (useAuth as any).mockReturnValue({
      user: { id: 1, role: 'user' },
      isAuthenticated: true,
    });

    renderPage();

    expect(
      screen.getByText('Раздел доступен только администраторам и модераторам.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Выбрать файл')).not.toBeInTheDocument();
  });

  it('renders import controls for moderators', () => {
    renderPage();

    expect(screen.getByText('Выбрать файл')).toBeInTheDocument();
    expect(screen.getByText('Проверить (dry-run)')).toBeInTheDocument();
    expect(screen.getByText('Применить импорт')).toBeInTheDocument();
  });

  it('shows an error for files larger than 2 MB', () => {
    const { container } = renderPage();
    const bigFile = new File(['x'.repeat(2 * 1024 * 1024 + 1)], 'big.yaml');

    selectFile(container, bigFile);

    expect(screen.getByText('Файл больше 2 МБ')).toBeInTheDocument();
  });

  it('reads a selected file and enables dry-run', async () => {
    const { container } = renderPage();
    const file = makeFile('version: 1\npersons: []');

    selectFile(container, file);

    expect(await screen.findByText('content.yaml')).toBeInTheDocument();
    expect(screen.getByText('Проверить (dry-run)')).not.toBeDisabled();
  });

  it('runs dry-run and renders the per-key report', async () => {
    (importContent as any).mockResolvedValue(report);

    const { container } = renderPage();
    selectFile(container, makeFile('version: 1'));

    await waitFor(() =>
      expect(screen.getByText('Проверить (dry-run)')).not.toBeDisabled()
    );
    fireEvent.click(screen.getByText('Проверить (dry-run)'));

    await waitFor(() =>
      expect(importContent).toHaveBeenCalledWith({
        content: 'version: 1',
        mode: 'create-only',
        dryRun: true,
      })
    );

    expect(await screen.findByText('Результат проверки')).toBeInTheDocument();
    expect(screen.getAllByText('pushkin').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Такая запись уже существует')).toBeInTheDocument();
    expect(screen.getByText('создано: 2')).toBeInTheDocument();
    expect(screen.getByText('пропущено: 1')).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith('Проверка прошла успешно', 'success');
  });

  it('uses upsert mode when selected', async () => {
    (importContent as any).mockResolvedValue({ ...report, mode: 'upsert' });

    const { container } = renderPage();
    selectFile(container, makeFile('version: 1'));

    fireEvent.click(screen.getByLabelText('Обновлять существующие (upsert)'));
    await waitFor(() =>
      expect(screen.getByText('Проверить (dry-run)')).not.toBeDisabled()
    );
    fireEvent.click(screen.getByText('Проверить (dry-run)'));

    await waitFor(() =>
      expect(importContent).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'upsert' })
      )
    );
  });

  it('keeps apply disabled until a dry-run report exists', async () => {
    const { container } = renderPage();
    selectFile(container, makeFile('version: 1'));

    await waitFor(() =>
      expect(screen.getByText('Проверить (dry-run)')).not.toBeDisabled()
    );

    expect(screen.getByRole('button', { name: 'Применить импорт' })).toBeDisabled();
  });

  it('blocks apply when the report has errors', async () => {
    (importContent as any).mockResolvedValue({
      ...report,
      ok: false,
      counts: { created: 0, updated: 0, skipped: 0, errors: 1 },
      entries: [
        {
          collection: 'persons',
          key: 'persons.0.name',
          action: 'error',
          message: 'Слишком короткое имя',
        },
      ],
    });

    const { container } = renderPage();
    selectFile(container, makeFile('version: 1'));

    await waitFor(() =>
      expect(screen.getByText('Проверить (dry-run)')).not.toBeDisabled()
    );
    fireEvent.click(screen.getByText('Проверить (dry-run)'));

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Проверка нашла ошибки', 'error'));
    expect(screen.getByRole('button', { name: 'Применить импорт' })).toBeDisabled();
  });

  it('applies the import after confirmation', async () => {
    (importContent as any)
      .mockResolvedValueOnce(report)
      .mockResolvedValueOnce({ ...report, dryRun: false });

    const { container } = renderPage();
    selectFile(container, makeFile('version: 1'));

    await waitFor(() =>
      expect(screen.getByText('Проверить (dry-run)')).not.toBeDisabled()
    );
    fireEvent.click(screen.getByText('Проверить (dry-run)'));
    await waitFor(() => expect(screen.getByText('Результат проверки')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Применить импорт'));
    fireEvent.click(screen.getByText('Применить'));

    await waitFor(() =>
      expect(importContent).toHaveBeenLastCalledWith(
        expect.objectContaining({ dryRun: false })
      )
    );
    expect(showToast).toHaveBeenCalledWith('Импорт применён', 'success');
  });

  it('shows an error when the request fails', async () => {
    (importContent as any).mockRejectedValue(new Error('Сервер недоступен'));

    const { container } = renderPage();
    selectFile(container, makeFile('version: 1'));

    await waitFor(() =>
      expect(screen.getByText('Проверить (dry-run)')).not.toBeDisabled()
    );
    fireEvent.click(screen.getByText('Проверить (dry-run)'));

    expect(await screen.findByText('Сервер недоступен')).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith('Сервер недоступен', 'error');
  });
});
