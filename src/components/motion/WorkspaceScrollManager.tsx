import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const scrollPositions = new Map<string, number>()

export default function WorkspaceScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    const currentLocationKey = location.key
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start' })
        return
      }
      const top = navigationType === 'POP' ? (scrollPositions.get(location.key) ?? 0) : 0
      window.scrollTo({ top, left: 0, behavior: 'auto' })
    })
    return () => {
      window.cancelAnimationFrame(frame)
      scrollPositions.set(currentLocationKey, window.scrollY)
    }
  }, [location.hash, location.key, navigationType])

  return null
}
