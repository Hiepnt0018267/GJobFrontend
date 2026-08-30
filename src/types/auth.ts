// ─── User Role ────────────────────────────────────────────────────────────────
export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN'

// ─── User Model (mirrors backend UserProfile) ─────────────────────────────────
export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  // Extended profile fields (present when fetched via GET/PATCH /api/v1/users/me)
  phone?: string | null
  avatar_url?: string | null
  address?: string | null
  bio?: string | null
  updated_at?: string
}

// ─── API Request Payloads ─────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  role?: UserRole
}

// ─── API Response Shapes ──────────────────────────────────────────────────────
export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
}

export interface RegisterResponse {
  message: string
  user: User
}

// ─── Profile Update Payload ───────────────────────────────────────────
export interface UpdateProfileRequest {
  full_name?: string | null
  phone?: string | null
  avatar_url?: string | null
  address?: string | null
  bio?: string | null
}

// ─── Auth Context Shape ───────────────────────────────────────────────────────
export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<RegisterResponse>
  logout: () => void
  updateUser: (data: UpdateProfileRequest) => Promise<void>
  updateAuthenticatedUser: (data: Partial<User>) => void
}
