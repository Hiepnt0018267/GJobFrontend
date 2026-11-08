import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

let scrollLockDepth = 0
let previousBodyOverflow = ''

function lockBodyScroll() {
  if (scrollLockDepth === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockDepth += 1
}

function unlockBodyScroll() {
  scrollLockDepth = Math.max(0, scrollLockDepth - 1)
  if (scrollLockDepth === 0) document.body.style.overflow = previousBodyOverflow
}

export default function AdminViewportPortal({ children, lockScroll = true }: { children: ReactNode; lockScroll?: boolean }) {
  useEffect(() => {
    if (!lockScroll) return
    lockBodyScroll()
    return unlockBodyScroll
  }, [lockScroll])

  if (typeof document === 'undefined') return children
  return createPortal(children, document.body)
}
