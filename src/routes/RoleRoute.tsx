import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types/auth'

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

/**
 * RoleRoute — guards routes that require a specific user role.
 *
 * Must be nested inside <ProtectedRoute> (so user is guaranteed authenticated).
 * Wrong role → redirect to /403.
 */
export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
