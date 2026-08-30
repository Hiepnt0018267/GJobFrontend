import { createContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { tokenStorage } from '../services/api'
import type {
  AuthContextType,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  User,
} from '../types/auth'

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(tokenStorage.get())
  const [loading, setLoading] = useState(true)

  // ── Auth restoration on page load / reload ───────────────────────────────
  useEffect(() => {
    const savedToken = tokenStorage.get()

    // Wrap in a Promise so setState is never called synchronously in the effect body
    const restore = savedToken
      ? authService
          .getMe()
          .then((me) => {
            setUser(me)
            setToken(savedToken)
          })
          .catch(() => {
            tokenStorage.remove()
            setUser(null)
            setToken(null)
          })
      : Promise.resolve()

    restore.finally(() => {
      setLoading(false)
    })
  }, [])

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password })
    tokenStorage.save(res.access_token)
    setToken(res.access_token)

    const me = await authService.getMe()
    setUser(me)
  }, [])

  // ── register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (data: RegisterRequest): Promise<RegisterResponse> => {
      return authService.register(data)
    },
    [],
  )

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    tokenStorage.remove()
    setUser(null)
    setToken(null)
  }, [])

  // ── updateUser ─────────────────────────────────────────
  const updateUser = useCallback(async (data: UpdateProfileRequest): Promise<void> => {
    const updated = await userService.updateCurrentUser(data)
    setUser(updated)
  }, [])

  const updateAuthenticatedUser = useCallback((data: Partial<User>) => {
    setUser((current) => current ? { ...current, ...data } : current)
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateAuthenticatedUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Raw context export for hook ──────────────────────────────────────────────
export { AuthContext }
