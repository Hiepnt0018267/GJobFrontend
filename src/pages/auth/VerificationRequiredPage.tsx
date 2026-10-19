import { useState } from 'react'
import { CheckCircle2, Loader2, MailCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import AuthFlowShell from '../../components/auth/AuthFlowShell'
import { authService } from '../../services/authService'

const GENERIC_MESSAGE = 'Nếu email thuộc một tài khoản cần xác minh, email hướng dẫn sẽ được gửi.'

export default function VerificationRequiredPage() {
  const location = useLocation()
  const initialEmail = (location.state as { email?: string } | null)?.email ?? ''
  const [email, setEmail] = useState(initialEmail)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function resend(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try { await authService.resendVerification(email.trim()) } finally {
      setMessage(GENERIC_MESSAGE)
      setSubmitting(false)
    }
  }

  return (
    <AuthFlowShell eyebrow="Bước cuối" title="Kiểm tra email của bạn" description="Tài khoản đã được tạo nhưng chưa thể đăng nhập cho tới khi địa chỉ email được xác minh.">
      <div className="rounded-2xl bg-[#49BBBD]/10 p-5 text-sm leading-6 text-slate-700"><MailCheck className="mb-2 text-[#31999b]" /> Mở liên kết trong email trên cùng thiết bị đang chạy GJob.</div>
      <form onSubmit={resend} className="mt-6 space-y-3">
        <label htmlFor="verification-email" className="text-sm font-semibold text-slate-800">Chưa nhận được email?</label>
        <input id="verification-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15" />
        <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#49BBBD] px-5 py-3 font-semibold text-[#287f81] hover:bg-[#49BBBD]/10 disabled:opacity-60">{submitting && <Loader2 size={17} className="animate-spin" />} Gửi lại email xác minh</button>
      </form>
      {message && <p role="status" className="mt-4 flex gap-2 text-sm text-emerald-700"><CheckCircle2 size={18} className="shrink-0" />{message}</p>}
      <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-[#31999b]">Quay lại đăng nhập</Link>
    </AuthFlowShell>
  )
}
