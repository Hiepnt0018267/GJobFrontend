import { ArrowRight, BriefcaseBusiness, LayoutDashboard, LogIn, MapPin, Plus, Search, UserPlus, UserRound } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '../../types/auth'

type Props = {
  user: User | null
  keyword: string
  location: string
  onKeywordChange: (value: string) => void
  onLocationChange: (value: string) => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
}

export default function PersonalizedHomeHero({ user, keyword, location, onKeywordChange, onLocationChange, onSearch }: Props) {
  const actions = !user
    ? [
        { to: '/login', label: 'Đăng nhập', icon: LogIn, primary: false },
        { to: '/register', label: 'Đăng ký', icon: UserPlus, primary: true },
      ]
    : user.role === 'RECRUITER'
      ? [
          { to: '/recruiter', label: 'Vào Dashboard tuyển dụng', icon: LayoutDashboard, primary: false },
          { to: '/recruiter/jobs/create', label: 'Đăng tin tuyển dụng', icon: Plus, primary: true },
        ]
      : user.role === 'CANDIDATE'
        ? [
            { to: '/jobs', label: 'Tìm việc ngay', icon: BriefcaseBusiness, primary: true },
            { to: '/candidate', label: 'Vào Dashboard', icon: LayoutDashboard, primary: false },
            { to: '/candidate/profile', label: 'Hồ sơ cá nhân', icon: UserRound, primary: false },
          ]
        : [
            { to: '/admin', label: 'Trang quản trị', icon: LayoutDashboard, primary: true },
          ]
  const greeting = user?.role === 'CANDIDATE' || user?.role === 'RECRUITER'
    ? `Chào, ${user.full_name || 'bạn'}`
    : null

  return <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 text-white sm:py-28">
    <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl" aria-hidden="true" />
    <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
    <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
      {greeting && <p className="mb-4 text-sm font-semibold text-blue-200">{greeting}</p>}
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Kiến tạo cơ hội nghề nghiệp <span className="text-blue-300">phù hợp với bạn</span></h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100 sm:text-xl">Khám phá vị trí phù hợp, kết nối với doanh nghiệp và mở ra bước tiếp theo cho sự nghiệp của bạn.</p>
      <form onSubmit={onSearch} className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:p-3" role="search" aria-label="Tìm kiếm việc làm">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-left"><Search size={18} className="shrink-0 text-slate-400" aria-hidden="true" /><span className="sr-only">Từ khóa tìm kiếm</span><input type="text" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} placeholder="Kỹ năng, vị trí, công ty..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" /></label>
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-left"><MapPin size={18} className="shrink-0 text-slate-400" aria-hidden="true" /><span className="sr-only">Địa điểm</span><input type="text" value={location} onChange={(event) => onLocationChange(event.target.value)} placeholder="Địa điểm" className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" /></label>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"><Search size={16} />Tìm việc</button>
      </form>
      {/* impeccable-disable-next-line gray-on-color: primary and secondary CTA variants are independently colored in one JSX expression. */}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">{actions.map(({ to, label, icon: Icon, primary }) => <Link key={to} to={to} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${primary ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'}`}><Icon size={17} />{label}{primary && <ArrowRight size={16} />}</Link>)}</div>
    </div>
  </section>
}
