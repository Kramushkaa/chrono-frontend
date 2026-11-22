import type {
  ContentImportMode,
  ContentImportReport,
} from 'shared/dto/contentBundle'
import { createApiClient } from './client'
import { apiFetch } from './core'

const contentApi = createApiClient()

export type ContentImportPayload = {
  content: string
  mode: ContentImportMode
  dryRun: boolean
}

export type ContentExportFormat = 'yaml' | 'json'

/**
 * Импорт контента. При ошибке валидации бэкенд возвращает 400
 * с телом-отчётом, поэтому читаем payload даже при неуспешном статусе.
 */
export async function importContent(payload: ContentImportPayload): Promise<ContentImportReport> {
  const response = await apiFetch('/api/admin/content-import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = (await response.json().catch(() => null)) as ContentImportReport | null

  if (body && typeof body === 'object' && 'counts' in body && 'entries' in body) {
    return body
  }

  if (!response.ok) {
    throw new Error(`Не удалось выполнить импорт (HTTP ${response.status})`)
  }

  throw new Error('Неожиданный ответ сервера при импорте')
}

export async function downloadListExport(
  listId: number,
  format: ContentExportFormat = 'yaml'
): Promise<void> {
  const response = await apiFetch(
    `/api/admin/content-export?listId=${listId}&format=${format}`
  )

  if (!response.ok) {
    const message = await response
      .json()
      .then((payload: { message?: string }) => payload?.message)
      .catch(() => null)
    throw new Error(message || `Не удалось экспортировать список (HTTP ${response.status})`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `list-${listId}.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export { contentApi }
