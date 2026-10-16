import { AlertCircle, ArrowUpRight, Building2, CheckCircle2, ClipboardClock, FilePenLine, Plus, RefreshCw, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RecruiterJobStatusChart from '../../components/recruiter/RecruiterJobStatusChart'
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
          <div key={index} className="h-32 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-2xl skeleton-shimmer" />
        <div className="h-64 rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  )
}

export default function RecruiterDashboardPage() {
  const navigate = useNavigate()
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
    {
      label: 'Tổng tin tuyển dụng',
      value: summary.total_jobs,
      cardBg: 'bg-[#E5ECF6]',
      to: '/recruiter/jobs',
    },
    {
      label: 'Đang chờ duyệt',
      value: summary.pending_jobs,
      cardBg: 'bg-[#E3F5FF]',
      to: '/recruiter/jobs?status=PENDING',
    },
    {
      label: 'Đã duyệt công khai',
      value: summary.approved_jobs,
      cardBg: 'bg-[#E5ECF6]',
      to: '/recruiter/jobs?status=APPROVED',
    },
    {
      label: 'Đã đóng tuyển dụng',
      value: summary.closed_jobs,
      cardBg: 'bg-[#E3F5FF]',
      to: '/recruiter/jobs?status=CLOSED',
    },
  ]
  const actionItems = [
    summary.pending_jobs > 0 ? { count: summary.pending_jobs, label: 'tin đang chờ quản trị viên duyệt', to: '/recruiter/jobs?status=PENDING', icon: ClipboardClock, tone: 'text-amber-700 bg-amber-50 ring-1 ring-amber-200/60' } : null,
    summary.rejected_jobs > 0 ? { count: summary.rejected_jobs, label: 'tin bị từ chối cần xem và chỉnh sửa', to: '/recruiter/jobs?status=REJECTED', icon: XCircle, tone: 'text-red-700 bg-red-50 ring-1 ring-red-200/60' } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 font-[Inter,sans-serif]">
      {/* Header: Overview heading + Post button */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1C1C1C]">
            Tổng quan
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-normal">
            Theo dõi hiệu quả chiến dịch tuyển dụng và các đầu việc cần xử lý kịp thời.
          </p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="btn-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1C1C1C] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
        >
          <Plus size={16} aria-hidden="true" />
          Đăng tin mới
        </Link>
      </section>

      {!data && !error ? (
        <Skeleton />
      ) : error && !data ? (
        <section role="alert" className="rounded-2xl bg-[#F7F9FB] p-8 text-center border border-black/[0.04]">
          <AlertCircle className="mx-auto text-red-500" size={36} />
          <h2 className="mt-4 text-base font-semibold text-[#1C1C1C]">Không thể tải tổng quan tuyển dụng</h2>
          <p className="mt-2 text-xs text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1C1C1C] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-black"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Thử lại
          </button>
        </section>
      ) : (
        <>
          {data && error && (
            <div role="status" aria-live="polite" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              Không thể cập nhật dữ liệu mới nhất. {error}
            </div>
          )}

          {/* 4 Metric Cards with exact 2 alternating colors from Figma SnowUI */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chỉ số tuyển dụng">
            {cards.map(({ label, value, cardBg, to }) => (
              <Link
                key={label}
                to={to}
                className={`group flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] ${cardBg}`}
              >
                <div>
                  <p className="text-sm font-medium text-[#1C1C1C] font-[Inter,sans-serif]">{label}</p>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-[#1C1C1C] font-[Inter,sans-serif]">
                      {value}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C1C1C] transition-colors group-hover:text-black">
                    Quản lý
                    <ArrowUpRight size={14} aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </section>

          {data && (
            <section>
              <article className="rounded-2xl bg-[#F7F9FB] p-6 border border-black/[0.04]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-[#1C1C1C] font-[Inter,sans-serif]">
                      Việc cần xử lý
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 font-normal">Ưu tiên xử lý các tin cần phản hồi hoặc cập nhật.</p>
                  </div>
                  {actionItems.length > 0 && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200/60">
                      {actionItems.length} việc cần làm
                    </span>
                  )}
                </div>

                {actionItems.length > 0 ? (
                  <div className="mt-4 divide-y divide-black/[0.04]">
                    {actionItems.map(({ count, label, to, icon: Icon, tone }) => (
                      <Link
                        key={to}
                        to={to}
                        className="group flex items-center gap-3.5 py-3 first:pt-0 last:pb-0 transition-colors hover:text-[#1C1C1C]"
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                          <Icon size={15} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-semibold tabular-nums text-[#1C1C1C]">{count}</span>
                          <span className="ml-1.5 text-xs text-slate-600">{label}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1C1C1C] transition-transform duration-150 group-hover:translate-x-0.5">
                          Xem tin →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-white border border-black/[0.04] px-4 py-3 text-xs text-slate-700">
                    <CheckCircle2 size={16} className="shrink-0 text-[#1C1C1C]" aria-hidden="true" />
                    <span>Hiện không có tin nào cần xử lý. Tất cả đều hoạt động ổn định!</span>
                  </div>
                )}
              </article>
            </section>
          )}

          {data && (
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-2xl bg-[#F7F9FB] p-6 border border-black/[0.04]">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-[#1C1C1C] font-[Inter,sans-serif]">
                      Trạng thái tin tuyển dụng
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 font-normal">Phân bổ theo trạng thái hiện tại của các tin bạn đã tạo.</p>
                  </div>
                  <Link
                    to="/recruiter/jobs"
                    className="text-xs font-medium text-slate-500 transition-colors hover:text-[#1C1C1C]"
                  >
                    Xem tất cả
                  </Link>
                </div>
                <RecruiterJobStatusChart summary={summary} onNavigate={navigate} />
              </article>

              <aside className="flex flex-col justify-between rounded-2xl bg-[#F7F9FB] p-6 border border-black/[0.04]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1C1C1C] shadow-2xs border border-black/[0.04]">
                      <Building2 size={18} aria-hidden="true" />
                    </span>
                    {data.profile.company_logo_url ? (
                      <img
                        src={data.profile.company_logo_url}
                        alt={data.profile.company_name || 'Logo'}
                        className="h-9 w-9 rounded-xl object-contain border border-black/[0.06] p-0.5 bg-white"
                      />
                    ) : (
                      <span className="rounded-full bg-black/[0.03] px-2 py-0.5 text-xs font-normal text-slate-500">
                        Chưa có logo
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 text-sm font-semibold tracking-tight text-[#1C1C1C] font-[Inter,sans-serif]">
                    Hồ sơ công ty
                  </h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600">
                    {data.profile.company_name
                      ? data.profile.company_name
                      : 'Hoàn thiện thông tin doanh nghiệp để ứng viên nhận diện rõ hơn về công ty của bạn.'}
                  </p>
                  {!data.profile.company_logo_url && (
                    <div className="mt-3 rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-xs leading-5 text-amber-800">
                      <p className="font-medium flex items-center gap-1.5 text-amber-900">
                        <AlertCircle size={13} className="shrink-0 text-amber-600" />
                        Mẹo thu hút ứng viên:
                      </p>
                      Thêm logo doanh nghiệp để tin tuyển dụng hiển thị nổi bật và chuyên nghiệp hơn.
                    </div>
                  )}
                </div>
                <Link
                  to="/recruiter/profile"
                  className="btn-press mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-white px-4 py-2 text-xs font-medium text-[#1C1C1C] shadow-2xs transition-colors hover:bg-slate-50"
                >
                  <FilePenLine size={14} aria-hidden="true" />
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
