import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import authLoginBanner from '../../assets/auth/auth_login_banner.jpg'
import authRegisterBanner from '../../assets/auth/auth_register_banner.jpg'
import GJobLogo from '../brand/GJobLogo'

type AuthVisualPanelProps = {
  isLogin: boolean
}

type MotionStyle = CSSProperties & {
  '--auth-image-x': string
  '--auth-image-y': string
  '--auth-image-scale': number
  '--auth-content-x': string
  '--auth-content-y': string
  '--auth-spot-x': string
  '--auth-spot-y': string
  '--auth-spot-opacity': number
}

const initialMotionStyle: MotionStyle = {
  '--auth-image-x': '0px',
  '--auth-image-y': '0px',
  '--auth-image-scale': 1,
  '--auth-content-x': '0px',
  '--auth-content-y': '0px',
  '--auth-spot-x': '50%',
  '--auth-spot-y': '50%',
  '--auth-spot-opacity': 0,
}

export default function AuthVisualPanel({ isLogin }: AuthVisualPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current)
  }, [])

  const updateMotion = (updates: Partial<Record<keyof MotionStyle, string>>) => {
    const panel = panelRef.current
    if (!panel) return
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = window.requestAnimationFrame(() => {
      Object.entries(updates).forEach(([property, value]) => panel.style.setProperty(property, value))
    })
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const horizontal = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5))
    const vertical = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5))

    updateMotion({
      '--auth-image-x': `${horizontal * -18}px`,
      '--auth-image-y': `${vertical * -14}px`,
      '--auth-image-scale': '1.035',
      '--auth-content-x': `${horizontal * 8}px`,
      '--auth-content-y': `${vertical * 6}px`,
      '--auth-spot-x': `${(horizontal + 0.5) * 100}%`,
      '--auth-spot-y': `${(vertical + 0.5) * 100}%`,
      '--auth-spot-opacity': '1',
    })
  }

  const resetMotion = () => updateMotion({
    '--auth-image-x': '0px',
    '--auth-image-y': '0px',
    '--auth-image-scale': '1',
    '--auth-content-x': '0px',
    '--auth-content-y': '0px',
    '--auth-spot-x': '50%',
    '--auth-spot-y': '50%',
    '--auth-spot-opacity': '0',
  })

  const activeImageTransform = 'translate3d(var(--auth-image-x), var(--auth-image-y), 0) scale(var(--auth-image-scale))'
  const inactiveImageTransform = 'translate3d(0, 0, 0) scale(1.05)'

  return (
    <div
      ref={panelRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetMotion}
      style={initialMotionStyle}
      className="group/auth-visual relative hidden min-h-screen select-none overflow-hidden bg-slate-900 lg:block lg:w-1/2"
      aria-label={isLogin ? 'Không gian nghề nghiệp GJob' : 'Cộng đồng nghề nghiệp GJob'}
    >
      <img
        src={authLoginBanner}
        alt="GJob Đăng nhập"
        draggable={false}
        style={{ transform: isLogin ? activeImageTransform : inactiveImageTransform }}
        className={`absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] object-cover object-center transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none motion-reduce:transition-none ${
          isLogin ? 'opacity-100 group-hover/auth-visual:saturate-[1.04]' : 'pointer-events-none opacity-0'
        }`}
      />

      <img
        src={authRegisterBanner}
        alt="GJob Đăng ký"
        draggable={false}
        style={{ transform: !isLogin ? activeImageTransform : inactiveImageTransform }}
        className={`absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] object-cover object-center transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none motion-reduce:transition-none ${
          !isLogin ? 'opacity-100 group-hover/auth-visual:saturate-[1.04]' : 'pointer-events-none opacity-0'
        }`}
      />

      <div className="pointer-events-none absolute inset-0 bg-[#49BBBD]/40 mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1b5e60]/95 via-[#49BBBD]/35 to-[#49BBBD]/15" />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200 motion-reduce:hidden"
        style={{
          opacity: 'var(--auth-spot-opacity)',
          background: 'radial-gradient(circle at var(--auth-spot-x) var(--auth-spot-y), rgba(255,255,255,0.24), transparent 34%)',
        }}
      />

      <Link
        to="/"
        className="absolute left-8 top-8 z-10 flex items-center rounded-2xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b5e60] motion-reduce:transform-none"
      >
        <GJobLogo className="h-7 w-auto" />
      </Link>

      <div
        className="pointer-events-none absolute bottom-10 left-10 right-10 z-10 text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none motion-reduce:transition-none"
        style={{ transform: 'translate3d(var(--auth-content-x), var(--auth-content-y), 0)' }}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 backdrop-blur-md">
          <span className="text-[11px] font-medium text-teal-100">
            {isLogin ? 'Nền tảng tuyển dụng thông minh' : 'Gia nhập cộng đồng GJob'}
          </span>
        </div>
        <h2 className="mb-2 text-2xl font-bold leading-tight drop-shadow-md xl:text-3xl">
          {isLogin ? 'Khám phá cơ hội nghề nghiệp hàng đầu' : 'Khởi đầu tương lai sự nghiệp của bạn'}
        </h2>
        <p className="max-w-md text-xs leading-relaxed text-white/85 drop-shadow-sm xl:text-sm">
          {isLogin
            ? 'Kết nối ứng viên tài năng với hơn 2.000+ doanh nghiệp uy tín trên toàn quốc.'
            : 'Tạo hồ sơ chuyên nghiệp và nhận gợi ý việc làm phù hợp nhất bằng công nghệ AI.'}
        </p>
      </div>
    </div>
  )
}
