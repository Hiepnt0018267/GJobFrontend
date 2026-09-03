import type { UserRole } from '../types/auth'

/**
 * Returns the dashboard path for a given user role.
 */
export function dashboardFor(role: UserRole): string {
  switch (role) {
    case 'CANDIDATE': return '/'
    case 'RECRUITER': return '/recruiter'
    case 'ADMIN':     return '/admin'
  }
}

/** Public pages are always safe to restore; workspace paths require their matching role. */
export function canRestorePathForRole(pathname: string, role: UserRole): boolean {
  if (pathname.startsWith('/candidate')) return role === 'CANDIDATE'
  if (pathname.startsWith('/recruiter')) return role === 'RECRUITER'
  if (pathname.startsWith('/admin')) return role === 'ADMIN'
  return pathname !== '/403'
}
