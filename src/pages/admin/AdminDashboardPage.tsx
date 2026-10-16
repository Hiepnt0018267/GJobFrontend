import { AlertCircle, BriefcaseBusiness, Clock3, FileText, Files, RefreshCw, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AdminApplicationChart,
  AdminJobChart,
  AdminTemplateChart,
  AdminUserChart,
} from '../../components/admin/AdminDashboardCharts'
import MetricCard from '../../components/admin/MetricCard'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { adminDashboardService } from '../../services/adminDashboardService'
import type { AdminDashboardResponse } from '../../types/adminDashboard'
import { adminDashboardErrorMessage } from '../../utils/apiError'

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải dữ liệu tổng quan" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 rounded-2xl skeleton-shimmer" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 rounded-2xl skeleton-shimmer" />
        <div className="h-72 rounded-2xl skeleton-shimmer" />
      </div>
      <div className="h-52 rounded-2xl skeleton-shimmer" />
    </div>
  )
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section role="alert" className="rounded-2xl bg-[#F7F9FB] px-6 py-12 text-center border border-black/[0.04]">
      <AlertCircle className="mx-auto text-red-600" size={36} aria-hidden="true" />
      <h2 className="mt-4 text-base font-semibold text-[#1C1C1C] font-[Inter,sans-serif]">Không thể tải dữ liệu tổng quan.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      <button type="button" onClick={onRetry} className="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1C1C1C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]">
        <RefreshCw size={16} aria-hidden="true" />
        Thử lại
      </button>
    </section>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const refreshVersion = useDataRefreshVersion()
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let active = true

    Promise.resolve()
      .then(() => {
        if (active) {
          setError(null)
          setDashboard(null)
        }
        return adminDashboardService.getAdminDashboard()
      })
      .then((data) => { if (active) setDashboard(data) })
      .catch((requestError: unknown) => { if (active) setError(adminDashboardErrorMessage(requestError)) })

    return () => { active = false }
  }, [refreshVersion, requestVersion])

  const refreshDashboard = () => setRequestVersion((version) => version + 1)
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 font-[Inter,sans-serif]">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1C1C1C]">
              Tổng quan hệ thống
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi hoạt động, trạng thái tài khoản và dữ liệu toàn sàn GJob.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshDashboard}
            disabled={!dashboard}
            className="btn-press inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/[0.06] bg-white px-4 py-2 text-xs sm:text-sm font-medium text-[#1C1C1C] shadow-2xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Làm mới
          </button>
        </header>

        {!dashboard && !error && <DashboardSkeleton />}
        {error && <DashboardError message={error} onRetry={refreshDashboard} />}

        {dashboard && (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chỉ số tổng quan">
              <MetricCard title="Người dùng" value={dashboard.users.total} description="Tất cả tài khoản trong hệ thống" icon={Users} surface="mist" to="/admin/users" />
              <MetricCard title="Tin tuyển dụng" value={dashboard.jobs.total} description="Bao gồm mọi trạng thái đăng tuyển" icon={BriefcaseBusiness} surface="sky" to="/admin/jobs" />
              <MetricCard title="Đơn ứng tuyển" value={dashboard.applications.total} description="Toàn bộ đơn đã được tạo" icon={FileText} surface="mist" to="/admin/applications" />
              <MetricCard title="CV" value={dashboard.cvs.total} description="Hồ sơ CV của ứng viên" icon={Files} surface="sky" to="/admin/cvs" />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <AdminUserChart data={dashboard.users} onNavigate={navigate} />
              <AdminJobChart data={dashboard.jobs} onNavigate={navigate} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.85fr)]">
              <AdminApplicationChart data={dashboard.applications} onNavigate={navigate} />
              <AdminTemplateChart data={dashboard.cv_templates} onNavigate={navigate} />
            </section>

            {dashboard.jobs.pending > 0 && (
              <aside className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5 text-sm text-amber-950 shadow-xs sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <Clock3 size={20} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                  <p>
                    <span className="font-bold text-amber-950">{dashboard.jobs.pending.toLocaleString('vi-VN')} tin đang chờ duyệt.</span>{' '}
                    Các tin này cần được xem xét và phê duyệt trước khi công khai cho ứng viên trên sàn.
                  </p>
                </div>
                <Link
                  to="/admin/jobs?status=PENDING"
                  className="btn-press shrink-0 inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-amber-700"
                >
                  Xử lý ngay →
                </Link>
              </aside>
            )}
          </div>
        )}
    </main>
  )
}
