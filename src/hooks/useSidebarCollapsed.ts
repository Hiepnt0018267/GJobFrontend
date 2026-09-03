import { useEffect, useState } from 'react'

/** Keeps desktop workspace sidebar preference local to its own product area. */
export function useSidebarCollapsed(storageKey: string) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(storageKey) === 'true')

  useEffect(() => {
    localStorage.setItem(storageKey, String(collapsed))
  }, [collapsed, storageKey])

  return [collapsed, setCollapsed] as const
}
