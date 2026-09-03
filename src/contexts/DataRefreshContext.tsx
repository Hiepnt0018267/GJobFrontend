import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DATA_REFRESH_EVENT } from '../utils/dataRefresh'
import { DataRefreshContext } from './dataRefreshState'

const FOCUS_REFRESH_DEDUPLICATION_MS = 250

export function DataRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshVersion, setRefreshVersion] = useState(0)
  const lastFocusRefreshAt = useRef(0)

  useEffect(() => {
    const refresh = () => setRefreshVersion((version) => version + 1)
    const refreshAfterActivation = () => {
      if (document.visibilityState !== 'visible') return
      const now = Date.now()
      if (now - lastFocusRefreshAt.current < FOCUS_REFRESH_DEDUPLICATION_MS) return
      lastFocusRefreshAt.current = now
      refresh()
    }

    window.addEventListener(DATA_REFRESH_EVENT, refresh)
    window.addEventListener('focus', refreshAfterActivation)
    document.addEventListener('visibilitychange', refreshAfterActivation)
    return () => {
      window.removeEventListener(DATA_REFRESH_EVENT, refresh)
      window.removeEventListener('focus', refreshAfterActivation)
      document.removeEventListener('visibilitychange', refreshAfterActivation)
    }
  }, [])

  return <DataRefreshContext.Provider value={refreshVersion}>{children}</DataRefreshContext.Provider>
}
