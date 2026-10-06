import { useEffect, useRef, type FormEvent } from 'react'
import { ArrowRight, BriefcaseBusiness, FilePlus2, Globe, GraduationCap, LayoutDashboard, MapPin, Plus, Search, Sparkles, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { User } from '../../types/auth'

type Props = {
  user: User | null
  keyword: string
  location: string
  onKeywordChange: (value: string) => void
  onLocationChange: (value: string) => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
}

type QuickFilter = {
  label: string
  icon?: typeof Globe
  to: string
}

const QUICK_FILTERS: QuickFilter[] = [
  { label: 'Làm từ xa (Remote)', icon: Globe, to: '/jobs?work_mode=REMOTE' },
  { label: 'Thực tập sinh', icon: GraduationCap, to: '/jobs?level=INTERN' },
  { label: 'Chưa cần kinh nghiệm', to: '/jobs?experience_requirement=NO_EXPERIENCE' },
  { label: 'Lương thỏa thuận', to: '/jobs?salary=NEGOTIABLE' },
  { label: 'Frontend', to: '/jobs?search=Frontend' },
  { label: 'Backend', to: '/jobs?search=Backend' },
  { label: 'ReactJS', to: '/jobs?search=ReactJS' },
]

export default function PersonalizedHomeHero({
  user,
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  onSearch,
}: Props) {
  const navigate = useNavigate()
  const keywordInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: '/' focuses the search input when not already typing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault()
        keywordInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const actions = !user
    ? []
    : user.role === 'RECRUITER'
      ? [
          { to: '/recruiter', label: 'Vào Dashboard tuyển dụng', icon: LayoutDashboard, primary: false },
          { to: '/recruiter/jobs/create', label: 'Đăng tin tuyển dụng', icon: Plus, primary: true },
        ]
      : user.role === 'CANDIDATE'
        ? [
            { to: '/jobs', label: 'Khám phá việc làm ngay', icon: BriefcaseBusiness, primary: true },
            { to: '/candidate/cvs/templates', label: 'Tạo CV chuyên nghiệp', icon: FilePlus2, primary: false },
          ]
        : [{ to: '/admin', label: 'Trang quản trị', icon: LayoutDashboard, primary: true }]

  const greeting =
    user?.role === 'CANDIDATE' || user?.role === 'RECRUITER'
      ? `Chào mừng trở lại, ${user.full_name || 'bạn'}`
      : null

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 text-white sm:py-28">
      {/* Ambient lighting meshes */}
      <div
        className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-36 left-1/4 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {greeting && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {greeting}
          </div>
        )}

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Kiến tạo cơ hội nghề nghiệp <span className="text-blue-400">bứt phá</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Tiếp cận hàng nghìn vị trí tuyển dụng xác thực, kết nối trực tiếp với doanh nghiệp hàng đầu và mở ra hành
          trình sự nghiệp vững chắc.
        </p>

        {/* Search Bar with 60:40 ratio and clear buttons */}
        <form
          onSubmit={onSearch}
          className="mx-auto mt-9 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/10 sm:flex-row sm:items-center sm:p-2.5"
          role="search"
          aria-label="Tìm kiếm việc làm"
        >
          <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-left transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 sm:flex-[1.4]">
            <Search size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Từ khóa tìm kiếm</span>
            <input
              ref={keywordInputRef}
              type="text"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Vị trí, kỹ năng, công ty..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => onKeywordChange('')}
                className="btn-press flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700"
                aria-label="Xóa từ khóa"
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
            <kbd className="hidden rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline-block">
              /
            </kbd>
          </div>

          <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-left transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 sm:flex-1">
            <MapPin size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Địa điểm làm việc</span>
            <input
              type="text"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              placeholder="Hà Nội, TP.HCM..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            {location && (
              <button
                type="button"
                onClick={() => onLocationChange('')}
                className="btn-press flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700"
                aria-label="Xóa địa điểm"
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Search size={16} />
            Tìm việc
          </button>
        </form>

        {/* Real Quick Filter Pills mapping to active query parameters */}
        {!user ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
              <Sparkles size={13} className="text-amber-400" aria-hidden="true" />
              Lọc nhanh:
            </span>
            {QUICK_FILTERS.map((filter) => {
              const Icon = filter.icon
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => navigate(filter.to)}
                  className="btn-press inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-slate-200 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {Icon && <Icon size={12} className="text-blue-400" aria-hidden="true" />}
                  {filter.label}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {actions.map(({ to, label, icon: Icon, primary }) => (
              <Link
                key={to}
                to={to}
                className={`btn-press inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  primary
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30'
                    : 'border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {label}
                {primary && <ArrowRight size={16} />}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
