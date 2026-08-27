import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, AlertCircle, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/userService'
import ProfileForm from '../../components/profile/ProfileForm'
import type { User } from '../../types/auth'
import axios from 'axios'

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Avatar + name skeleton */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-slate-200 shrink-0" />
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-200 rounded-lg" />
          <div className="h-3 w-48 bg-slate-200 rounded-lg" />
          <div className="h-3 w-28 bg-slate-200 rounded-lg" />
        </div>
      </div>
      {/* Field skeletons */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-11 w-full bg-slate-200 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

// ─── Error map ────────────────────────────────────────────────────────────────
function mapLoadError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Đã xảy ra lỗi không xác định.'
  const status = err.response?.status
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  if (!err.response)  return 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng của bạn.'
  return 'Không thể tải thông tin tài khoản. Vui lòng thử lại.'
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CandidateProfileEditPage() {
  const { user: authUser, logout } = useAuth()
  const initial = authUser?.full_name.charAt(0).toUpperCase() ?? '?'
  const navigate = useNavigate()

  const [profile,  setProfile]  = useState<User | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Fetch full profile on mount (includes phone/address/bio from UserProfile)
  useEffect(() => {
    let cancelled = false

    userService
      .getCurrentUser()
      .then((data) => { if (!cancelled) setProfile(data) })
      .catch((err) => { if (!cancelled) setLoadError(mapLoadError(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-7 h-7 bg-blue-600 rounded-lg">
              <Zap size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-slate-900">
              G<span className="text-blue-600">Job</span>
            </span>
          </Link>

          {/* Right: avatar + logout */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
            >
              <ArrowLeft size={13} />
              Quay lại
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initial}
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6" aria-label="breadcrumb">
          <Link to="/candidate" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link to="/candidate/profile" className="hover:text-blue-600 transition-colors">Hồ sơ cá nhân</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Cập nhật hồ sơ</span>
        </nav>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h1 className="text-lg font-bold text-slate-900">Cập nhật hồ sơ</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Chỉnh sửa thông tin cá nhân của bạn
            </p>
          </div>

          {/* Card body */}
          <div className="px-6 py-6">
            {loading && <ProfileSkeleton />}

            {!loading && loadError && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
              >
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Không thể tải thông tin</p>
                  <p>{loadError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-2 text-xs text-red-600 underline hover:no-underline"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            )}

            {!loading && !loadError && profile && (
              <ProfileForm 
                initialData={profile} 
                onCancel={() => navigate('/candidate/profile')}
                onSuccess={() => {
                  // After a short delay to let the user see the success toast, redirect.
                  setTimeout(() => navigate('/candidate/profile'), 1000);
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
