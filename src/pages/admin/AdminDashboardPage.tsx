import {
  Users, ShieldCheck, Settings, Activity,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/admin/AdminHeader'

const ADMIN_SECTIONS = [
  { icon: Users,       label: 'Quản lý người dùng', desc: 'Sẽ được mở ở Task 14.', color: 'bg-blue-50 text-blue-600' },
  { icon: ShieldCheck, label: 'Phân quyền',         desc: 'Sẽ được mở ở Task 14.', color: 'bg-violet-50 text-violet-600' },
  { icon: Activity,    label: 'Nhật ký hoạt động',  desc: 'Sẽ được mở ở Task 15.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Settings,    label: 'Cấu hình hệ thống',  desc: 'Sẽ được mở ở Task 15.', color: 'bg-amber-50 text-amber-600' },
]

export default function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

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
          <h1 className="text-xl font-bold mb-1">Dashboard quản trị viên</h1>
          <p className="text-sm text-red-100 opacity-80">{user?.full_name} · {user?.email}</p>
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
            {ADMIN_SECTIONS.map(({ icon: Icon, label, desc, color }) => (
              <article key={label} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </article>
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
