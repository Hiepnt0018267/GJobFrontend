import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type Props = {
  children: ReactNode
  className?: string
}

/**
 * A pathname-only transition. Search, filtering and pagination updates retain
 * their mounted page so they never restart a full-page animation.
 */
export default function PageTransition({ children, className = '' }: Props) {
  const { pathname } = useLocation()

  return <div key={pathname} className={`motion-page ${className}`}>{children}</div>
}
