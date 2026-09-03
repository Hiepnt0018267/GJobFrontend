import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Eye, FilePenLine, LockKeyhole, MapPin, Plus, Search, Trash2, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import JobStatusBadge from '../../components/recruiter/JobStatusBadge'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'
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
  return <label className="relative min-w-0 flex-1"><span className="sr-only">Tìm tin tuyển dụng</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={value} onChange={(event) => setValue(event.target.value)} className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Tìm theo tiêu đề, công ty..." /></label>
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

  return <div className="min-h-screen bg-slate-50"><RecruiterHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Link to="/recruiter" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft size={15} />Dashboard</Link><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Quản lý tin tuyển dụng</h1><p className="mt-2 text-sm text-slate-600">Theo dõi trạng thái và quản lý toàn bộ tin đã đăng tại một nơi.</p></div><Link to="/recruiter/jobs/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus size={18} />Đăng tin tuyển dụng</Link></div>
    {location.state && typeof location.state === 'object' && 'message' in location.state && <div role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">{String(location.state.message)}</div>}
    <section className="mt-7 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:flex-row"><RecruiterJobSearchInput key={keyword} initialValue={keyword} onSearchChange={setKeyword} /><select aria-label="Lọc trạng thái" value={jobStatus ?? ''} onChange={(event) => updateParams({ status: event.target.value || null })} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700"><option value="">Tất cả trạng thái</option><option value="PENDING">Chờ duyệt</option><option value="APPROVED">Đã duyệt</option><option value="REJECTED">Bị từ chối</option><option value="CLOSED">Đã đóng</option></select><select aria-label="Sắp xếp" value={sort} onChange={(event) => updateParams({ sort: event.target.value === 'newest' ? null : event.target.value })} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700"><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="updated">Vừa cập nhật</option></select></section>
    {data && <QueryFetchFeedback isFetching={isFetching} errorMessage={queryError} onRetry={refetch} />}
    {actionError && <div role="alert" className="mt-5 flex items-start justify-between gap-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100"><div className="flex gap-3"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Không thể hoàn tất yêu cầu</p><p>{actionError}</p></div></div></div>}
    {busyAction && <div role="status" aria-live="polite" className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 ring-1 ring-blue-100">{busyAction === 'delete' ? 'Đang xóa tin tuyển dụng...' : 'Đang đóng tin tuyển dụng...'}</div>}
    {isInitialLoading ? <div className="mt-6 grid gap-4" aria-busy="true" aria-label="Đang tải tin tuyển dụng">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl bg-slate-200" />)}</div> : !data && queryError ? <div role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} /><h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải danh sách tin tuyển dụng.</h2><p className="mt-2 text-sm text-slate-500">{queryError}</p><button type="button" onClick={refetch} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Thử lại</button></div> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><BriefcaseBusiness size={27} /></span><h2 className="mt-5 text-xl font-bold text-slate-900">Bạn chưa có tin tuyển dụng nào.</h2><p className="mt-2 text-sm text-slate-500">Tạo tin đầu tiên để bắt đầu tiếp cận ứng viên phù hợp.</p><Link to="/recruiter/jobs/create" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"><Plus size={17} />Đăng tin tuyển dụng</Link></section> : data ? <><section className="mt-6 space-y-4">{data.items.map((job) => <article key={job.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><JobStatusBadge status={job.status} /><span className="text-xs font-medium text-slate-400"><CalendarDays size={13} className="mr-1 inline" />{formatDate(job.created_at)}</span></div><h2 className="mt-3 truncate text-lg font-bold text-slate-900">{job.title}</h2><p className="mt-1 text-sm font-medium text-slate-600">{industryLabel(job.industry)}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span><MapPin size={15} className="mr-1 inline" />{job.location || 'Chưa cập nhật'}</span><span>{employmentLabel(job.employment_type)}</span><span>{workModeLabel(job.work_mode)}</span><span><UsersRound size={15} className="mr-1 inline" />{job.vacancies} vị trí</span></div></div><div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-100 pt-4 lg:border-0 lg:pt-0"><Link to={`/recruiter/jobs/${job.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Eye size={15} />Xem</Link>{job.status !== 'CLOSED' && <Link to={`/recruiter/jobs/${job.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><FilePenLine size={15} />Sửa</Link>}{(job.status === 'PENDING' || job.status === 'REJECTED') && <button type="button" disabled={busyId === job.id} onClick={() => void act(job, 'delete')} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={15} />Xóa</button>}{job.status === 'APPROVED' && <button type="button" disabled={busyId === job.id} onClick={() => void act(job, 'close')} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50"><LockKeyhole size={15} />Đóng tin</button>}</div></div></article>)}</section>{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between" aria-label="Phân trang"><button type="button" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) }, false)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"><ArrowLeft size={15} />Trước</button><span className="text-sm text-slate-500">Trang <strong>{data.page}</strong> / {data.total_pages}</span><button type="button" disabled={page >= data.total_pages} onClick={() => updateParams({ page: String(page + 1) }, false)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Sau<ArrowRight size={15} /></button></nav>}</> : null}
  </main></div>
}
