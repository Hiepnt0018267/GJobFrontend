import { useContext, useState } from 'react'
import { Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { tokenStorage } from '../../services/api'
import { AuthContext } from '../../contexts/AuthContext'
import { authService } from '../../services/authService'
import { authSecurityErrorMessage, passwordPolicyError } from '../../utils/authSecurity'

export default function AccountSecurityForm() {
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const hasLocalPassword = auth?.user?.has_local_password !== false

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const policyError = passwordPolicyError(newPassword)
    if (policyError) return setError(policyError)
    if (newPassword !== confirmPassword) return setError('Mật khẩu xác nhận không khớp.')
    setSubmitting(true)
    setError('')
    try {
      if (hasLocalPassword) await authService.changePassword({ current_password: currentPassword, new_password: newPassword })
      else await authService.setPassword(newPassword)
      if (auth) auth.logout()
      else tokenStorage.remove()
      navigate('/login', { replace: true, state: { message: hasLocalPassword ? 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.' : 'Mật khẩu đã được thiết lập. Vui lòng đăng nhập lại.' } })
    } catch (requestError) {
      setError(authSecurityErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = 'mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#49BBBD] focus:ring-4 focus:ring-[#49BBBD]/15'
  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="change-password-title">
      <div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#49BBBD]/12 text-[#31999b]"><LockKeyhole size={20} /></span><div><h2 id="change-password-title" className="text-xl font-bold text-slate-950">{hasLocalPassword ? 'Đổi mật khẩu' : 'Thiết lập mật khẩu'}</h2><p className="mt-1 text-sm leading-6 text-slate-500">Sau khi cập nhật, GJob sẽ đăng xuất tài khoản để bảo vệ phiên làm việc.</p></div></div>
      <div className="mt-7 grid gap-5">
        {hasLocalPassword && <label className="text-sm font-semibold text-slate-800">Mật khẩu hiện tại<input id="current-password" type={showPasswords ? 'text' : 'password'} autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={fieldClass} /></label>}
        <label className="text-sm font-semibold text-slate-800">Mật khẩu mới<input id="new-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={fieldClass} /></label>
        <label className="text-sm font-semibold text-slate-800">Xác nhận mật khẩu mới<input id="confirm-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={fieldClass} /></label>
      </div>
      <button type="button" onClick={() => setShowPasswords((value) => !value)} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800">{showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}{showPasswords ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</button>
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <button disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1C1C1C] px-5 py-3 font-semibold text-white transition hover:bg-black disabled:opacity-60 sm:w-auto sm:min-w-48">{submitting && <Loader2 size={17} className="animate-spin" />} {hasLocalPassword ? 'Cập nhật mật khẩu' : 'Thiết lập mật khẩu'}</button>
    </form>
  )
}
