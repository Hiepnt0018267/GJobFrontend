import api from './api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../types/auth'

// ─── Auth API calls ───────────────────────────────────────────────────────────

export const authService = {
  /**
   * Login with email + password → returns JWT access_token
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/v1/auth/login', data)
    return res.data
  },

  /**
   * Register a new user account
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>('/api/v1/auth/register', data)
    return res.data
  },

  /**
   * Fetch current authenticated user (requires valid token in headers)
   */
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/api/v1/auth/me')
    return res.data
  },
}
