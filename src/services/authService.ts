import api from './api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  MessageResponse,
  VerifyEmailResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
  GoogleAuthResponse,
  GoogleAuthenticatedResponse,
} from '../types/auth'

// ─── Auth API calls ───────────────────────────────────────────────────────────

// React StrictMode can mount the verification page twice in development. Keep
// only the latest one-time-token request so both mounts observe the same result
// instead of consuming the token and then immediately submitting it again.
let latestEmailVerification: {
  token: string
  request: Promise<VerifyEmailResponse>
} | null = null

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

  resendVerification: async (email: string): Promise<MessageResponse> => {
    const res = await api.post<MessageResponse>('/api/v1/auth/resend-verification', { email })
    return res.data
  },

  verifyEmail: (token: string): Promise<VerifyEmailResponse> => {
    if (latestEmailVerification?.token === token) {
      return latestEmailVerification.request
    }

    const apiRequest = api
      .post<VerifyEmailResponse>('/api/v1/auth/verify-email', { token })
      .then((res) => res.data)
    const request = apiRequest.catch((error: unknown) => {
      if (latestEmailVerification?.request === request) {
        latestEmailVerification = null
      }
      throw error
    })

    latestEmailVerification = { token, request }
    return request
  },

  forgotPassword: async (email: string): Promise<MessageResponse> => {
    const res = await api.post<MessageResponse>('/api/v1/auth/forgot-password', { email })
    return res.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const res = await api.post<MessageResponse>('/api/v1/auth/reset-password', data)
    return res.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const res = await api.post<MessageResponse>('/api/v1/account/change-password', data)
    return res.data
  },

  setPassword: async (newPassword: string): Promise<MessageResponse> => {
    const res = await api.post<MessageResponse>('/api/v1/account/set-password', { new_password: newPassword })
    return res.data
  },

  google: async (credential: string): Promise<GoogleAuthResponse> => {
    const res = await api.post<GoogleAuthResponse>('/api/v1/auth/google', { credential })
    return res.data
  },

  completeGoogleRegistration: async (onboardingToken: string, role: 'CANDIDATE' | 'RECRUITER', fullName: string): Promise<GoogleAuthenticatedResponse> => {
    const res = await api.post<GoogleAuthenticatedResponse>('/api/v1/auth/google/complete-registration', { onboarding_token: onboardingToken, role, full_name: fullName })
    return res.data
  },

  linkGoogleWithPassword: async (linkToken: string, currentPassword: string): Promise<GoogleAuthenticatedResponse> => {
    const res = await api.post<GoogleAuthenticatedResponse>('/api/v1/auth/google/link/password', { link_token: linkToken, current_password: currentPassword })
    return res.data
  },

  linkGoogleWithSession: async (linkToken: string): Promise<GoogleAuthenticatedResponse> => {
    const res = await api.post<GoogleAuthenticatedResponse>('/api/v1/auth/google/link/session', { link_token: linkToken })
    return res.data
  },
}
