import { AlertCircle, ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CandidateApplicationFilters, { type CandidateApplicationStatusFilter } from '../../components/candidate/CandidateApplicationFilters'
import CandidateApplicationList from '../../components/candidate/CandidateApplicationList'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { applicationService } from '../../services/applicationService'
import { APPLICATION_STATUSES, type ApplicationStatus, type CandidateApplicationListResponse } from '../../types/application'
import { candidateApplicationErrorMessage } from '../../utils/apiError'

const PAGE_SIZE = 10

function ListSkeleton() {
  return <div className="mt-6 space-y-4" aria-busy="true" aria-label="Đang tải danh sách đơn ứng tuyển">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-slate-200" />)}</div>
}

export default function CandidateApplicationsPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const search = currentParams.get('search') ?? ''
  const normalizedSearch = search.trim() || undefined
  const rawStatus = currentParams.get('status')
  const status = rawStatus && APPLICATION_STATUSES.includes(rawStatus as ApplicationStatus) ? rawStatus as ApplicationStatus : undefined
  const statusFilter: CandidateApplicationStatusFilter = status ?? 'ALL'
  const rawPage = Number(currentParams.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const requestParams = useMemo(() => ({ search: normalizedSearch, status, page, page_size: PAGE_SIZE }), [normalizedSearch, page, status])
  const fetcher = useCallback((signal: AbortSignal) => applicationService.getApplications(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<CandidateApplicationListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? candidateApplicationErrorMessage(error, 'list') : null
  const returnTo = `/candidate/applications${queryKey ? `?${queryKey}` : ''}`
  const hasFilters = Boolean(normalizedSearch || status)

  const updateParams = useCallback((updates: Record<string, string | null>) => setParams((current) => {
    const next = new URLSearchParams(current)
    Object.entries(updates).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
    return next
  }), [setParams])
  const setSearch = (value: string) => updateParams({ search: value || null, page: null })
  const setStatus = (value: CandidateApplicationStatusFilter) => updateParams({ status: value === 'ALL' ? null : value, page: null })
  const setPage = (nextPage: number) => updateParams({ page: String(nextPage) })

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Trang chủ</Link><h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Đơn ứng tuyển của tôi</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Theo dõi trạng thái đơn ứng tuyển, xem lại công việc và CV đã sử dụng.</p></div>{data && <p className="text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> đơn ứng tuyển</p>}</header><CandidateApplicationFilters search={search} status={statusFilter} onSearchChange={setSearch} onStatusChange={setStatus} />{data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}{isInitialLoading ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" /><h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải danh sách đơn ứng tuyển.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p><button type="button" onClick={refetch} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Thử lại</button></section> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><ClipboardList size={27} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold text-slate-950">{hasFilters ? 'Không tìm thấy đơn ứng tuyển phù hợp.' : 'Bạn chưa ứng tuyển công việc nào.'}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{hasFilters ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.' : 'Khám phá các vị trí phù hợp và gửi đơn với CV bạn đã chuẩn bị.'}</p>{!hasFilters && <Link to="/jobs" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Khám phá việc làm <ArrowRight size={16} aria-hidden="true" /></Link>}</section> : data ? <><CandidateApplicationList applications={data.items} returnTo={returnTo} />{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang đơn ứng tuyển"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} aria-hidden="true" />Trước</button><span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau <ArrowRight size={16} aria-hidden="true" /></button></nav>}</> : null}</main>
}
