import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Eye, FilePenLine, LockKeyhole, MapPin, Plus, RotateCcw, Search, Trash2, UsersRound, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import JobStatusBadge from '../../components/recruiter/JobStatusBadge'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { recruiterJobService } from '../../services/recruiterJobService'
import { JOB_STATUSES, type JobStatus, type RecruiterJob, type RecruiterJobListResponse, type RecruiterJobSearchParams } from '../../types/job'
import { recruiterJobErrorMessage } from '../../utils/apiError'
import { employmentLabel, industryLabel, workModeLabel } from '../../utils/jobDisplay'

const PAGE_SIZE = 10
const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))

function RecruiterJobSearchInput({ initialValue, onSearchChange }: { initialValue: string; onSearchChange: (value: string) => void }) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (value === initialValue) return
    const timer = window.setTimeout(() => onSearchChange(value.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [initialValue, onSearchChange, value])

  return (
    <label className="relative min-w-0 w-full sm:w-60">
      <span className="sr-only">Tìm tin tuyển dụng</span>
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-9 w-full rounded-xl border border-black/[0.08] bg-white shadow-2xs py-1.5 pl-8 pr-7 text-xs text-[#1C1C1C] placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-black/[0.15] focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C]/10"
        placeholder="Tìm tiêu đề, địa điểm..."
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('')
            onSearchChange('')
          }}
          aria-label="Xóa từ khóa tìm kiếm"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </label>
  )
}

