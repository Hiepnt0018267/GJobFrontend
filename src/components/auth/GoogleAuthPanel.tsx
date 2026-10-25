import { useContext, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthContext } from '../../contexts/AuthContext'
import type { LoginResponse } from '../../types/auth'
import { authService } from '../../services/authService'
import type { GoogleLinkRequiredResponse, GoogleRoleSelectionResponse, UserRole } from '../../types/auth'
import { getApiErrorCode } from '../../utils/apiError'
import { requestRecruiterOnboarding } from '../../utils/recruiterOnboarding'

type CredentialResponse = { credential?: string }
type GoogleIdApi = {
  initialize(config: { client_id: string; callback: (response: CredentialResponse) => void }): void
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void
}
declare global { interface Window { google?: { accounts: { id: GoogleIdApi } } } }

let sdkPromise: Promise<void> | null = null
const ignoreAuthSession: (response: LoginResponse) => void = () => undefined
function loadGoogleSdk(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve()
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-gjob-google-gis]')
    const script = existing ?? document.createElement('script')
    const onLoad = () => resolve()
    const onError = () => reject(new Error('Google Identity Services unavailable'))
    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })
    if (!existing) {
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.dataset.gjobGoogleGis = 'true'
      document.head.appendChild(script)
    }
  }).catch((error) => { sdkPromise = null; throw error })
  return sdkPromise!
}

const googleError = (error: unknown) => {
  const code = getApiErrorCode(error)
  const messages: Record<string, string> = {
    GOOGLE_TOKEN_INVALID: 'Phiên xác thực Google không hợp lệ hoặc đã hết hạn.',
    GOOGLE_EMAIL_NOT_VERIFIED: 'Google chưa xác minh địa chỉ email này.',
    GOOGLE_ADMIN_LINK_NOT_ALLOWED: 'Tài khoản quản trị viên không thể đăng nhập bằng Google.',
    GOOGLE_ONBOARDING_TOKEN_EXPIRED: 'Phiên đăng ký Google đã hết hạn. Vui lòng thử lại.',
    GOOGLE_ONBOARDING_TOKEN_USED: 'Phiên đăng ký Google đã được sử dụng.',
    GOOGLE_LINK_TOKEN_EXPIRED: 'Phiên liên kết Google đã hết hạn. Vui lòng thử lại.',
    GOOGLE_LINK_TOKEN_USED: 'Google đã được liên kết bằng phiên này.',
    ACCOUNT_DEACTIVATED: 'Tài khoản đã bị vô hiệu hóa.',
  }
  return messages[code] ?? 'Không thể tiếp tục với Google. Vui lòng thử lại.'
}

export default function GoogleAuthPanel({ sessionLink = false }: { sessionLink?: boolean }) {
  const auth = useContext(AuthContext)
  const acceptAuthSession = auth?.acceptAuthSession ?? ignoreAuthSession
  const buttonRef = useRef<HTMLDivElement>(null)
  const activeCredential = useRef<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [onboarding, setOnboarding] = useState<GoogleRoleSelectionResponse | null>(null)
  const [linking, setLinking] = useState<GoogleLinkRequiredResponse | null>(null)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Exclude<UserRole, 'ADMIN'>>('CANDIDATE')
  const [password, setPassword] = useState('')
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  useEffect(() => {
    let active = true
    if (!clientId) return
    loadGoogleSdk().then(() => {
      if (!active || !buttonRef.current || !window.google) return
      window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }) => {
        if (!credential || activeCredential.current === credential) return
        activeCredential.current = credential
        setLoading(true); setError('')
        try {
          const response = await authService.google(credential)
          if (!active) return
          if (response.status === 'AUTHENTICATED') acceptAuthSession(response)
          else if (response.status === 'ROLE_SELECTION_REQUIRED') {
            setOnboarding(response); setFullName(response.profile.suggested_full_name)
          } else if (response.status === 'GOOGLE_ACCOUNT_LINK_REQUIRED') {
            if (sessionLink) acceptAuthSession(await authService.linkGoogleWithSession(response.link_token))
            else setLinking(response)
          }
          else setError('Tài khoản GJob với email này cần xác minh email trước khi liên kết Google.')
        } catch (requestError) { if (active) setError(googleError(requestError)) }
        finally { activeCredential.current = null; if (active) setLoading(false) }
      } })
      buttonRef.current.replaceChildren()
      const buttonWidth = Math.min(400, Math.floor(buttonRef.current.getBoundingClientRect().width))
      window.google.accounts.id.renderButton(buttonRef.current, { type: 'standard', theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: buttonWidth, locale: 'vi' })
    }).catch(() => { if (active) setError('Không thể tải dịch vụ đăng nhập Google.') })
    return () => { active = false }
  }, [acceptAuthSession, clientId, sessionLink])

  async function completeRegistration() {
    if (!onboarding || !fullName.trim()) return
    setLoading(true); setError('')
    try {
      const response = await authService.completeGoogleRegistration(onboarding.onboarding_token, role, fullName.trim())
      if (role === 'RECRUITER') requestRecruiterOnboarding(response.user.email)
      acceptAuthSession(response)
    }
    catch (requestError) { setError(googleError(requestError)) }
    finally { setLoading(false) }
  }

  async function completeLink() {
    if (!linking || !password) return
    setLoading(true); setError('')
    try { acceptAuthSession(await authService.linkGoogleWithPassword(linking.link_token, password)) }
    catch (requestError) { setError(googleError(requestError)) }
    finally { setLoading(false) }
  }

  return <section className="mt-4" aria-label="Đăng nhập bằng Google">
    <div className="mb-3 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />{sessionLink ? 'Liên kết đăng nhập' : 'hoặc'}<span className="h-px flex-1 bg-slate-200" /></div>
    <div className="flex min-h-11 w-full justify-center" ref={buttonRef} />
    {loading && <p className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Đang xác thực…</p>}
    {!clientId && <p role="status" className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Đăng nhập Google chưa được cấu hình.</p>}
    {error && <p role="alert" className="mt-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm leading-5 text-rose-700">{error}</p>}
    {onboarding && <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 p-4">
      <h3 className="font-bold text-slate-900">Hoàn tất đăng ký Google</h3>
      <input aria-label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
      <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setRole('CANDIDATE')} className={`rounded-xl border p-3 ${role === 'CANDIDATE' ? 'border-[#49BBBD] bg-[#49BBBD]/10' : 'border-slate-200'}`}>Ứng viên</button><button type="button" onClick={() => setRole('RECRUITER')} className={`rounded-xl border p-3 ${role === 'RECRUITER' ? 'border-[#49BBBD] bg-[#49BBBD]/10' : 'border-slate-200'}`}>Nhà tuyển dụng</button></div>
      <button type="button" disabled={loading || !fullName.trim()} onClick={completeRegistration} className="w-full rounded-xl bg-[#49BBBD] px-4 py-3 font-semibold text-white disabled:opacity-50">Tạo tài khoản</button>
    </div>}
    {linking && <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 p-4">
      <h3 className="font-bold text-slate-900">Xác nhận tài khoản GJob</h3><p className="text-sm text-slate-600">Email này đã có tài khoản GJob. Nhập mật khẩu hiện tại để liên kết Google an toàn.</p>
      <input type="password" autoComplete="current-password" aria-label="Mật khẩu hiện tại" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
      <button type="button" disabled={loading || !password} onClick={completeLink} className="w-full rounded-xl bg-[#49BBBD] px-4 py-3 font-semibold text-white disabled:opacity-50">Xác nhận và liên kết</button>
    </div>}
  </section>
}
