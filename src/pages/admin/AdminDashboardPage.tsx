import { Link } from 'react-router-dom'
import {
  Users, ShieldCheck, Settings, Activity,
  Zap, LogOut, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const ADMIN_SECTIONS = [
  { icon: Users,       label: 'Quản lý người dùng', desc: 'Xem, khóa, phân quyền tài khoản',      to: '/admin/users',    color: 'bg-blue-50 text-blue-600' },
  { icon: ShieldCheck, label: 'Phân quyền',           desc: 'Quản lý role và permission',            to: '/admin/roles',    color: 'bg-violet-50 text-violet-600' },
  { icon: Activity,    label: 'Activity Log',          desc: 'Theo dõi hoạt động hệ thống',           to: '/admin/logs',     color: 'bg-emerald-50 text-emerald-600' },
  { icon: Settings,    label: 'Cấu hình hệ thống',    desc: 'Thiết lập chung của platform',          to: '/admin/settings', color: 'bg-amber-50 text-amber-600' },
]

export default function AdminDashboardPage() {
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
            <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
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
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-red-200" />
            <p className="text-sm text-red-200">Quản trị viên hệ thống</p>
          </div>
          <h1 className="text-xl font-bold mb-1">{user?.full_name}</h1>
          <p className="text-sm text-red-100 opacity-80">{user?.email}</p>
        </div>

        {/* Security warning */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Lưu ý bảo mật:</span>{' '}
            Bạn đang đăng nhập với quyền Admin. Mọi hành động đều được ghi log.
            Chỉ thực hiện các thao tác cần thiết và không chia sẻ phiên đăng nhập.
          </p>
        </div>

        {/* Admin sections */}
        <section aria-label="Chức năng quản trị">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Chức năng quản trị</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADMIN_SECTIONS.map(({ icon: Icon, label, desc, to, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming soon */}
        <div className="text-center py-6">
          <p className="text-xs text-slate-400">
            Các chức năng quản trị đầy đủ sẽ được triển khai ở Task tiếp theo.
          </p>
        </div>
      </main>
    </div>
  )
}
