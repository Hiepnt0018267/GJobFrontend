import { AlertCircle, ArrowLeft, ArrowRight, Bookmark, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import SavedJobCard from '../../components/jobs/SavedJobCard'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { savedJobService } from '../../services/savedJobService'
import type { SavedJobListResponse } from '../../types/savedJob'
import { savedJobErrorMessage } from '../../utils/apiError'

const PAGE_SIZE = 8

function SavedJobsSkeleton() {
  return <div className="mt-6 grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Đang tải việc làm đã lưu">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-200" />)}</div>
}

export default function SavedJobsPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const rawPage = Number(params.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const requestParams = useMemo(() => ({ page, page_size: PAGE_SIZE }), [page])
  const fetcher = useCallback((signal: AbortSignal) => savedJobService.getSavedJobs(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch, replaceData } = usePaginatedQuery<SavedJobListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const [removingJobId, setRemovingJobId] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const errorMessage = error ? savedJobErrorMessage(error, 'list') : null
  const returnTo = `/candidate/saved-jobs${queryKey ? `?${queryKey}` : ''}`

  const setPage = (nextPage: number) => {
    setParams(nextPage <= 1 ? {} : { page: String(nextPage) })
  }

  useEffect(() => {
    if (!data || isFetching || data.total_pages === 0 || page <= data.total_pages) return
    const lastPage = data.total_pages
    void Promise.resolve().then(() => setParams(lastPage <= 1 ? {} : { page: String(lastPage) }, { replace: true }))
  }, [data, isFetching, page, setParams])

  const removeSavedJob = async (jobId: string) => {
    if (!data || removingJobId || isFetching || data.page !== page) return
    setRemovingJobId(jobId)
    setMutationError(null)
    try {
      await savedJobService.unsave(jobId)
      const nextItems = data.items.filter((item) => item.job.id !== jobId)
      const nextTotal = Math.max(0, data.total - 1)
      const nextTotalPages = nextTotal > 0 ? Math.ceil(nextTotal / data.page_size) : 0
      replaceData({ ...data, items: nextItems, total: nextTotal, total_pages: nextTotalPages })
      if (nextItems.length === 0 && page > 1) setPage(page - 1)
      else refetch()
    } catch (requestError) {
      setMutationError(savedJobErrorMessage(requestError, 'unsave'))
    } finally {
      setRemovingJobId(null)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Tìm việc làm</Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Việc làm đã lưu</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Tìm lại những cơ hội bạn đang quan tâm và ứng tuyển khi đã sẵn sàng.</p>
        </div>
        {data && <p className="text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> việc làm đã lưu</p>}
      </header>

      {data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}
      {mutationError && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />{mutationError}</div>}

      {isInitialLoading ? <SavedJobsSkeleton /> : !data && errorMessage ? (
        <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200">
          <AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải việc làm đã lưu.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p>
          <button type="button" onClick={refetch} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Thử lại</button>
        </section>
      ) : data?.items.length === 0 && data.total > 0 ? (
        <div className="mt-6 flex min-h-48 items-center justify-center rounded-2xl bg-white text-sm font-medium text-slate-500 ring-1 ring-slate-200"><Loader2 size={17} className="mr-2 animate-spin text-blue-600" aria-hidden="true" />Đang mở trang trước…</div>
      ) : data?.items.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Bookmark size={27} aria-hidden="true" /></span>
          <h2 className="mt-5 text-xl font-bold text-slate-950">Bạn chưa lưu việc làm nào.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Lưu lại những vị trí phù hợp để dễ dàng xem lại và ứng tuyển sau.</p>
          <Link to="/jobs" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Khám phá việc làm <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      ) : data ? (
        <>
          <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Danh sách việc làm đã lưu">
            {data.items.map((item) => <SavedJobCard key={item.id} item={item} returnTo={returnTo} removing={removingJobId === item.job.id} disabled={Boolean(removingJobId) || isFetching || data.page !== page} onRemove={removeSavedJob} />)}
          </section>
          {data.total_pages > 1 && (
            <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang việc làm đã lưu">
              <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1 || Boolean(removingJobId)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} aria-hidden="true" />Trước</button>
              <span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span>
              <button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages || Boolean(removingJobId)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau <ArrowRight size={16} aria-hidden="true" /></button>
            </nav>
          )}
        </>
      ) : null}
    </main>
  )
}
