import axios from 'axios'
import { notifyDataRefresh } from '../utils/dataRefresh'

declare module 'axios' {
  export interface AxiosRequestConfig {
    gjobSkipDataRefresh?: boolean
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
export const resolveApiAssetUrl = (url: string | null | undefined): string | undefined => !url ? undefined : url.startsWith('/') ? `${BASE_URL}${url}` : url

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
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    // Let the browser generate the multipart boundary; the JSON default is invalid for file uploads.
    config.headers.setContentType(false)
  }
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor: handle 401 silently ───────────────────────────────
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase()
    if (!response.config.gjobSkipDataRefresh && (method === 'post' || method === 'put' || method === 'patch' || method === 'delete')) notifyDataRefresh()
    return response
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Remove stale token; AuthContext will handle redirect
      tokenStorage.remove()
    }
    return Promise.reject(error)
  },
)

export default api
