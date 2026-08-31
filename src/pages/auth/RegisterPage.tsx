import { useState, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Zap,
  UserCircle2, Briefcase, ArrowRight, Sparkles,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/auth'
import axios from 'axios'

// ─── Friendly error messages ──────────────────────────────────────────────────
function mapError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
  const status = err.response?.status
  const detail = err.response?.data?.detail
  switch (status) {
    case 400: return 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.'
    case 409:
      if (typeof detail === 'string' && detail.toLowerCase().includes('email'))
        return 'Email này đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập.'
      return 'Tài khoản đã tồn tại.'
    case 422: return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường.'
    case 500:
    case 502:
    case 503: return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
    default:
      if (!err.response) return 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng của bạn.'
      return 'Đăng ký thất bại. Vui lòng thử lại.'
  }
}

// ─── Role options (Admin never shown on UI) ───────────────────────────────────
const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: typeof UserCircle2 }[] = [
  {
    value: 'CANDIDATE',
    label: 'Ứng viên',
    description: 'Tìm kiếm việc làm, nhận gợi ý AI',
    icon: UserCircle2,
  },
  {
    value: 'RECRUITER',
    label: 'Nhà tuyển dụng',
    description: 'Đăng tin, tìm kiếm ứng viên',
    icon: Briefcase,
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const fullNameId = useId()
  const emailId    = useId()
  const passwordId = useId()
  const confirmId  = useId()
  const navigate   = useNavigate()
  const { register } = useAuth()

  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [role,       setRole]       = useState<UserRole>('CANDIDATE')
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [success,    setSuccess]    = useState(false)

  // ── Validation helpers ───────────────────────────────────────────────────
  const emailValid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const pwStrong     = password.length >= 8
  const pwMatch      = password === confirm && confirm.length > 0
  const canSubmit    = fullName.trim().length >= 2 && emailValid && pwStrong && pwMatch && !loading

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login', { state: { registered: true } }), 2000)
    } catch (err) {
      setError(mapError(err))
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Đăng ký thành công!</h2>
          <p className="text-sm text-slate-500">Đang chuyển đến trang đăng nhập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)' }}
        aria-hidden="true"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 bg-white/20 rounded-xl backdrop-blur-sm">
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            G<span className="text-emerald-200">Job</span>
          </span>
        </Link>

        {/* Main copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-6">
            <Sparkles size={14} className="text-emerald-200" />
            <span className="text-xs font-medium text-emerald-100">Bắt đầu miễn phí</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gia nhập cộng đồng<br />GJob hôm nay
          </h1>
          <p className="text-emerald-100 text-base leading-relaxed max-w-sm">
            Tạo tài khoản chỉ mất 1 phút. Trải nghiệm nền tảng tuyển dụng thông minh nhất Việt Nam.
          </p>

          {/* Feature list */}
          <ul className="mt-10 space-y-4">
            {[
              'Gợi ý việc làm phù hợp bằng AI',
              'Tạo CV chuyên nghiệp trong vài phút',
              'Kết nối trực tiếp với nhà tuyển dụng',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
                <span className="text-sm text-white/90">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom note */}
        <p className="text-xs text-emerald-200/70">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <span className="underline">
            Điều khoản sử dụng
          </span>{' '}
          và{' '}
          <span className="underline">
            Chính sách bảo mật
          </span>{' '}
          của GJob.
        </p>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-slate-900">
            G<span className="text-blue-600">Job</span>
          </span>
        </Link>

        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Tạo tài khoản</h2>
            <p className="text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Đăng nhập
              </Link>
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full name */}
            <div>
              <label htmlFor={fullNameId} className="block text-sm font-medium text-slate-700 mb-1.5">
                Họ và tên
              </label>
              <input
                id={fullNameId}
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(null) }}
                placeholder="Nguyễn Văn A"
                className="
                  w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm
                  placeholder:text-slate-400 outline-none transition-all duration-200
                  focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500
                "
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor={emailId} className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="ban@example.com"
                className={`
                  w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 text-sm
                  placeholder:text-slate-400 outline-none transition-all duration-200
                  focus:bg-white focus:ring-2 focus:ring-offset-0
                  ${email && !emailValid
                    ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                    : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'}
                `}
                required
              />
              {email && !emailValid && (
                <p className="mt-1.5 text-xs text-red-600">Vui lòng nhập địa chỉ email hợp lệ.</p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <p className="block text-sm font-medium text-slate-700 mb-2">
                Bạn đăng ký với tư cách
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-${value.toLowerCase()}`}
                    onClick={() => setRole(value)}
                    className={`
                      flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 text-left
                      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${role === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'}
                    `}
                    aria-pressed={role === value}
                  >
                    <Icon
                      size={18}
                      className={role === value ? 'text-blue-600' : 'text-slate-400'}
                    />
                    <span className={`text-sm font-semibold ${role === value ? 'text-blue-700' : 'text-slate-700'}`}>
                      {label}
                    </span>
                    <span className="text-xs text-slate-500 leading-snug">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor={passwordId} className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  placeholder="Tối thiểu 8 ký tự"
                  className="
                    w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm
                    placeholder:text-slate-400 outline-none transition-all duration-200
                    focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500
                  "
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Password strength hint */}
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                          password.length >= 8 && i === 0 ? 'bg-emerald-500' :
                          password.length >= 12 && i === 1 ? 'bg-emerald-500' :
                          password.length >= 16 && i === 2 ? 'bg-emerald-500' :
                          i === 0 && password.length >= 1 && password.length < 8 ? 'bg-red-400' :
                          'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs ${pwStrong ? 'text-emerald-600' : 'text-red-500'}`}>
                    {pwStrong ? 'Mật khẩu hợp lệ' : 'Cần ít nhất 8 ký tự'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor={confirmId} className="block text-sm font-medium text-slate-700 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id={confirmId}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(null) }}
                  placeholder="Nhập lại mật khẩu"
                  className={`
                    w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 text-slate-900 text-sm
                    placeholder:text-slate-400 outline-none transition-all duration-200
                    focus:bg-white focus:ring-2 focus:ring-offset-0
                    ${confirm && !pwMatch
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                      : confirm && pwMatch
                        ? 'border-emerald-400 focus:ring-emerald-400 focus:border-emerald-400'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'}
                  `}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {confirm && !pwMatch && (
                <p className="mt-1.5 text-xs text-red-600">Mật khẩu xác nhận không khớp.</p>
              )}
              {confirm && pwMatch && (
                <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Mật khẩu khớp.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={!canSubmit}
              className="
                w-full flex items-center justify-center gap-2
                py-3 px-6 mt-2 rounded-xl text-sm font-semibold text-white
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                shadow-sm shadow-blue-600/30
              "
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  Tạo tài khoản
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <span className="text-slate-600">
              Điều khoản sử dụng
            </span>{' '}
            và{' '}
            <span className="text-slate-600">
              Chính sách bảo mật
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
