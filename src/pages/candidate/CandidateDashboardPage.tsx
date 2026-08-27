import { Link } from 'react-router-dom'
import {
  Search, FileText, Star, Briefcase, Bell, User,
  TrendingUp, MapPin, Zap, LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const QUICK_LINKS = [
  { icon: Search,   label: 'Tìm việc làm',  to: '/jobs',      color: 'bg-blue-50 text-blue-600' },
  { icon: FileText, label: 'Tạo CV',         to: '/cv',        color: 'bg-violet-50 text-violet-600' },
  { icon: Star,     label: 'Việc đã lưu',    to: '/saved',     color: 'bg-amber-50 text-amber-600' },
  { icon: Bell,     label: 'Thông báo',      to: '/notifs',    color: 'bg-emerald-50 text-emerald-600' },
]

const MOCK_JOBS = [
  { title: 'Frontend Developer', company: 'TechViet Corp', location: 'Hà Nội', match: 94 },
  { title: 'UI/UX Designer',     company: 'Creative Hub',   location: 'TP.HCM', match: 88 },
  { title: 'React Developer',    company: 'Startup Labs',   location: 'Remote', match: 81 },
]

export default function CandidateDashboardPage() {
  const { user, logout } = useAuth()
  const initial = user?.full_name.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 bg-blue-600 rounded-lg">
              <Zap size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-slate-900">
              G<span className="text-blue-600">Job</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
            >
              <LogOut size={14} />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <p className="text-sm text-blue-200 mb-1">Xin chào 👋</p>
          <h1 className="text-xl font-bold mb-1">{user?.full_name}</h1>
          <p className="text-sm text-blue-100">
            Ứng viên · {user?.email}
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs font-medium">
            <TrendingUp size={12} />
            3 việc làm phù hợp mới hôm nay
          </div>
        </div>

        {/* Quick links */}
        <section aria-label="Truy cập nhanh">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Truy cập nhanh</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map(({ icon: Icon, label, to, color }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-medium text-slate-700">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended jobs */}
        <section aria-label="Việc làm gợi ý">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Gợi ý AI cho bạn</h2>
            <Link to="/jobs" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {MOCK_JOBS.map((job) => (
              <div
                key={job.title}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">{job.company}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={10} /> {job.location}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">{job.match}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profile completion */}
        <section
          aria-label="Hồ sơ"
          className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {initial}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
            <p className="text-xs text-slate-500 mb-2">{user?.email}</p>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[40%] bg-blue-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Hồ sơ hoàn thành 40% — Cập nhật để tăng cơ hội</p>
          </div>
          <Link
            to="/candidate/profile"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <User size={13} />
            Cập nhật
          </Link>
        </section>
      </main>
    </div>
  )
}
