import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, Zap, ArrowRight, Briefcase, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { dashboardFor } from '../../utils/dashboardFor'
import axios from 'axios'

// ─── Friendly error messages ──────────────────────────────────────────────────
function mapError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
  const status = err.response?.status
  switch (status) {
    case 400: return 'Thông tin đăng nhập không hợp lệ.'
    case 401: return 'Email hoặc mật khẩu không chính xác.'
    case 403: return 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.'
    case 404: return 'Không tìm thấy tài khoản với email này.'
    case 422: return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
    case 429: return 'Quá nhiều lần thử. Vui lòng đợi một lúc rồi thử lại.'
    case 500:
    case 502:
    case 503: return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
    default:
      if (!err.response) return 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng của bạn.'
      return 'Đăng nhập thất bại. Vui lòng thử lại.'
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login, user, isAuthenticated } = useAuth()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  // ── After successful login: user state updates → redirect ────────────────
  useEffect(() => {
    if (justLoggedIn && isAuthenticated && user) {
      // If there's a "from" location saved, redirect there,
      // otherwise go to role-based dashboard
      const dest = from ?? dashboardFor(user.role)
      navigate(dest, { replace: true })
    }
  }, [justLoggedIn, isAuthenticated, user, from, navigate])

  // ── Validation ──────────────────────────────────────────────────────────
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit  = email.trim() && password.length >= 6 && !loading

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)

    try {
      await login(email.trim(), password)
      setJustLoggedIn(true)
    } catch (err) {
      const msg = mapError(err)
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}
        aria-hidden="true"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 bg-white/20 rounded-xl backdrop-blur-sm">
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            G<span className="text-blue-200">Job</span>
          </span>
        </Link>

        {/* Main copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-6">
            <Sparkles size={14} className="text-blue-200" />
            <span className="text-xs font-medium text-blue-100">AI-Powered Recruitment</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Cơ hội nghề nghiệp<br />dành cho bạn
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            Kết nối với hàng nghìn nhà tuyển dụng hàng đầu. Để AI tìm việc phù hợp với bạn.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mt-10">
            {[
              { value: '10K+', label: 'Việc làm' },
              { value: '2K+',  label: 'Công ty' },
              { value: '50K+', label: 'Ứng viên' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-blue-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white text-sm font-bold">
              NT
            </div>
            <div>
              <p className="text-sm text-white/90 leading-relaxed">
                "GJob giúp tôi tìm được công việc mơ ước chỉ trong 2 tuần nhờ gợi ý AI thông minh."
              </p>
              <p className="text-xs text-blue-200 mt-2 font-medium">Nguyễn Thành — Frontend Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-slate-900">
            G<span className="text-blue-600">Job</span>
          </span>
        </Link>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Đăng nhập</h2>
            <p className="text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="motion-error flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="ban@example.com"
                className={`
                  w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 text-sm
                  placeholder:text-slate-400 outline-none transition-all duration-200
                  focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500
                  ${email && !emailValid ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200'}
                `}
                required
                aria-describedby={email && !emailValid ? 'login-email-error' : undefined}
              />
              {email && !emailValid && (
                <p id="login-email-error" className="mt-1.5 text-xs text-red-600">
                  Vui lòng nhập địa chỉ email hợp lệ.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Mật khẩu
                </label>
                <span className="text-xs text-slate-500">Khôi phục mật khẩu sẽ sớm có.</span>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  placeholder="••••••••"
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
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
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
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 shrink-0">hoặc</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Register CTA */}
          <Link
            to="/register"
            className="
              flex items-center justify-center gap-2 w-full py-3 px-6
              rounded-xl border border-slate-200 text-sm font-medium text-slate-700
              hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
          >
            <Briefcase size={16} className="text-slate-500" />
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  )
}
