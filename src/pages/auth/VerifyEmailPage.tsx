import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthFlowShell from '../../components/auth/AuthFlowShell'
import { authService } from '../../services/authService'
import { authSecurityErrorMessage } from '../../utils/authSecurity'
import { getApiErrorCode } from '../../utils/apiError'

type VerificationState = {
  status: 'loading' | 'success' | 'error'
  message: string
  errorCode?: string
}

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [state, setState] = useState<VerificationState>(() => token
    ? { status: 'loading', message: 'Đang xác minh địa chỉ email…' }
    : { status: 'error', message: 'Liên kết xác minh không hợp lệ.' })

  useEffect(() => {
    let active = true
    if (!token) return () => { active = false }
    authService.verifyEmail(token)
      .then(() => { if (active) setState({ status: 'success', message: 'Email đã được xác minh. Bạn có thể đăng nhập ngay.' }) })
      .catch((error) => {
        if (active) {
          setState({
            status: 'error',
            message: authSecurityErrorMessage(error),
            errorCode: getApiErrorCode(error),
          })
        }
      })
    return () => { active = false }
  }, [token])

  return (
    <AuthFlowShell eyebrow="Xác minh email" title={state.status === 'success' ? 'Xác minh thành công' : state.status === 'error' ? 'Không thể xác minh' : 'Đang xử lý'} description="GJob chỉ kích hoạt tài khoản sau khi liên kết bảo mật hợp lệ được kiểm tra.">
      <div role="status" className={`flex items-start gap-3 rounded-2xl p-5 text-sm leading-6 ${state.status === 'success' ? 'bg-emerald-50 text-emerald-800' : state.status === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
        {state.status === 'loading' ? <Loader2 className="shrink-0 animate-spin" /> : state.status === 'success' ? <CheckCircle2 className="shrink-0" /> : <XCircle className="shrink-0" />}
        <p>{state.message}</p>
      </div>
      {state.status === 'success' && <Link to="/login" state={{ message: 'Email đã được xác minh. Hãy đăng nhập để tiếp tục.' }} className="mt-6 block rounded-2xl bg-[#49BBBD] px-5 py-3 text-center font-semibold text-white hover:bg-[#3da8aa]">Đăng nhập</Link>}
      {state.status === 'error' && (
        <div className="mt-6 grid gap-3">
          {state.errorCode === 'VERIFICATION_TOKEN_USED' && (
            <Link to="/login" className="block rounded-2xl bg-[#49BBBD] px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-[#3da8aa]">
              Đăng nhập
            </Link>
          )}
          <Link to="/verification-required" className="block text-center text-sm font-semibold text-[#31999b]">
            Yêu cầu gửi lại email xác minh
          </Link>
        </div>
      )}
    </AuthFlowShell>
  )
}
