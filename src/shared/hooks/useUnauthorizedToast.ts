import { useEffect } from 'react'
import { useToast } from 'shared/context/ToastContext'

export function useUnauthorizedToast() {
  const { showToast } = useToast()

  useEffect(() => {
    const onUnauthorized = () => {
      try { showToast('Сессия истекла. Пожалуйста, войдите снова.', 'error', 5000) } catch {}
    }
    window.addEventListener('auth:unauthorized', onUnauthorized as any)
    return () => {
      window.removeEventListener('auth:unauthorized', onUnauthorized as any)
    }
  }, [showToast])
}


