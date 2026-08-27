import api from './api'
import type { User, UpdateProfileRequest } from '../types/auth'

/**
 * userService — wraps /api/v1/users/me endpoints.
 * Uses the shared Axios instance (api.ts) which auto-attaches the Bearer token.
 *
 * GET  /api/v1/users/me → UserProfile (includes phone, address, bio, etc.)
 * PATCH /api/v1/users/me → UserProfile (only safe fields: full_name, phone, avatar_url, address, bio)
 */
export const userService = {
  /**
   * Fetch the current authenticated user's full profile.
   * Maps to backend UserProfile schema.
   */
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/api/v1/users/me')
    return data
  },

  /**
   * Update the current user's profile fields.
   * Only sends PATCH-safe fields — never sends role, is_active, email.
   */
  updateCurrentUser: async (payload: UpdateProfileRequest): Promise<User> => {
    // Explicitly whitelist the safe fields to prevent accidental field leakage
    const safe: UpdateProfileRequest = {
      full_name: payload.full_name,
      phone:     payload.phone,
      avatar_url: payload.avatar_url,
      address:   payload.address,
      bio:       payload.bio,
    }
    const { data } = await api.patch<User>('/api/v1/users/me', safe)
    return data
  },
}
