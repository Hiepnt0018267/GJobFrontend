import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthFlowShell from '../../components/auth/AuthFlowShell'
import { authService } from '../../services/authService'
import { authSecurityErrorMessage, passwordPolicyError } from '../../utils/authSecurity'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const policyError = passwordPolicyError(password)
    if (!token) return setError('Liên kết đặt lại mật khẩu không hợp lệ.')
    if (policyError) return setError(policyError)
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp.')
    setSubmitting(true)
    setError('')
    try {
      await authService.resetPassword({ token, new_password: password })
      setSuccess(true)
    } catch (requestError) {
      setError(authSecurityErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFlowShell eyebrow="Khôi phục tài khoản" title="Đặt mật khẩu mới" description="Mật khẩu mới phải có ít nhất 8 ký tự và tối đa 72 byte UTF-8.">
      {success ? (
        <div>
          <div role="status" className="flex gap-3 rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800"><CheckCircle2 className="shrink-0" /> Mật khẩu đã được đặt lại. Các phiên đăng nhập cũ không còn hiệu lực.</div>
          <Link to="/login" state={{ message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.' }} className="mt-6 block rounded-2xl bg-[#49BBBD] px-5 py-3 text-center font-semibold text-white">Đăng nhập lại</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="reset-password" className="block text-sm font-semibold text-slate-800">Mật khẩu mới</label>
          <div className="relative"><input id="reset-password" type={show ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15" /><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          <label htmlFor="reset-confirm" className="block text-sm font-semibold text-slate-800">Xác nhận mật khẩu</label>
          <input id="reset-confirm" type={show ? 'text' : 'password'} autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15" />
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#49BBBD] px-5 py-3 font-semibold text-white disabled:opacity-60">{submitting && <Loader2 size={17} className="animate-spin" />} Đặt lại mật khẩu</button>
        </form>
      )}
    </AuthFlowShell>
  )
}
