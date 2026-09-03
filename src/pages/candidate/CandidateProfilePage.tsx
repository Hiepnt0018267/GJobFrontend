import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Edit2, MapPin, Phone, Mail, FileText } from 'lucide-react'
import { userService } from '../../services/userService'
import type { User } from '../../types/auth'
import axios from 'axios'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'

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

// ─── Avatar initials ───────────────────────────────────────────────────────────
function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const text = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.charAt(0).toUpperCase()
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0 select-none"
      style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}
      aria-hidden="true"
    >
      {text}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CandidateProfilePage() {
  const navigate = useNavigate()
  const refreshVersion = useDataRefreshVersion()

  const [profile,  setProfile]  = useState<User | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  // Fetch full profile on mount (includes phone/address/bio from UserProfile)
  useEffect(() => {
    let cancelled = false

    userService
      .getCurrentUser()
      .then((data) => { if (!cancelled) setProfile(data) })
      .catch((err) => { if (!cancelled) setLoadError(mapLoadError(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [refreshVersion, requestVersion])

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6" aria-label="breadcrumb">
          <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Hồ sơ cá nhân</span>
        </nav>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Hồ sơ cá nhân</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Quản lý thông tin cá nhân của bạn
              </p>
            </div>
            {!loading && !loadError && profile && (
              <button
                onClick={() => navigate('/candidate/profile/edit')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                <Edit2 size={15} />
                Cập nhật hồ sơ
              </button>
            )}
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
                    onClick={() => {
                      setLoading(true)
                      setLoadError(null)
                      setRequestVersion((version) => version + 1)
                    }}
                    className="mt-2 text-xs text-red-600 underline hover:no-underline"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            )}

            {!loading && !loadError && profile && (
              <div>
                <div className="flex items-center gap-5 mb-8">
                  <Initials name={profile.full_name} />
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{profile.full_name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Ứng viên</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-1">
                      <Mail size={14} className="text-slate-400" /> Email
                    </h3>
                    <p className="text-slate-900 text-base">{profile.email}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-1">
                      <Phone size={14} className="text-slate-400" /> Số điện thoại
                    </h3>
                    <p className="text-slate-900 text-base">
                      {profile.phone || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-1">
                      <MapPin size={14} className="text-slate-400" /> Địa chỉ
                    </h3>
                    <p className="text-slate-900 text-base">
                      {profile.address || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-1">
                      <FileText size={14} className="text-slate-400" /> Giới thiệu bản thân
                    </h3>
                    <p className="text-slate-900 text-base whitespace-pre-wrap leading-relaxed">
                      {profile.bio || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>
                
                {/* Mobile action button */}
                <div className="mt-8 sm:hidden">
                  <button
                    onClick={() => navigate('/candidate/profile/edit')}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    <Edit2 size={15} />
                    Cập nhật hồ sơ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role / account info footer */}
        {!loading && profile && (
          <div className="mt-4 flex items-center gap-3 px-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <p className="text-xs text-slate-400">
              Tài khoản đang hoạt động · Ứng viên ·
              ID: <span className="font-mono text-slate-500">{profile.id.slice(0, 8)}…</span>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
