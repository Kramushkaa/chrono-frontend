import { useEffect } from 'react'
import { getDtoVersion } from 'shared/api/api'

export function useDtoVersionWarning(expectedVersion: string) {
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const v = await getDtoVersion()
        if (!cancelled && v && v !== expectedVersion) {
          if (import.meta.env.MODE !== 'production') {
            // eslint-disable-next-line no-console
            console.warn(`⚠️ DTO Version Mismatch: Frontend=${expectedVersion}, Backend=${v}. Please update versions to avoid data inconsistencies.`)
          }
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [expectedVersion])
}





