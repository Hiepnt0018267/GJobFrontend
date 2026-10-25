import { useState, useId } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Eye, EyeOff, Loader2, AlertCircle, KeyRound, CheckCircle2, X,
  UserCheck, Building2
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/auth'
import axios from 'axios'
import AuthVisualPanel from '../../components/auth/AuthVisualPanel'
import { authService } from '../../services/authService'
import { getApiErrorCode } from '../../utils/apiError'
import GoogleAuthPanel from '../../components/auth/GoogleAuthPanel'
import GJobLogo from '../../components/brand/GJobLogo'
import { requestRecruiterOnboarding } from '../../utils/recruiterOnboarding'

// ─── Friendly error mapping ───────────────────────────────────────────────────
function mapError(err: unknown): string {
  if (getApiErrorCode(err) === 'EMAIL_NOT_VERIFIED') return 'Email chưa được xác minh. Hãy kiểm tra hộp thư hoặc gửi lại email xác minh.'
  if (!axios.isAxiosError(err)) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
  const status = err.response?.status
  const detail = err.response?.data?.detail
  switch (status) {
    case 400: return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.'
    case 401: return 'Email hoặc mật khẩu không chính xác.'
    case 403: return 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.'
    case 404: return 'Không tìm thấy tài khoản với thông tin này.'
    case 409:
      if (typeof detail === 'string' && detail.toLowerCase().includes('email'))
        return 'Email này đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập.'
      return 'Tài khoản đã tồn tại.'
    case 422: return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường.'
    case 429: return 'Quá nhiều lần thử. Vui lòng đợi một lúc rồi thử lại.'
    case 500:
    case 502:
    case 503: return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
    default:
      if (!err.response) return 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng của bạn.'
      return 'Thao tác thất bại. Vui lòng thử lại.'
  }
}

interface AuthPageProps {
  initialMode?: 'login' | 'register'
}

