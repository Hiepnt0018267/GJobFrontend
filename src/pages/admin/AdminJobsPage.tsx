import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarClock, Eye, MapPin, UsersRound } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import AdminJobFilters, { type AdminJobStatusFilter } from '../../components/admin/jobs/AdminJobFilters'
import AdminJobStatusBadge from '../../components/admin/jobs/AdminJobStatusBadge'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { adminJobService } from '../../services/adminJobService'
import { JOB_STATUSES, type JobStatus } from '../../types/job'
import type { AdminJobListResponse } from '../../types/adminJob'
import { adminJobErrorMessage } from '../../utils/apiError'
import { employmentLabel, formatJobTimestamp, industryLabel, workModeLabel } from '../../utils/jobDisplay'

const PAGE_SIZE = 10
const emptyMessages: Record<AdminJobStatusFilter, string> = { PENDING: 'Không có tin tuyển dụng nào đang chờ duyệt.', APPROVED: 'Chưa có tin tuyển dụng đã duyệt.', REJECTED: 'Chưa có tin tuyển dụng bị từ chối.', CLOSED: 'Chưa có tin tuyển dụng đã đóng.', ALL: 'Chưa có tin tuyển dụng nào trong hệ thống.' }

function ListSkeleton() { return <div className="mt-6 space-y-4" aria-busy="true" aria-label="Đang tải danh sách tin tuyển dụng">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-slate-200" />)}</div> }

export default function AdminJobsPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const rawStatus = currentParams.get('status')
  const selectedStatus = rawStatus === 'ALL' ? undefined : rawStatus && JOB_STATUSES.includes(rawStatus as JobStatus) ? rawStatus as JobStatus : 'PENDING'
  const activeFilter = selectedStatus ?? 'ALL'
  const search = currentParams.get('search') ?? ''
  const normalizedSearch = search.trim() || undefined
  const rawPage = Number(currentParams.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const requestParams = useMemo(() => ({ status: selectedStatus, search: normalizedSearch, page, page_size: PAGE_SIZE }), [normalizedSearch, page, selectedStatus])
  const fetcher = useCallback((signal: AbortSignal) => adminJobService.getAdminJobs(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<AdminJobListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? adminJobErrorMessage(error, 'list') : null
  const listQueryParams = new URLSearchParams({ status: activeFilter, page: String(page) })
  if (normalizedSearch) listQueryParams.set('search', normalizedSearch)
  const listQuery = listQueryParams.toString()

  const setFilter = (filter: AdminJobStatusFilter) => { const next = new URLSearchParams(params); next.set('status', filter); next.delete('page'); setParams(next) }
  const setPage = (nextPage: number) => { const next = new URLSearchParams(params); next.set('status', activeFilter); next.set('page', String(nextPage)); setParams(next) }
  const setSearch = useCallback((value: string) => setParams((current) => { const next = new URLSearchParams(current); if (value) next.set('search', value); else next.delete('search'); next.delete('page'); return next }), [setParams])
  const emptyTitle = normalizedSearch ? 'Không tìm thấy tin tuyển dụng phù hợp.' : emptyMessages[activeFilter]
  const emptyDescription = normalizedSearch ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn một trạng thái khác.' : 'Thử chọn một trạng thái khác để tiếp tục theo dõi dữ liệu hệ thống.'

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Tổng quan</Link><h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Quản lý tin tuyển dụng</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Xem xét và kiểm duyệt các tin tuyển dụng trên hệ thống.</p></div>{data && <p className="text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> kết quả</p>}</header><AdminJobFilters activeStatus={activeFilter} search={search} onSearchChange={setSearch} onStatusChange={setFilter} />{data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}{isInitialLoading ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" /><h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải danh sách tin tuyển dụng.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p><button type="button" onClick={refetch} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Thử lại</button></section> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><BriefcaseBusiness size={27} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold text-slate-950">{emptyTitle}</h2><p className="mt-2 text-sm text-slate-500">{emptyDescription}</p></section> : data ? <><section className="mt-6 space-y-4" aria-label="Danh sách tin tuyển dụng">{data.items.map((job) => <article key={job.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><AdminJobStatusBadge status={job.status} /><span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><CalendarClock size={14} aria-hidden="true" />Cập nhật {formatJobTimestamp(job.updated_at)}</span></div><h2 className="mt-3 break-words text-lg font-bold text-slate-950 sm:text-xl">{job.title}</h2><p className="mt-1 break-words text-sm font-semibold text-blue-700">{job.company_name}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><MapPin size={15} className="text-slate-400" aria-hidden="true" />{job.location || 'Chưa cập nhật địa điểm'}</span><span>{industryLabel(job.industry)}</span><span>{employmentLabel(job.employment_type)}</span><span>{workModeLabel(job.work_mode)}</span><span className="inline-flex items-center gap-1.5"><UsersRound size={15} className="text-slate-400" aria-hidden="true" />{job.vacancies} vị trí</span></div>{job.recruiter_id && <p className="mt-3 truncate text-xs text-slate-400" title={job.recruiter_id}>Mã người đăng: {job.recruiter_id}</p>}</div><Link to={`/admin/jobs/${job.id}`} state={{ returnTo: `/admin/jobs?${listQuery}` }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"><Eye size={16} aria-hidden="true" />Xem xét</Link></div></article>)}</section>{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} aria-hidden="true" />Trước</button><span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau<ArrowRight size={16} aria-hidden="true" /></button></nav>}</> : null}</main></div>
}
