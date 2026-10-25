import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { preloadWorkspaceRoute } from '../../config/workspaceRouteModules'

type Phase = 'idle' | 'loading' | 'complete'

const MINIMUM_VISIBLE_MS = 180
const COMPLETE_MS = 160

function internalLocation(anchor: HTMLAnchorElement): URL | null {
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return null
  const destination = new URL(anchor.href, window.location.href)
  return destination.origin === window.location.origin ? destination : null
}

export default function WorkspaceNavigationFeedback() {
  const location = useLocation()
  const [phase, setPhase] = useState<Phase>('idle')
  const active = useRef(false)
  const startedAt = useRef(0)
  const previousLocation = useRef(`${location.pathname}${location.search}${location.hash}`)
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (finishTimer.current) clearTimeout(finishTimer.current)
    if (idleTimer.current) clearTimeout(idleTimer.current)
    finishTimer.current = null
    idleTimer.current = null
  }, [])

  const begin = useCallback(() => {
    clearTimers()
    active.current = true
    startedAt.current = performance.now()
    setPhase('loading')
  }, [clearTimers])

  useEffect(() => {
    const preloadFromEvent = (event: Event) => {
      const anchor = (event.target as Element | null)?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      const destination = internalLocation(anchor)
      if (destination) preloadWorkspaceRoute(destination.pathname)
    }
    const startFromClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      const destination = internalLocation(anchor)
      if (!destination) return
      const current = new URL(window.location.href)
      if (destination.pathname === current.pathname && destination.search === current.search && destination.hash === current.hash) return
      begin()
    }

    document.addEventListener('pointerover', preloadFromEvent, true)
    document.addEventListener('focusin', preloadFromEvent, true)
    document.addEventListener('click', startFromClick, true)
    return () => {
      document.removeEventListener('pointerover', preloadFromEvent, true)
      document.removeEventListener('focusin', preloadFromEvent, true)
      document.removeEventListener('click', startFromClick, true)
    }
  }, [begin])

  useEffect(() => {
    const currentLocation = `${location.pathname}${location.search}${location.hash}`
    if (currentLocation === previousLocation.current) return
    previousLocation.current = currentLocation
    if (!active.current) return
    const elapsed = performance.now() - startedAt.current
    finishTimer.current = setTimeout(() => {
      setPhase('complete')
      idleTimer.current = setTimeout(() => {
        active.current = false
        setPhase('idle')
      }, COMPLETE_MS)
    }, Math.max(0, MINIMUM_VISIBLE_MS - elapsed))
  }, [location.hash, location.pathname, location.search])

  useEffect(() => clearTimers, [clearTimers])

  return <div aria-hidden="true" className={`workspace-navigation-progress ${phase === 'idle' ? '' : `is-${phase}`}`}><span /></div>
}