export default function RecruiterJobsPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const location = useLocation()
  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const keyword = currentParams.get('keyword') ?? ''
  const rawStatus = currentParams.get('status')
  const jobStatus = rawStatus && JOB_STATUSES.includes(rawStatus as JobStatus) ? rawStatus as JobStatus : undefined
  const rawSort = currentParams.get('sort')
  const sort: 'newest' | 'oldest' | 'updated' = rawSort === 'oldest' || rawSort === 'updated' ? rawSort : 'newest'
  const rawPage = Number(currentParams.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const [busyId, setBusyId] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<'delete' | 'close' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const updateParams = useCallback((updates: Record<string, string | null>, resetPage = true) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
      if (resetPage) next.delete('page')
      return next
    })
  }, [setParams])

  const setKeyword = useCallback((value: string) => updateParams({ keyword: value || null }), [updateParams])

  const requestParams = useMemo<RecruiterJobSearchParams>(() => ({ keyword: keyword || undefined, status: jobStatus, sort, page, page_size: PAGE_SIZE }), [jobStatus, keyword, page, sort])
  const fetcher = useCallback((signal: AbortSignal) => recruiterJobService.getMyJobs(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<RecruiterJobListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const queryError = error ? recruiterJobErrorMessage(error) : null

  const act = async (job: RecruiterJob, action: 'delete' | 'close') => {
    if (busyId !== null) return
    const message = action === 'delete' ? 'Bạn có chắc muốn xóa tin tuyển dụng này?' : 'Bạn có chắc muốn đóng tin tuyển dụng này?'
    if (!window.confirm(message)) return
    setBusyId(job.id)
    setBusyAction(action)
    setActionError(null)
    try {
      if (action === 'delete') await recruiterJobService.deleteJob(job.id)
      else await recruiterJobService.closeJob(job.id)
      // The Axios mutation interceptor emits the single authoritative refresh event.
    } catch (requestError) {
      setActionError(recruiterJobErrorMessage(requestError))
    } finally {
      setBusyId(null)
      setBusyAction(null)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-[Inter,sans-serif]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1C1C1C]">
            Quản lý tin tuyển dụng
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-normal">
            Theo dõi trạng thái duyệt, số lượng ứng viên và quản lý toàn bộ tin đã đăng tại một nơi.
          </p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="btn-press inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1C1C1C] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
        >
          <Plus size={16} aria-hidden="true" />
          Đăng tin mới
        </Link>
      </div>

      {location.state && typeof location.state === 'object' && 'message' in location.state && (
        <div role="status" className="mt-5 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200">
          {String(location.state.message)}
        </div>
      )}

      <section className="mt-5 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm và bộ lọc tin tuyển dụng">
        <RecruiterJobSearchInput key={keyword} initialValue={keyword} onSearchChange={setKeyword} />
        <select
          aria-label="Lọc trạng thái"
          value={jobStatus ?? ''}
          onChange={(event) => updateParams({ status: event.target.value || null })}
          className="h-9 rounded-xl border border-black/[0.08] bg-white shadow-2xs px-3 text-xs font-normal text-[#1C1C1C] outline-none transition-all duration-150 hover:border-black/[0.15] focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C]/10"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Bị từ chối</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
        <select
          aria-label="Sắp xếp"
          value={sort}
          onChange={(event) => updateParams({ sort: event.target.value === 'newest' ? null : event.target.value })}
          className="h-9 rounded-xl border border-black/[0.08] bg-white shadow-2xs px-3 text-xs font-normal text-[#1C1C1C] outline-none transition-all duration-150 hover:border-black/[0.15] focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C]/10"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="updated">Vừa cập nhật</option>
        </select>
        {(keyword || jobStatus || sort !== 'newest') && (
          <button
            type="button"
            onClick={() => updateParams({ keyword: null, status: null, sort: null })}
            className="inline-flex items-center gap-1.5 h-9 px-2.5 text-xs font-normal text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-colors ml-auto sm:ml-0"
            title="Đặt lại toàn bộ bộ lọc"
          >
            <RotateCcw size={12} />
            <span>Xóa lọc</span>
          </button>
        )}
      </section>

      {data && <QueryFetchFeedback isFetching={isFetching} errorMessage={queryError} onRetry={refetch} />}

      {actionError && (
        <div role="alert" className="mt-5 flex items-start justify-between gap-4 rounded-xl bg-red-50 p-4 text-xs text-red-700 ring-1 ring-red-100">
          <div className="flex gap-2.5">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Không thể hoàn tất yêu cầu</p>
              <p>{actionError}</p>
            </div>
          </div>
        </div>
      )}

      {busyAction && (
        <div role="status" aria-live="polite" className="mt-5 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200">
          {busyAction === 'delete' ? 'Đang xóa tin tuyển dụng...' : 'Đang đóng tin tuyển dụng...'}
        </div>
      )}

      {isInitialLoading ? (
        <div className="mt-5 grid gap-3" aria-busy="true" aria-label="Đang tải tin tuyển dụng">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-[#F7F9FB] border border-black/[0.04] animate-pulse" />
          ))}
        </div>
      ) : !data && queryError ? (
        <div role="alert" className="mt-6 rounded-2xl bg-[#F7F9FB] px-6 py-12 text-center border border-black/[0.04]">
          <AlertCircle className="mx-auto text-red-500" size={32} />
          <h2 className="mt-3 text-base font-semibold text-[#1C1C1C]">Không thể tải danh sách tin tuyển dụng</h2>
          <p className="mt-1 text-xs text-slate-500">{queryError}</p>
          <button type="button" onClick={refetch} className="btn-press mt-4 rounded-xl bg-[#1C1C1C] px-4 py-2 text-xs font-semibold text-white hover:bg-black">
            Thử lại
          </button>
        </div>
      ) : data?.items.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-[#F7F9FB] px-6 py-14 text-center border border-black/[0.04]">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#1C1C1C] border border-black/[0.06] shadow-2xs">
            <BriefcaseBusiness size={22} />
          </span>
          <h2 className="mt-4 text-base font-semibold text-[#1C1C1C]">Bạn chưa có tin tuyển dụng nào</h2>
          <p className="mt-1 text-xs text-slate-500">Tạo tin đầu tiên để bắt đầu tiếp cận ứng viên phù hợp.</p>
          <Link to="/recruiter/jobs/create" className="btn-press mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#1C1C1C] px-4 py-2 text-xs font-semibold text-white hover:bg-black">
            <Plus size={15} />
            Đăng tin tuyển dụng
          </Link>
        </section>
      ) : data ? (
        <>
          <section className="mt-5 space-y-3" aria-label="Danh sách tin tuyển dụng">
            {data.items.map((job) => (
              <article key={job.id} className="group rounded-2xl bg-[#F7F9FB] p-5 border border-black/[0.04] transition-all duration-150 hover:border-black/[0.08] hover:shadow-xs">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <JobStatusBadge status={job.status} />
                      <span className="text-xs font-normal text-slate-400">
                        <CalendarDays size={12} className="mr-1 inline" />
                        {formatDate(job.created_at)}
                      </span>
                    </div>
                    <h2 className="mt-2.5 truncate text-base font-semibold text-[#1C1C1C] transition-colors group-hover:text-black">
                      {job.title}
                    </h2>
                    <p className="mt-0.5 text-xs font-normal text-slate-500">{industryLabel(job.industry)}</p>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                      <span>
                        <MapPin size={13} className="mr-1 inline text-slate-400" />
                        {job.location || 'Chưa cập nhật'}
                      </span>
                      <span>•</span>
                      <span>{employmentLabel(job.employment_type)}</span>
                      <span>•</span>
                      <span>{workModeLabel(job.work_mode)}</span>
                      <span>•</span>
                      <span>
                        <UsersRound size={13} className="mr-1 inline text-slate-400" />
                        {job.vacancies} vị trí
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-black/[0.04] pt-3 lg:border-0 lg:pt-0">
                    <Link
                      to={`/recruiter/jobs/${job.id}`}
                      className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-black/[0.06] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1C1C] shadow-2xs transition-colors hover:bg-slate-50"
                    >
                      <Eye size={13} />
                      Xem
                    </Link>
                    <Link
                      to={`/recruiter/jobs/${job.id}/applications`}
                      className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-black/[0.06] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1C1C] shadow-2xs transition-colors hover:bg-slate-50"
                    >
                      <UsersRound size={13} />
                      Ứng viên
                    </Link>
                    {job.status !== 'CLOSED' && (
                      <Link
                        to={`/recruiter/jobs/${job.id}/edit`}
                        className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-black/[0.06] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1C1C] shadow-2xs transition-colors hover:bg-slate-50"
                      >
                        <FilePenLine size={13} />
                        Sửa
                      </Link>
                    )}
                    {(job.status === 'PENDING' || job.status === 'REJECTED') && (
                      <button
                        type="button"
                        disabled={busyId === job.id}
                        onClick={() => void act(job, 'delete')}
                        className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/60 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100/80 disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        Xóa
                      </button>
                    )}
                    {job.status === 'APPROVED' && (
                      <button
                        type="button"
                        disabled={busyId === job.id}
                        onClick={() => void act(job, 'close')}
                        className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-[#1C1C1C] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
                      >
                        <LockKeyhole size={13} />
                        Đóng tin
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
          {data.total_pages > 1 && (
            <nav className="mt-6 flex items-center justify-between" aria-label="Phân trang">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) }, false)}
                className="btn-press inline-flex items-center gap-1 rounded-xl border border-black/[0.06] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1C1C] shadow-2xs hover:bg-slate-50 disabled:opacity-40"
              >
                <ArrowLeft size={13} />
                Trước
              </button>
              <span className="text-xs text-slate-500">
                Trang <strong className="text-[#1C1C1C] font-semibold">{data.page}</strong> / {data.total_pages}
              </span>
              <button
                type="button"
                disabled={page >= data.total_pages}
                onClick={() => updateParams({ page: String(page + 1) }, false)}
                className="btn-press inline-flex items-center gap-1 rounded-xl border border-black/[0.06] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1C1C] shadow-2xs hover:bg-slate-50 disabled:opacity-40"
              >
                Sau
                <ArrowRight size={13} />
              </button>
            </nav>
          )}
        </>
      ) : null}
    </main>
  )
}
