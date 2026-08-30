import {
  AlertCircle, BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2,
  ClipboardClock, DoorClosed, FilePenLine, LogOut, MapPin, RefreshCw, Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { recruiterService } from '../../services/recruiterService'
import type { RecruiterDashboardSummary, RecruiterProfile } from '../../types/recruiter'
import { recruiterErrorMessage } from '../../utils/apiError'

type DashboardData = { profile: RecruiterProfile; summary: RecruiterDashboardSummary }
const emptySummary: RecruiterDashboardSummary = { total_jobs: 0, pending_jobs: 0, approved_jobs: 0, rejected_jobs: 0, closed_jobs: 0 }

function Skeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}</div>
}

export default function RecruiterDashboardPage() {
  const { user, logout } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const initial = (data?.profile.full_name ?? user?.full_name ?? '?').charAt(0).toUpperCase()

  useEffect(() => {
    let active = true
    Promise.resolve()
      .then(() => {
        if (active) setError(null)
        return Promise.all([recruiterService.getMyRecruiterProfile(), recruiterService.getRecruiterDashboard()])
      })
      .then(([profile, summary]) => { if (active) setData({ profile, summary }) })
      .catch((requestError) => { if (active) setError(recruiterErrorMessage(requestError)) })
    return () => { active = false }
  }, [retry])

  const summary = data?.summary ?? emptySummary
  const cards = [
    { label: 'Tổng tin tuyển dụng', value: summary.total_jobs, icon: BriefcaseBusiness, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Đang chờ duyệt', value: summary.pending_jobs, icon: ClipboardClock, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Đã duyệt', value: summary.approved_jobs, icon: BadgeCheck, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Đã đóng', value: summary.closed_jobs, icon: DoorClosed, tone: 'bg-slate-100 text-slate-700' },
  ]

  return <div className="min-h-screen bg-slate-50">
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="GJob - Trang chủ">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600"><Zap size={15} className="text-white" strokeWidth={2.5} /></span>
          <span className="text-base font-bold text-slate-900">G<span className="text-blue-600">Job</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white" aria-label={data?.profile.full_name ?? user?.full_name}>{initial}</span>
          <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"><LogOut size={14} /><span className="hidden sm:inline">Đăng xuất</span></button>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
      <section className="rounded-2xl bg-slate-900 px-6 py-8 text-white sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Xin chào, {data?.profile.full_name ?? user?.full_name ?? 'nhà tuyển dụng'}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Quản lý hoạt động tuyển dụng và hoàn thiện hồ sơ doanh nghiệp của bạn tại GJob.</p>
      </section>

      <section aria-label="Tổng quan tuyển dụng">
        {!data && !error ? <Skeleton /> : error ? <div role="alert" className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-500" size={32} /><h2 className="mt-4 text-lg font-bold text-slate-900">Không thể tải dashboard</h2><p className="mt-2 text-sm text-slate-500">{error}</p><button onClick={() => setRetry((value) => value + 1)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={15} />Thử lại</button></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></span><p className="mt-5 text-3xl font-bold tabular-nums text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></article>)}</div>}
      </section>

      {data && <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h2 className="text-lg font-bold text-slate-900">Thông tin công ty</h2><p className="mt-1 text-sm text-slate-500">Thông tin hiển thị trong hồ sơ nhà tuyển dụng.</p></div><Link to="/recruiter/profile" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Xem hồ sơ</Link></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><div className="flex gap-3"><Building2 size={18} className="mt-0.5 text-blue-600" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Công ty</p><p className="mt-1 text-sm font-medium text-slate-900">{data.profile.company_name || 'Chưa cập nhật'}</p></div></div><div className="flex gap-3"><MapPin size={18} className="mt-0.5 text-blue-600" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Địa chỉ</p><p className="mt-1 text-sm font-medium text-slate-900">{data.profile.company_address || 'Chưa cập nhật'}</p></div></div></div></article>
        <aside className="rounded-2xl bg-blue-50 p-6 ring-1 ring-blue-100"><FilePenLine size={22} className="text-blue-600" /><h2 className="mt-4 text-base font-bold text-blue-950">Hoàn thiện hồ sơ doanh nghiệp</h2><p className="mt-2 text-sm leading-6 text-blue-900">Bổ sung thông tin công ty để chuẩn bị cho các tính năng tuyển dụng ở Task 06.</p><Link to="/recruiter/profile/edit" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">Cập nhật hồ sơ <CheckCircle2 size={16} /></Link></aside>
      </section>}
    </main>
  </div>
}