export default function AuthPage({ initialMode }: AuthPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()

  // Active mode based on URL or prop
  const currentPathMode = location.pathname.includes('/register') ? 'register' : 'login'
  const mode = location.pathname === '/login' || location.pathname === '/register'
    ? currentPathMode
    : (initialMode ?? currentPathMode)

  const isLogin = mode === 'login'
  const flashMessage = (location.state as { message?: string } | null)?.message

  // ── Switch mode smoothly without full-page reloads ────────────────────────
  function handleSwitchMode(targetMode: 'login' | 'register') {
    if (targetMode === mode) return
    setError(null)
    navigate(targetMode === 'login' ? '/login' : '/register', { replace: true })
  }

  // ── Login States ──────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe]       = useState(true)
  const [showLoginPw, setShowLoginPw]     = useState(false)
  const [loginLoading, setLoginLoading]   = useState(false)
  const [loginSuccess, setLoginSuccess]   = useState(false)

  // ── Register States ───────────────────────────────────────────────────────
  const fullNameId = useId()
  const emailId    = useId()
  const passwordId = useId()
  const confirmId  = useId()

  const [regFullName, setRegFullName]         = useState('')
  const [regEmail, setRegEmail]               = useState('')
  const [regRole, setRegRole]                 = useState<UserRole>('CANDIDATE')
  const [regPassword, setRegPassword]         = useState('')
  const [regConfirm, setRegConfirm]           = useState('')
  const [showRegPw, setShowRegPw]             = useState(false)
  const [showRegConfirm, setShowRegConfirm]   = useState(false)
  const [regLoading, setRegLoading]           = useState(false)
  const [regSuccess, setRegSuccess]           = useState(false)

  // ── Common States ─────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null)

  // ── Forgot Password States ────────────────────────────────────────────────
  const [forgotOpen, setForgotOpen]       = useState(false)
  const [forgotEmail, setForgotEmail]     = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent]       = useState(false)
  const forgotEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)

  // ── Validations ───────────────────────────────────────────────────────────
  const loginEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)
  const canSubmitLogin  = loginEmail.trim() && loginPassword.length >= 6 && !loginLoading && !loginSuccess

  const regEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)
  const regPwStrong   = regPassword.length >= 8
  const regPwMatch    = regPassword === regConfirm && regConfirm.length > 0
  const canSubmitReg  = regFullName.trim().length >= 2 && regEmailValid && regPwStrong && regPwMatch && !regLoading

  // ── Handle Login ──────────────────────────────────────────────────────────
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmitLogin) return
    setError(null)
    setLoginLoading(true)

    try {
      await login(loginEmail.trim(), loginPassword)
      setLoginLoading(false)
      setLoginSuccess(true)
      // RedirectIfAuthenticated is the single owner of post-login navigation.
      // It reads the freshly authenticated role instead of a stale render value.
    } catch (err) {
      setError(mapError(err))
      setLoginLoading(false)
    }
  }

  // ── Handle Register ───────────────────────────────────────────────────────
  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmitReg) return
    setError(null)
    setRegLoading(true)

    try {
      await register({
        full_name: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      })
      if (regRole === 'RECRUITER') requestRecruiterOnboarding(regEmail)
      setRegSuccess(true)
      navigate('/verification-required', { replace: true, state: { email: regEmail.trim() } })
    } catch (err) {
      setError(mapError(err))
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row items-stretch">
      {/* ── Top progress bar on successful authentication ──────────────── */}
      {/* ── Left column: Full-bleed photo with smooth cross-fade ────────── */}
      <AuthVisualPanel isLogin={isLogin} />

      {/* ── Right column: Form container ────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 lg:px-12 xl:px-16 min-h-screen bg-white overflow-y-auto">
        {/* Mobile Header / Logo */}
        <div className="w-full max-w-[400px] flex items-center justify-between mb-4 lg:hidden">
          <Link to="/" className="group flex items-center" aria-label="GJob - Trang chủ">
            <GJobLogo className="h-9 w-auto transition-transform duration-200 group-hover:scale-[1.03]" />
          </Link>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-6 text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#31999b]">GJob</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {isLogin ? 'Chào mừng bạn quay lại' : 'Tạo tài khoản của bạn'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 transition-all duration-300">
              {isLogin
                ? 'Đăng nhập để tiếp tục hành trình nghề nghiệp cùng GJob.'
                : 'Bắt đầu tìm việc hoặc tuyển dụng nhân tài cùng GJob.'}
            </p>
          </div>

          {/* Error alert banner */}
          {flashMessage && isLogin && (
            <div role="status" className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 sm:text-sm">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{flashMessage}</span>
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 mb-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-700 animate-in fade-in duration-200"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Success Overlay */}
          {regSuccess ? (
            <div className="py-8 text-center bg-[#49BBBD]/10 rounded-3xl border border-[#49BBBD]/30 animate-in zoom-in-95 duration-300 shadow-sm">
              <div className="w-14 h-14 bg-[#49BBBD]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#49BBBD]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Đăng ký thành công!</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-3">
                Đang tự động chuyển sang biểu mẫu đăng nhập...
              </p>
              <div className="w-6 h-6 border-2 border-[#49BBBD] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            /* Forms container with smooth slide-and-fade animation */
            <div className="relative transition-all duration-300 ease-out">
              {isLogin ? (
                /* ── LOGIN FORM ── */
                <form
                  key="login-form"
                  id="login-form"
                  onSubmit={handleLoginSubmit}
                  noValidate
                  className="auth-mode-enter-from-left space-y-4"
                >
                  {/* Tên đăng nhập / Email */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => { setLoginEmail(e.target.value); setError(null) }}
                      placeholder="Nhập địa chỉ email"
                      className={`
                        w-full rounded-2xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900
                        placeholder:text-slate-400 outline-none transition-[border-color,background-color,box-shadow] duration-200
                        ${loginEmail && !loginEmailValid
                          ? 'border-red-400 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                          : 'border-slate-200 focus:border-[#49BBBD] focus:bg-white focus:ring-4 focus:ring-[#49BBBD]/15'}
                      `}
                      required
                    />
                    {loginEmail && !loginEmailValid && (
                      <p className="mt-1.5 text-xs text-red-500">Vui lòng nhập địa chỉ email hợp lệ.</p>
                    )}
                  </div>

                  {/* Mật khẩu */}
                  <div>
                    <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-800">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showLoginPw ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setError(null) }}
                        placeholder="Nhập mật khẩu của bạn"
                        className="
                          w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900
                          placeholder:text-slate-400 outline-none transition-[border-color,background-color,box-shadow] duration-200
                          focus:border-[#49BBBD] focus:bg-white focus:ring-4 focus:ring-[#49BBBD]/15
                        "
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw((v) => !v)}
                        className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        aria-label={showLoginPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showLoginPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password', { state: { email: loginEmail } })}
                        className="text-sm font-semibold text-[#31999b] transition-colors hover:text-[#287f81] hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                  </div>

                  {/* Remember login */}
                  <div className="flex items-center pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#49BBBD] focus:ring-[#49BBBD] accent-[#49BBBD]"
                      />
                      <span>Ghi nhớ đăng nhập</span>
                    </label>
                  </div>

                  {/* Submit Button with smooth success feedback */}
                  <div className="pt-2">
                    <button
                      id="login-submit-btn"
                      type="submit"
                      disabled={!canSubmitLogin || loginSuccess}
                      className={`
                        w-full rounded-2xl px-10 py-3.5 text-sm font-semibold text-white
                        transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/30
                        flex items-center justify-center gap-2 cursor-pointer
                        bg-[#49BBBD] hover:bg-[#3ca8aa] active:bg-[#2a8284] shadow-lg shadow-[#49BBBD]/30
                        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                        ${loginSuccess ? 'scale-[1.02] shadow-[#49BBBD]/50' : ''}
                        ${!canSubmitLogin && !loginSuccess ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : ''}
                      `}
                    >
                      {loginSuccess ? (
                        <>
                          <CheckCircle2 size={18} className="animate-in zoom-in-75 duration-200" />
                          <span>Đăng nhập thành công!</span>
                        </>
                      ) : loginLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Đang đăng nhập...</span>
                        </>
                      ) : (
                        <span>Đăng nhập</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* ── REGISTER FORM ── */
                <form
                  key="register-form"
                  onSubmit={handleRegisterSubmit}
                  noValidate
                  className="auth-mode-enter-from-right space-y-3.5"
                >
                  {/* Địa chỉ Email */}
                  <div>
                    <label
                      htmlFor={emailId}
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Địa chỉ Email
                    </label>
                    <input
                      id={emailId}
                      type="email"
                      autoComplete="email"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setError(null) }}
                      placeholder="Nhập địa chỉ email của bạn"
                      className={`
                        w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900
                        placeholder:text-slate-400 outline-none transition-[border-color,background-color,box-shadow] duration-200
                        ${regEmail && !regEmailValid
                          ? 'border-red-400 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                          : 'border-slate-200 focus:border-[#49BBBD] focus:bg-white focus:ring-4 focus:ring-[#49BBBD]/15'}
                      `}
                      required
                    />
                    {regEmail && !regEmailValid && (
                      <p className="mt-1.5 text-xs text-red-500">Vui lòng nhập địa chỉ email hợp lệ.</p>
                    )}
                  </div>

                  {/* Họ và tên */}
                  <div>
                    <label
                      htmlFor={fullNameId}
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Họ và tên
                    </label>
                    <input
                      id={fullNameId}
                      type="text"
                      autoComplete="name"
                      value={regFullName}
                      onChange={(e) => { setRegFullName(e.target.value); setError(null) }}
                      placeholder="Nhập họ và tên của bạn"
                      className="
                        w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900
                        placeholder:text-slate-400 outline-none transition-[border-color,background-color,box-shadow] duration-200
                        focus:border-[#49BBBD] focus:bg-white focus:ring-4 focus:ring-[#49BBBD]/15
                      "
                      required
                    />
                  </div>

                  {/* Role selector */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Bạn tham gia với tư cách
                    </label>
                    <div className="flex gap-2 p-1 rounded-2xl bg-[#49BBBD]/10 border border-[#49BBBD]/25">
                      <button
                        type="button"
                        id="role-candidate"
                        onClick={() => setRegRole('CANDIDATE')}
                        className={`
                          flex-1 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer
                          ${regRole === 'CANDIDATE'
                            ? 'bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/30'
                            : 'text-slate-700 hover:text-[#49BBBD] hover:bg-white/70'}
                        `}
                      >
                        <UserCheck size={14} />
                        <span>Ứng viên</span>
                      </button>
                      <button
                        type="button"
                        id="role-recruiter"
                        onClick={() => setRegRole('RECRUITER')}
                        className={`
                          flex-1 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer
                          ${regRole === 'RECRUITER'
                            ? 'bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/30'
                            : 'text-slate-700 hover:text-[#49BBBD] hover:bg-white/70'}
                        `}
                      >
                        <Building2 size={14} />
                        <span>Nhà tuyển dụng</span>
                      </button>
                    </div>
                  </div>

                  {/* Mật khẩu */}
                  <div>
                    <label
                      htmlFor={passwordId}
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id={passwordId}
                        type={showRegPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={regPassword}
                        onChange={(e) => { setRegPassword(e.target.value); setError(null) }}
                        placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                        className="
                          w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900
                          placeholder:text-slate-400 outline-none transition-[border-color,background-color,box-shadow] duration-200
                          focus:border-[#49BBBD] focus:bg-white focus:ring-4 focus:ring-[#49BBBD]/15
                        "
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPw((v) => !v)}
                        className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        aria-label={showRegPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showRegPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Subtle strength indicator */}
                    {regPassword && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 w-6 rounded-full transition-colors duration-300 ${
                                regPassword.length >= 8 && i === 0 ? 'bg-[#49BBBD]' :
                                regPassword.length >= 12 && i === 1 ? 'bg-[#49BBBD]' :
                                regPassword.length >= 16 && i === 2 ? 'bg-[#49BBBD]' :
                                i === 0 && regPassword.length >= 1 && regPassword.length < 8 ? 'bg-red-400' :
                                'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-[11px] ${regPwStrong ? 'text-[#1e6365] font-medium' : 'text-red-500'}`}>
                          {regPwStrong ? 'Mật khẩu đủ điều kiện' : 'Cần ít nhất 8 ký tự'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div>
                    <label
                      htmlFor={confirmId}
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id={confirmId}
                        type={showRegConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={regConfirm}
                        onChange={(e) => { setRegConfirm(e.target.value); setError(null) }}
                        placeholder="Nhập lại mật khẩu"
                        className={`
                          w-full rounded-2xl border bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900
                          placeholder:text-slate-400 outline-none transition-[border-color,background-color,box-shadow] duration-200
                          ${regConfirm && !regPwMatch
                            ? 'border-red-400 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                            : regConfirm && regPwMatch
                              ? 'border-emerald-400 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15'
                              : 'border-slate-200 focus:border-[#49BBBD] focus:bg-white focus:ring-4 focus:ring-[#49BBBD]/15'}
                        `}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirm((v) => !v)}
                        className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        aria-label={showRegConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showRegConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {regConfirm && !regPwMatch && (
                      <p className="mt-1.5 text-xs text-red-500">Mật khẩu xác nhận không khớp.</p>
                    )}
                    {regConfirm && regPwMatch && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 size={12} /> Mật khẩu khớp.
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      id="register-submit-btn"
                      type="submit"
                      disabled={!canSubmitReg}
                      className="
                        w-full rounded-2xl px-10 py-3.5 text-sm font-semibold text-white
                        bg-[#49BBBD] hover:bg-[#3ca8aa] active:bg-[#2a8284]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 shadow-lg shadow-[#49BBBD]/30
                        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                        focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/30
                        flex items-center justify-center gap-2 cursor-pointer
                      "
                    >
                      {regLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Đang tạo tài khoản...
                        </>
                      ) : (
                        'Đăng ký'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {!regSuccess && <GoogleAuthPanel />}

          {!regSuccess && (
            <p className="mt-5 text-center text-sm text-slate-600">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode(isLogin ? 'register' : 'login')}
                className="font-bold text-[#31999b] transition-colors hover:text-[#287f81] hover:underline"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          )}

          {/* Terms info */}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400 sm:text-xs">
            Bằng cách nhấn {isLogin ? 'Đăng nhập' : 'Đăng ký'}, bạn đồng ý với{' '}
            <span className="text-[#49BBBD] hover:text-[#2a8284] underline cursor-pointer font-medium">
              Điều khoản
            </span>{' '}
            và{' '}
            <span className="text-[#49BBBD] hover:text-[#2a8284] underline cursor-pointer font-medium">
              Chính sách bảo mật
            </span>{' '}
            của GJob.
          </p>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-modal-title"
            className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] cursor-pointer"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>

            {!forgotSent ? (
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#49BBBD]/15 text-[#49BBBD] mb-4 shadow-sm shadow-[#49BBBD]/20">
                  <KeyRound size={24} />
                </div>
                <h3 id="forgot-modal-title" className="text-xl font-bold text-slate-900">
                  Khôi phục mật khẩu
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Nhập địa chỉ email tài khoản của bạn. Hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu mới.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!forgotEmailValid || forgotLoading) return
                    setForgotLoading(true)
                    try {
                      await authService.forgotPassword(forgotEmail.trim())
                      setForgotSent(true)
                    } finally {
                      setForgotLoading(false)
                    }
                  }}
                  className="mt-5 space-y-4"
                >
                  <div>
                    <label htmlFor="forgot-email-input" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 ml-2">
                      Email đăng ký
                    </label>
                    <input
                      id="forgot-email-input"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="ban@example.com"
                      className="w-full px-5 py-3 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-900 outline-none transition focus:bg-white focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/20"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!forgotEmailValid || forgotLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#49BBBD] hover:bg-[#3ca8aa] active:bg-[#2a8284] px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#49BBBD]/25 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi hướng dẫn'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#49BBBD]/15 text-[#49BBBD] mb-4 shadow-sm shadow-[#49BBBD]/20">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Đã gửi email khôi phục!
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong className="text-slate-900 font-semibold">{forgotEmail}</strong>. Vui lòng kiểm tra hòm thư đến (hoặc hòm thư Spam) của bạn.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="mt-6 w-full rounded-full bg-[#49BBBD] hover:bg-[#3ca8aa] active:bg-[#2a8284] py-3 text-sm font-semibold text-white transition-colors shadow-md shadow-[#49BBBD]/25 cursor-pointer"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
