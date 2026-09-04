import { AlertCircle, ArrowLeft, ArrowRight, ClipboardList, RefreshCw } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import RecruiterApplicationFilters, { type RecruiterApplicationStatusFilter } from '../../components/recruiter/RecruiterApplicationFilters'
import RecruiterApplicationList from '../../components/recruiter/RecruiterApplicationList'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { recruiterApplicationService } from '../../services/recruiterApplicationService'
import { recruiterJobService } from '../../services/recruiterJobService'
import type { RecruiterJob, RecruiterJobListResponse } from '../../types/job'
import { RECRUITER_APPLICATION_STATUSES, type RecruiterApplicationListResponse, type RecruiterApplicationStatus } from '../../types/recruiterApplication'
import { getApiErrorStatus, recruiterApplicationErrorMessage, recruiterJobErrorMessage } from '../../utils/apiError'

const PAGE_SIZE = 10
const JOB_OPTIONS_PAGE_SIZE = 100

function ListSkeleton() {
  return <div className="mt-6 space-y-3" aria-busy="true" aria-label="Đang tải danh sách ứng viên">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
}

export default function RecruiterApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const isJobScoped = Boolean(jobId)
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const search = currentParams.get('search') ?? ''
  const normalizedSearch = search.trim() || undefined
  const rawStatus = currentParams.get('status')
  const status = rawStatus && RECRUITER_APPLICATION_STATUSES.includes(rawStatus as RecruiterApplicationStatus) ? rawStatus as RecruiterApplicationStatus : undefined
  const statusFilter: RecruiterApplicationStatusFilter = status ?? 'ALL'
  const selectedJobId = currentParams.get('job_id') ?? undefined
  const rawPage = Number(currentParams.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const requestParams = useMemo(() => ({ search: normalizedSearch, status, job_id: selectedJobId, page, page_size: PAGE_SIZE }), [normalizedSearch, page, selectedJobId, status])
  const fetcher = useCallback((signal: AbortSignal) => isJobScoped && jobId
    ? recruiterApplicationService.getApplicationsByJob(jobId, { search: normalizedSearch, status, page, page_size: PAGE_SIZE }, signal)
    : recruiterApplicationService.getApplications(requestParams, signal), [isJobScoped, jobId, normalizedSearch, page, requestParams, status])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<RecruiterApplicationListResponse>({ queryKey: `${isJobScoped ? jobId : 'global'}:${queryKey}`, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? recruiterApplicationErrorMessage(error, 'list') : null

  const jobOptionsFetcher = useCallback((signal: AbortSignal) => isJobScoped
    ? Promise.resolve<RecruiterJobListResponse>({ items: [], page: 1, page_size: JOB_OPTIONS_PAGE_SIZE, total: 0, total_pages: 0 })
    : recruiterJobService.getMyJobs({ page: 1, page_size: JOB_OPTIONS_PAGE_SIZE, sort: 'newest' }, signal), [isJobScoped])
  const { data: jobOptions, isInitialLoading: isJobsLoading } = usePaginatedQuery<RecruiterJobListResponse>({ queryKey: isJobScoped ? 'recruiter-application-jobs-disabled' : 'recruiter-application-jobs', refreshKey: refreshVersion, fetcher: jobOptionsFetcher })

  const scopedJobFetcher = useCallback((signal: AbortSignal) => jobId ? recruiterJobService.getMyJob(jobId, signal) : Promise.resolve<RecruiterJob | null>(null), [jobId])
  const { data: scopedJob, error: scopedJobError } = usePaginatedQuery<RecruiterJob | null>({ queryKey: `recruiter-application-job:${jobId ?? ''}`, refreshKey: refreshVersion, fetcher: scopedJobFetcher })

  const updateParams = useCallback((updates: Record<string, string | null>, resetPage = true) => setParams((current) => {
    const next = new URLSearchParams(current)
    Object.entries(updates).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
    if (resetPage) next.delete('page')
    return next
  }), [setParams])

  const setSearch = (value: string) => updateParams({ search: value || null })
  const setStatus = (value: RecruiterApplicationStatusFilter) => updateParams({ status: value === 'ALL' ? null : value })
  const setJob = (value: string) => updateParams({ job_id: value || null })
  const setPage = (nextPage: number) => updateParams({ page: String(nextPage) }, false)
  const returnTo = `${isJobScoped && jobId ? `/recruiter/jobs/${jobId}/applications` : '/recruiter/applications'}${queryKey ? `?${queryKey}` : ''}`
  const hasFilters = Boolean(normalizedSearch || status || (!isJobScoped && selectedJobId))
  const scopedJobName = scopedJob?.title ?? 'tin tuyển dụng này'
  const isNotFound = getApiErrorStatus(error) === 404 || getApiErrorStatus(scopedJobError) === 404

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div>{isJobScoped ? <Link to={`/recruiter/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Quay lại tin tuyển dụng</Link> : <Link to="/recruiter" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Tổng quan</Link>}<h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{isJobScoped ? `Ứng viên cho ${scopedJobName}` : 'Ứng viên'}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{isJobScoped ? 'Theo dõi và xử lý các đơn ứng tuyển cho tin tuyển dụng này.' : 'Quản lý các ứng viên đã ứng tuyển vào tin tuyển dụng của bạn.'}</p></div>{data && <p className="text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> ứng viên</p>}</header><RecruiterApplicationFilters search={search} status={statusFilter} jobId={selectedJobId} jobs={jobOptions?.items ?? []} jobsLoading={!isJobScoped && isJobsLoading} showJobFilter={!isJobScoped} onSearchChange={setSearch} onStatusChange={setStatus} onJobChange={setJob} />{data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}{isInitialLoading ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" /><h2 className="mt-4 text-lg font-bold text-slate-950">{isNotFound && isJobScoped ? 'Không tìm thấy tin tuyển dụng hoặc bạn không có quyền truy cập.' : 'Không thể tải danh sách ứng viên.'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{isNotFound && isJobScoped ? recruiterJobErrorMessage(scopedJobError) : errorMessage}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={refetch} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} aria-hidden="true" />Thử lại</button>{isJobScoped && <Link to={`/recruiter/jobs/${jobId}`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại tin tuyển dụng</Link>}</div></section> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><ClipboardList size={27} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold text-slate-950">{hasFilters ? 'Không tìm thấy ứng viên phù hợp.' : isJobScoped ? 'Chưa có ứng viên nào cho tin này.' : 'Chưa có đơn ứng tuyển nào.'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{hasFilters ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.' : 'Các đơn ứng tuyển sẽ xuất hiện tại đây khi ứng viên nộp hồ sơ.'}</p></section> : data ? <><RecruiterApplicationList applications={data.items} returnTo={returnTo} />{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang danh sách ứng viên"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} aria-hidden="true" />Trước</button><span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau <ArrowRight size={16} aria-hidden="true" /></button></nav>}</> : null}</main></div>
}
