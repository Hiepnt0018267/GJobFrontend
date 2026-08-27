import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const TOKEN_KEY = 'gjob_token'

// ─── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  save: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY),
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor: handle 401 silently ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Remove stale token; AuthContext will handle redirect
      tokenStorage.remove()
    }
    return Promise.reject(error)
  },
)

export default api
