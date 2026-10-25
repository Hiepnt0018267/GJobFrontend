import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type Props = {
  children: ReactNode
  className?: string
  variant?: 'workspace' | 'candidate'
}

/**
 * A pathname-only transition. Search, filtering and pagination updates retain
 * their mounted page so they never restart a full-page animation.
 */
export default function PageTransition({ children, className = '', variant = 'workspace' }: Props) {
  const { pathname } = useLocation()

  const motionClass = variant === 'candidate' ? 'motion-page-candidate' : 'motion-page-workspace'
  return <div key={pathname} className={`${motionClass} ${className}`}>{children}</div>
}
