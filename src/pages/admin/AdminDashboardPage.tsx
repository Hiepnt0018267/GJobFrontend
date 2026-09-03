import { AlertCircle, BriefcaseBusiness, Clock3, FileText, Files, RefreshCw, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import MetricCard from '../../components/admin/MetricCard'
import StatusOverview, { type StatusMetric } from '../../components/admin/StatusOverview'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { adminDashboardService } from '../../services/adminDashboardService'
import type { AdminDashboardResponse } from '../../types/adminDashboard'
import { adminDashboardErrorMessage } from '../../utils/apiError'

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải dữ liệu tổng quan" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-slate-200" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-52 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  )
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section role="alert" className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200">
      <AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" />
      <h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải dữ liệu tổng quan.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      <button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
        <RefreshCw size={16} aria-hidden="true" />
        Thử lại
      </button>
    </section>
  )
}

function getUserMetrics(data: AdminDashboardResponse): StatusMetric[] {
  return [
    { label: 'Ứng viên', value: data.users.candidates },
    { label: 'Nhà tuyển dụng', value: data.users.recruiters },
    { label: 'Quản trị viên', value: data.users.admins },
    { label: 'Đang hoạt động', value: data.users.active, tone: 'success' },
    { label: 'Bị vô hiệu hóa', value: data.users.inactive, tone: 'danger' },
  ]
}

function getJobMetrics(data: AdminDashboardResponse): StatusMetric[] {
  return [
    { label: 'Chờ duyệt', value: data.jobs.pending, tone: 'pending' },
    { label: 'Đã duyệt', value: data.jobs.approved, tone: 'success' },
    { label: 'Từ chối', value: data.jobs.rejected, tone: 'danger' },
    { label: 'Đã đóng', value: data.jobs.closed },
  ]
}

function getApplicationMetrics(data: AdminDashboardResponse): StatusMetric[] {
  return [
    { label: 'Đã gửi', value: data.applications.submitted },
    { label: 'Đang xem xét', value: data.applications.reviewing, tone: 'pending' },
    { label: 'Danh sách ngắn', value: data.applications.shortlisted, tone: 'success' },
    { label: 'Bị từ chối', value: data.applications.rejected, tone: 'danger' },
    { label: 'Đã tuyển', value: data.applications.hired, tone: 'success' },
    { label: 'Đã rút', value: data.applications.withdrawn },
  ]
}

function getTemplateMetrics(data: AdminDashboardResponse): StatusMetric[] {
  return [
    { label: 'Tổng mẫu', value: data.cv_templates.total },
    { label: 'Đang hoạt động', value: data.cv_templates.active, tone: 'success' },
    { label: 'Ngừng hoạt động', value: data.cv_templates.inactive, tone: 'danger' },
  ]
}

export default function AdminDashboardPage() {
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
  const userMetrics = dashboard ? getUserMetrics(dashboard) : []
  const jobMetrics = dashboard ? getJobMetrics(dashboard) : []
  const applicationMetrics = dashboard ? getApplicationMetrics(dashboard) : []
  const templateMetrics = dashboard ? getTemplateMetrics(dashboard) : []

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Tổng quan hệ thống</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Theo dõi hoạt động và dữ liệu chính của GJob.</p>
          </div>
          <button type="button" onClick={refreshDashboard} disabled={!dashboard} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <RefreshCw size={16} aria-hidden="true" />
            Làm mới
          </button>
        </header>

        {!dashboard && !error && <DashboardSkeleton />}
        {error && <DashboardError message={error} onRetry={refreshDashboard} />}

        {dashboard && (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chỉ số tổng quan">
              <MetricCard title="Người dùng" value={dashboard.users.total} description="Tất cả tài khoản trong hệ thống" icon={Users} tone="blue" to="/admin/users" />
              <MetricCard title="Tin tuyển dụng" value={dashboard.jobs.total} description="Bao gồm mọi trạng thái đăng tuyển" icon={BriefcaseBusiness} tone="violet" to="/admin/jobs" />
              <MetricCard title="Đơn ứng tuyển" value={dashboard.applications.total} description="Toàn bộ đơn đã được tạo" icon={FileText} tone="emerald" to="/admin/applications" />
              <MetricCard title="CV" value={dashboard.cvs.total} description="Hồ sơ CV của ứng viên" icon={Files} tone="slate" to="/admin/cvs" />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <StatusOverview title="Người dùng" description="Phân bố tài khoản và trạng thái hoạt động." metrics={userMetrics} />
              <StatusOverview title="Tin tuyển dụng" description="Tin chờ duyệt được làm nổi bật để tiện theo dõi." metrics={jobMetrics} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.85fr)]">
              <StatusOverview title="Đơn ứng tuyển" description="Tình trạng hiện tại của các đơn trong hệ thống." metrics={applicationMetrics} />
              <StatusOverview title="Mẫu CV" description="Tình trạng danh mục mẫu CV hiện có." metrics={templateMetrics} />
            </section>

            {dashboard.jobs.pending > 0 && (
              <aside className="flex flex-col gap-3 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-950 ring-1 ring-amber-200 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                <Clock3 size={19} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                <p><span className="font-semibold">{dashboard.jobs.pending.toLocaleString('vi-VN')} tin đang chờ duyệt.</span> Các tin này cần được xem xét trước khi được công khai cho ứng viên.</p>
                </div>
                <Link to="/admin/jobs?status=PENDING" className="shrink-0 font-semibold text-amber-900 underline decoration-amber-400 underline-offset-4 hover:text-amber-950">Quản lý tin tuyển dụng</Link>
              </aside>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
