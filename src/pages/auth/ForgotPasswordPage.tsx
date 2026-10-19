import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import AuthFlowShell from '../../components/auth/AuthFlowShell'
import { authService } from '../../services/authService'

const GENERIC_CONFIRMATION = 'Nếu email thuộc một tài khoản hợp lệ, hướng dẫn đặt lại mật khẩu sẽ được gửi.'

export default function ForgotPasswordPage() {
  const location = useLocation()
  const initialEmail = (location.state as { email?: string } | null)?.email ?? ''
  const [email, setEmail] = useState(initialEmail)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
    } catch {
      setError('Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFlowShell eyebrow="Bảo mật tài khoản" title="Quên mật khẩu?" description="Nhập email đã đăng ký. GJob luôn trả về cùng một thông báo để bảo vệ thông tin tài khoản.">
      {sent ? (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <CheckCircle2 size={22} />
          <p className="mt-3 text-sm font-semibold leading-6">{GENERIC_CONFIRMATION}</p>
          <p className="mt-1 text-xs leading-5 text-emerald-700">Vui lòng kiểm tra cả thư mục Spam.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="forgot-email">Email</label>
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="forgot-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15" placeholder="ban@example.com" />
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#49BBBD] px-5 py-3 font-semibold text-white transition hover:bg-[#3da8aa] disabled:opacity-60">
            {submitting && <Loader2 size={17} className="animate-spin" />} Gửi hướng dẫn
          </button>
        </form>
      )}
      <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#31999b]"><ArrowLeft size={16} /> Quay lại đăng nhập</Link>
    </AuthFlowShell>
  )
}
