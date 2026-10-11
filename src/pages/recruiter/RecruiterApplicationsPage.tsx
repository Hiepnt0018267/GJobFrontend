import { AlertCircle, ArrowLeft, ArrowRight, ClipboardList, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import RecruiterApplicationFilters, { type RecruiterApplicationStatusFilter } from '../../components/recruiter/RecruiterApplicationFilters'
import RecruiterApplicationList from '../../components/recruiter/RecruiterApplicationList'
import RecruiterRankingDialog from '../../components/recruiter/RecruiterRankingDialog'
import RecruiterRankingResults from '../../components/recruiter/RecruiterRankingResults'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { recruiterApplicationService } from '../../services/recruiterApplicationService'
import { recruiterJobService } from '../../services/recruiterJobService'
import type { RecruiterJob, RecruiterJobListResponse } from '../../types/job'
import type { ApplicantRankingMode, RecruiterApplicationListResponse } from '../../types/recruiterApplication'
import { getApiErrorStatus, recruiterApplicationErrorMessage, recruiterJobErrorMessage } from '../../utils/apiError'
import { rankingActionQuery, recruiterListScopeQuery, recruiterRankingQuery, updateRecruiterListQuery } from '../../utils/recruiterRanking'

const PAGE_SIZE = 10
const JOB_OPTIONS_PAGE_SIZE = 100
type ListResult = { response: RecruiterApplicationListResponse; requestKey: string; contextKey: string; ai: boolean }

function ListSkeleton() {
  return <div className="mt-6 space-y-3" aria-busy="true" aria-label="Đang tải danh sách ứng viên">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
}

export default function RecruiterApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const isJobScoped = Boolean(jobId)
  const [dialogOpen, setDialogOpen] = useState(false)
  const closeDialog = useCallback(() => setDialogOpen(false), [])
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const search = currentParams.get('search') ?? ''
  const normalizedSearch = search.trim() || undefined
  const rankingQuery = useMemo(() => recruiterRankingQuery(currentParams, PAGE_SIZE, isJobScoped), [currentParams, isJobScoped])
  const { ai: showRanking, page, request: requestParams } = rankingQuery
  const status = requestParams.status
  const statusFilter: RecruiterApplicationStatusFilter = status ?? 'ALL'
  const selectedJobId = currentParams.get('job_id') ?? undefined
  const requestKey = `${isJobScoped ? jobId : 'global'}:${queryKey}`
  const contextKey = useMemo(() => {
    const withoutSnapshot = new URLSearchParams(queryKey)
    withoutSnapshot.delete('ranking_snapshot')
    return `${isJobScoped ? jobId : 'global'}:${withoutSnapshot.toString()}`
  }, [isJobScoped, jobId, queryKey])
  const fetcher = useCallback(async (signal: AbortSignal): Promise<ListResult> => {
    const scopedParams = { ...requestParams }
    delete scopedParams.job_id
    const response = isJobScoped && jobId
      ? await recruiterApplicationService.getApplicationsByJob(jobId, scopedParams, signal)
      : await recruiterApplicationService.getApplications(requestParams, signal)
    return { response, requestKey, contextKey, ai: showRanking }
  }, [contextKey, isJobScoped, jobId, requestKey, requestParams, showRanking])
  const { data: result, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<ListResult>({ queryKey: requestKey, refreshKey: refreshVersion, fetcher })
  const apiStatus = getApiErrorStatus(error)
  const invalidRanking = showRanking && (apiStatus === 409 || apiStatus === 503)
  // Never label a previous query/page as the newly requested AI ordering.
  const sameSnapshot = showRanking && result?.ai && result.contextKey === contextKey && result.response.ranking_snapshot === rankingQuery.snapshot
  const responseData = !invalidRanking && result && (result.requestKey === requestKey || sameSnapshot || (!showRanking && !result.ai)) ? result.response : null
  const unsupportedContract = showRanking && responseData && (responseData.ranking_mode !== rankingQuery.mode
    || (rankingQuery.mode === 'top_n' && responseData.requested_top_n !== rankingQuery.topN)
    || responseData.returned_ranked_count == null || responseData.unranked_count == null)
  const data = unsupportedContract ? null : responseData
  const errorMessage = unsupportedContract ? 'Máy chủ chưa trả đúng phạm vi xếp hạng. Vui lòng dùng danh sách thường hoặc thử lại.' : error ? showRanking && apiStatus === 409
    ? 'Phiên xếp hạng đã hết hạn hoặc danh sách đã thay đổi. Vui lòng tải lại từ trang 1.'
    : showRanking && apiStatus === 503
      ? 'Xếp hạng AI tạm thời không khả dụng. Bạn vẫn có thể xem ứng viên theo thứ tự mới nhất.'
      : recruiterApplicationErrorMessage(error, 'list') : null
  const loadingList = isInitialLoading || (!data && !errorMessage)

  const jobOptionsFetcher = useCallback((signal: AbortSignal) => isJobScoped
    ? Promise.resolve<RecruiterJobListResponse>({ items: [], page: 1, page_size: JOB_OPTIONS_PAGE_SIZE, total: 0, total_pages: 0 })
    : recruiterJobService.getMyJobs({ page: 1, page_size: JOB_OPTIONS_PAGE_SIZE, sort: 'newest' }, signal), [isJobScoped])
  const { data: jobOptions, isInitialLoading: isJobsLoading } = usePaginatedQuery<RecruiterJobListResponse>({ queryKey: isJobScoped ? 'recruiter-application-jobs-disabled' : 'recruiter-application-jobs', refreshKey: refreshVersion, fetcher: jobOptionsFetcher })

  const scopedJobFetcher = useCallback((signal: AbortSignal) => jobId ? recruiterJobService.getMyJob(jobId, signal) : Promise.resolve<RecruiterJob | null>(null), [jobId])
  const { data: scopedJob, error: scopedJobError } = usePaginatedQuery<RecruiterJob | null>({ queryKey: `recruiter-application-job:${jobId ?? ''}`, refreshKey: refreshVersion, fetcher: scopedJobFetcher })

  const updateParams = useCallback((updates: Record<string, string | null>, resetPage = true, snapshot?: string | null) =>
    setParams((current) => updateRecruiterListQuery(current, updates, resetPage, snapshot)), [setParams])

  useEffect(() => {
    if (rankingQuery.needsReset) setParams((current) => isJobScoped
      ? updateRecruiterListQuery(current, {}, true)
      : recruiterListScopeQuery(current, false), { replace: true })
  }, [isJobScoped, rankingQuery.needsReset, setParams])

  useEffect(() => {
    const token = result?.response.ranking_snapshot
    if (showRanking && !error && !isFetching && !rankingQuery.snapshot && result?.requestKey === requestKey && token && /^[0-9a-f]{32}$/.test(token)) {
      // Replace page one's history entry so browser Back retains this traversal.
      // The next GET verifies this snapshot; it does not generate a new ordering.
      setParams((current) => updateRecruiterListQuery(current, {}, false, token), { replace: true })
    }
  }, [error, isFetching, rankingQuery.snapshot, requestKey, result, setParams, showRanking])

  const setSearch = (value: string) => updateParams({ search: value || null })
  const setStatus = (value: RecruiterApplicationStatusFilter) => updateParams({ status: value === 'ALL' ? null : value })
  const setJob = (value: string) => updateParams({ job_id: value || null })
  const returnNormal = () => updateParams({ sort: null, ranking_mode: null, top_n: null, ai_top_n: null })
  const confirmRanking = (mode: ApplicantRankingMode, topN: number) => {
    setParams((current) => rankingActionQuery(current, mode, topN))
    closeDialog()
  }
  const restartRanking = () => { updateParams({}, true); refetch() }
  const retryList = () => invalidRanking ? restartRanking() : refetch()
  const setPage = (nextPage: number) => updateParams({ page: String(nextPage) }, false, data?.ranking_snapshot)
  const returnQuery = updateRecruiterListQuery(currentParams, {}, false, data?.ranking_snapshot).toString()
  const returnTo = `${isJobScoped && jobId ? `/recruiter/jobs/${jobId}/applications` : '/recruiter/applications'}${returnQuery ? `?${returnQuery}` : ''}`
  const canPage = !isFetching && !error && (!showRanking || Boolean(data?.ranking_snapshot))
  const hasFilters = Boolean(normalizedSearch || status || (!isJobScoped && selectedJobId))
  const scopedJobName = scopedJob?.title ?? 'tin tuyển dụng này'
  const isNotFound = getApiErrorStatus(error) === 404 || getApiErrorStatus(scopedJobError) === 404

  return <div className="min-h-screen bg-slate-50">
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          {isJobScoped ? <Link to={`/recruiter/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Quay lại tin tuyển dụng</Link> : <Link to="/recruiter" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Tổng quan</Link>}
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{isJobScoped ? `Ứng viên cho ${scopedJobName}` : 'Ứng viên'}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{isJobScoped ? 'Theo dõi và xử lý các đơn ứng tuyển cho tin tuyển dụng này.' : 'Quản lý các ứng viên đã ứng tuyển vào tin tuyển dụng của bạn.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {data && <p className="text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> ứng viên trong kết quả</p>}
          {isJobScoped && <button type="button" onClick={() => setDialogOpen(true)} disabled={isFetching} aria-haspopup="dialog" className="min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50">Xếp hạng AI</button>}
        </div>
      </header>

      <RecruiterApplicationFilters search={search} status={statusFilter} jobId={selectedJobId} jobs={jobOptions?.items ?? []} jobsLoading={!isJobScoped && isJobsLoading} showJobFilter={!isJobScoped} onSearchChange={setSearch} onStatusChange={setStatus} onJobChange={setJob} />
      {showRanking && <div className="mt-4 flex flex-col justify-between gap-2 text-sm leading-6 text-slate-600 sm:flex-row sm:items-start">
        <p className="max-w-2xl">Xếp hạng AI chỉ hỗ trợ sắp xếp. Nhà tuyển dụng vẫn cần xem hồ sơ trước khi quyết định.</p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={restartRanking} disabled={isFetching} className="min-h-11 rounded-lg px-2 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50">Làm mới kết quả</button>
          <button type="button" onClick={returnNormal} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Về danh sách thường</button>
        </div>
      </div>}
      {data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={retryList} />}

      {loadingList ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200">
        <AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" />
        <h2 className="mt-4 text-lg font-bold text-slate-950">{isNotFound && isJobScoped ? 'Không tìm thấy tin tuyển dụng hoặc bạn không có quyền truy cập.' : invalidRanking ? 'Chưa thể tải phiên xếp hạng này.' : 'Không thể tải danh sách ứng viên.'}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{isNotFound && isJobScoped ? recruiterJobErrorMessage(scopedJobError) : errorMessage}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={retryList} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"><RefreshCw size={16} aria-hidden="true" />{invalidRanking ? 'Tải lại từ trang 1' : 'Thử lại'}</button>
          {showRanking && <button type="button" onClick={returnNormal} className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Dùng danh sách thường</button>}
          {isJobScoped && <Link to={`/recruiter/jobs/${jobId}`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại tin tuyển dụng</Link>}
        </div>
      </section> : data?.items.length === 0 && !showRanking ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><ClipboardList size={27} aria-hidden="true" /></span>
        <h2 className="mt-5 text-xl font-bold text-slate-950">{hasFilters ? 'Không tìm thấy ứng viên phù hợp.' : isJobScoped ? 'Chưa có ứng viên nào cho tin này.' : 'Chưa có đơn ứng tuyển nào.'}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{hasFilters ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.' : 'Các đơn ứng tuyển sẽ xuất hiện tại đây khi ứng viên nộp hồ sơ.'}</p>
      </section> : data ? <>
        {showRanking ? <RecruiterRankingResults data={data} returnTo={returnTo} /> : <RecruiterApplicationList applications={data.items} returnTo={returnTo} />}
        {showRanking && !data.ranking_snapshot && data.total_pages > 1 && <p role="status" className="mt-4 text-sm leading-6 text-slate-600">Chưa có mã phiên xếp hạng để chuyển trang an toàn. Hãy làm mới xếp hạng hoặc chọn thứ tự mới nhất.</p>}
        {data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang danh sách ứng viên">
          <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1 || !canPage} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} aria-hidden="true" />Trước</button>
          <span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span>
          <button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages || !canPage} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau <ArrowRight size={16} aria-hidden="true" /></button>
        </nav>}
      </> : null}
      {dialogOpen && isJobScoped && <RecruiterRankingDialog initialMode={showRanking ? rankingQuery.mode : 'all'} initialTopN={rankingQuery.topN ?? 10} onClose={closeDialog} onConfirm={confirmRanking} />}
    </main>
  </div>
}
