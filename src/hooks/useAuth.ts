import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import type { AuthContextType } from '../types/auth'

/**
 * Hook to consume AuthContext.
 * Must be used within <AuthProvider> — throws if called outside.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return ctx
}
