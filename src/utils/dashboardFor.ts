import type { UserRole } from '../types/auth'

/**
 * Returns the dashboard path for a given user role.
 */
export function dashboardFor(role: UserRole): string {
  switch (role) {
    case 'CANDIDATE': return '/candidate'
    case 'RECRUITER': return '/recruiter'
    case 'ADMIN':     return '/admin'
  }
}
