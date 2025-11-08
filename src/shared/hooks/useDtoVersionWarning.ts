import { useEffect } from 'react'
import { getDtoVersion } from 'shared/api/meta'
import { logger } from 'shared/utils/logger'

export function useDtoVersionWarning(expectedVersion: string) {
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const v = await getDtoVersion()
        if (!cancelled && v && v !== expectedVersion) {
          logger.warn('DTO Version Mismatch', {
            frontend: expectedVersion,
            backend: v,
            action: 'dto_version_check',
          })
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [expectedVersion])
}





