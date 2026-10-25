import { Navigate, Outlet, useLocation } from 'react-router-dom'
import CandidateRouteFallback from '../components/feedback/CandidateRouteFallback'
import WorkspaceRouteFallback from '../components/feedback/WorkspaceRouteFallback'
import { useAuth } from '../hooks/useAuth'

/**
 * ProtectedRoute — guards routes that require authentication.
 *
 * - While auth is initialising (loading): render nothing (prevents flash)
 * - Not authenticated: redirect to /login, preserving the attempted URL
 * - Authenticated: render the nested route
 */
export default function ProtectedRoute({ loadingVariant = 'default' }: { loadingVariant?: 'default' | 'candidate' }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Wait for auth restoration to complete before making routing decisions
  if (loading) {
    if (loadingVariant === 'candidate') return <CandidateRouteFallback />
    return <WorkspaceRouteFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
