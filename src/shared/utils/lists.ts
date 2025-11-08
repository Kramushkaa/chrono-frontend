import { apiFetch } from 'shared/api/core'
import { createListShareCode } from 'shared/api/lists'

export async function deleteListItem(selectedListId: number, listItemId: number): Promise<boolean> {
	try {
		const res = await apiFetch(`/api/lists/${selectedListId}/items/${listItemId}`, { method: 'DELETE' })
		return res.ok
	} catch {
		return false
	}
}

export async function copySharedListFromUrl(shareTitleFallback: string): Promise<{ id: number | null; title: string } | null> {
	try {
		const code = (new URLSearchParams(window.location.search)).get('share') || ''
		if (!code) return null
		const title = shareTitleFallback || 'Импортированный список'
		const res = await apiFetch(`/api/lists/copy-from-share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, title }) })
		if (!res.ok) return null
		const data = await res.json().catch(() => null) as { data?: { id?: number; title?: string } } | null
		const newId = Number(data?.data?.id)
		const newTitle = String(data?.data?.title || title)
		return { id: Number.isFinite(newId) ? newId : null, title: newTitle }
	} catch {
		return null
	}
}

export async function createAndCopyShareLink(listId: number, showToast?: (m: string, t?: 'success' | 'error' | 'info') => void): Promise<boolean> {
  try {
    const code = await createListShareCode(listId)
    if (!code) { showToast?.('Не удалось создать ссылку', 'error'); return false }
    const url = `${window.location.origin}/lists?share=${encodeURIComponent(code)}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      showToast?.('Ссылка скопирована', 'success')
    } else {
      // Fallback for browsers without clipboard API
      showToast?.(`Ссылка: ${url}`, 'info')
    }
    return true
  } catch {
    showToast?.('Не удалось создать ссылку', 'error')
    return false
  }
}

export async function openListOnTimeline(listId: number, sharedListId?: number | null, showToast?: (m: string, t?: 'success' | 'error' | 'info') => void): Promise<void> {
  const usp = new URLSearchParams(window.location.search)
  const shareCode = usp.get('share')
  if (sharedListId && sharedListId === listId && shareCode) {
    window.location.href = `/timeline?share=${encodeURIComponent(shareCode)}`
    return
  }
  try {
    const code = await createListShareCode(listId)
    if (!code) throw new Error('no_code')
    window.location.href = `/timeline?share=${encodeURIComponent(code)}`
  } catch {
    showToast?.('Не удалось открыть на таймлайне', 'error')
  }
}





