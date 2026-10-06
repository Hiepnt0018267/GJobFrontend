import { AlertCircle, BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2, ClipboardClock, DoorClosed, FilePenLine, Plus, RefreshCw, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { recruiterService } from '../../services/recruiterService'
import type { RecruiterDashboardSummary, RecruiterProfile } from '../../types/recruiter'
import { recruiterErrorMessage } from '../../utils/apiError'

type DashboardData = { profile: RecruiterProfile; summary: RecruiterDashboardSummary }
const emptySummary: RecruiterDashboardSummary = { total_jobs: 0, pending_jobs: 0, approved_jobs: 0, rejected_jobs: 0, closed_jobs: 0 }

function Skeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải dữ liệu tổng quan" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-36 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-2xl skeleton-shimmer" />
        <div className="h-64 rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  )
}

function StatusRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  const width = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 tabular-nums">{width}%</span>
          <span className="font-bold tabular-nums text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">{value}</span>
        </div>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-500 ease-out ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export default function RecruiterDashboardPage() {
  const refreshVersion = useDataRefreshVersion()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

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
  }, [refreshVersion, retry])

  const summary = data?.summary ?? emptySummary
  const cards = [
    { label: 'Tổng tin tuyển dụng', value: summary.total_jobs, icon: BriefcaseBusiness, tone: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60', to: '/recruiter/jobs' },
    { label: 'Đang chờ duyệt', value: summary.pending_jobs, icon: ClipboardClock, tone: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60', to: '/recruiter/jobs?status=PENDING' },
    { label: 'Đã duyệt', value: summary.approved_jobs, icon: BadgeCheck, tone: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60', to: '/recruiter/jobs?status=APPROVED' },
    { label: 'Đã đóng', value: summary.closed_jobs, icon: DoorClosed, tone: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/60', to: '/recruiter/jobs?status=CLOSED' },
  ]
  const actionItems = [
    summary.pending_jobs > 0 ? { count: summary.pending_jobs, label: 'tin đang chờ quản trị viên duyệt', to: '/recruiter/jobs?status=PENDING', icon: ClipboardClock, tone: 'text-amber-700 bg-amber-50 ring-1 ring-amber-200/60' } : null,
    summary.rejected_jobs > 0 ? { count: summary.rejected_jobs, label: 'tin bị từ chối cần xem và chỉnh sửa', to: '/recruiter/jobs?status=REJECTED', icon: XCircle, tone: 'text-red-700 bg-red-50 ring-1 ring-red-200/60' } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl font-[Plus_Jakarta_Sans,sans-serif]">
            Tổng quan tuyển dụng
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Theo dõi hiệu quả chiến dịch tuyển dụng và các đầu việc cần xử lý kịp thời.
          </p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md hover:shadow-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Plus size={18} aria-hidden="true" />
          Đăng tin tuyển dụng
        </Link>
      </section>

      {!data && !error ? (
        <Skeleton />
      ) : error && !data ? (
        <section role="alert" className="rounded-2xl bg-white p-8 text-center shadow-premium border border-slate-200/80">
          <AlertCircle className="mx-auto text-red-500" size={36} />
          <h2 className="mt-4 text-lg font-bold text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">Không thể tải tổng quan tuyển dụng</h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Thử lại
          </button>
        </section>
      ) : (
        <>
          {data && error && (
            <div role="status" aria-live="polite" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Không thể cập nhật dữ liệu mới nhất. {error}
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chỉ số tuyển dụng">
            {cards.map(({ label, value, icon: Icon, tone, to }) => (
              <Link
                key={label}
                to={to}
                className="group motion-card rounded-2xl bg-white p-5 shadow-premium border border-slate-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${tone}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Chi tiết →
                  </span>
                </div>
                <p className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">
                  {value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-500">{label}</p>
              </Link>
            ))}
          </section>

          {data && (
            <section>
              <article className="rounded-2xl bg-white p-6 shadow-premium border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">
                      Việc cần xử lý
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">Ưu tiên xử lý các tin cần phản hồi hoặc cập nhật.</p>
                  </div>
                  {actionItems.length > 0 && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-200/80">
                      {actionItems.length} việc cần làm
                    </span>
                  )}
                </div>

                {actionItems.length > 0 ? (
                  <div className="mt-5 divide-y divide-slate-100">
                    {actionItems.map(({ count, label, to, icon: Icon, tone }) => (
                      <Link
                        key={to}
                        to={to}
                        className="group flex items-center gap-3.5 py-4 first:pt-0 last:pb-0 transition-colors hover:text-blue-700"
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                          <Icon size={17} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-bold tabular-nums text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">{count}</span>
                          <span className="ml-1.5 text-sm text-slate-600">{label}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition-transform duration-150 group-hover:translate-x-0.5">
                          Xem tin →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 px-4 py-4 text-sm text-emerald-900">
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>Hiện không có tin nào cần xử lý. Tất cả đều hoạt động ổn định!</span>
                  </div>
                )}
              </article>
            </section>
          )}

          {data && (
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-2xl bg-white p-6 shadow-premium border border-slate-200/80">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">
                      Trạng thái tin tuyển dụng
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">Phân bổ theo trạng thái hiện tại của các tin bạn đã tạo.</p>
                  </div>
                  <Link
                    to="/recruiter/jobs"
                    className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
                  >
                    Xem tất cả
                  </Link>
                </div>
                <div className="mt-6 space-y-5">
                  <StatusRow label="Chờ duyệt" value={summary.pending_jobs} total={summary.total_jobs} tone="bg-amber-500" />
                  <StatusRow label="Đã duyệt" value={summary.approved_jobs} total={summary.total_jobs} tone="bg-emerald-500" />
                  <StatusRow label="Bị từ chối" value={summary.rejected_jobs} total={summary.total_jobs} tone="bg-red-500" />
                  <StatusRow label="Đã đóng" value={summary.closed_jobs} total={summary.total_jobs} tone="bg-slate-400" />
                </div>
              </article>

              <aside className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-premium border border-slate-200/80">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-200/60">
                      <Building2 size={20} aria-hidden="true" />
                    </span>
                    {data.profile.company_logo_url ? (
                      <img
                        src={data.profile.company_logo_url}
                        alt={data.profile.company_name || 'Logo'}
                        className="h-11 w-11 rounded-xl object-contain border border-slate-200/80 p-0.5"
                      />
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200/70">
                        Chưa có logo
                      </span>
                    )}
                  </div>
                  <h2 className="mt-5 text-lg font-bold tracking-tight text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">
                    Hồ sơ công ty
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {data.profile.company_name
                      ? data.profile.company_name
                      : 'Hoàn thiện thông tin doanh nghiệp để ứng viên nhận diện rõ hơn về công ty của bạn.'}
                  </p>
                  {!data.profile.company_logo_url && (
                    <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/70 p-3.5 text-xs leading-5 text-amber-800">
                      <p className="font-semibold flex items-center gap-1.5 text-amber-900">
                        <AlertCircle size={14} className="shrink-0 text-amber-600" />
                        Mẹo thu hút ứng viên:
                      </p>
                      Thêm logo doanh nghiệp để tin tuyển dụng hiển thị nổi bật và chuyên nghiệp hơn trên bảng tin việc làm.
                    </div>
                  )}
                </div>
                <Link
                  to="/recruiter/profile"
                  className="btn-press mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  <FilePenLine size={16} aria-hidden="true" />
                  {data.profile.company_name ? 'Xem hồ sơ công ty' : 'Cập nhật hồ sơ'}
                </Link>
              </aside>
            </section>
          )}
        </>
      )}
    </main>
  )
}
