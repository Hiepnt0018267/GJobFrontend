import { Link } from 'react-router-dom'
import {
  PlusCircle, Users, BarChart2, Eye, Clock,
  Zap, LogOut, MapPin, Briefcase,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const STATS = [
  { label: 'Tin đang đăng', value: '0',  icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
  { label: 'Ứng viên nhận',  value: '0',  icon: Users,     color: 'text-violet-600 bg-violet-50' },
  { label: 'Lượt xem',       value: '0',  icon: Eye,       color: 'text-amber-600 bg-amber-50' },
  { label: 'Hôm nay',        value: '0',  icon: Clock,     color: 'text-emerald-600 bg-emerald-50' },
]

const QUICK_ACTIONS = [
  { icon: PlusCircle, label: 'Đăng tin mới',    to: '/recruiter/jobs/new',   primary: true },
  { icon: Users,      label: 'Danh sách ứng viên', to: '/recruiter/candidates', primary: false },
  { icon: BarChart2,  label: 'Thống kê',          to: '/recruiter/analytics',  primary: false },
]

export default function RecruiterDashboardPage() {
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
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
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
        <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm text-violet-200 mb-1">Dashboard Nhà tuyển dụng 🏢</p>
          <h1 className="text-xl font-bold mb-1">{user?.full_name}</h1>
          <p className="text-sm text-violet-100">{user?.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(({ icon: Icon, label, to, primary }) => (
              <Link
                key={to}
                to={to}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  primary
                    ? 'bg-white text-violet-700 hover:bg-violet-50'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Icon size={12} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <section aria-label="Thống kê nhanh">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Tổng quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Empty jobs state */}
        <section
          aria-label="Tin tuyển dụng"
          className="bg-white rounded-xl border border-slate-200 p-8 text-center"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Chưa có tin tuyển dụng</h3>
          <p className="text-xs text-slate-400 mb-5">
            Đăng tin tuyển dụng đầu tiên để bắt đầu tìm kiếm ứng viên phù hợp.
          </p>
          <Link
            to="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={15} />
            Đăng tin ngay
          </Link>
        </section>

        {/* Coming soon note */}
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <MapPin size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Task 03+:</span>{' '}
            Quản lý tin tuyển dụng, xem ứng viên, và thống kê chi tiết sẽ được triển khai ở các task tiếp theo.
          </p>
        </div>
      </main>
    </div>
  )
}
