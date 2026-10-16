import axios from 'axios'
import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, FileText, RefreshCw, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import JobCard from '../../components/job/JobCard'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { cvService } from '../../services/cvService'
import { jobRecommendationService } from '../../services/jobRecommendationService'
import type { CVListItem } from '../../types/cv'
import type { CandidateJobRecommendationListResponse, CandidateJobRecommendationParams } from '../../types/job'
import {
  candidateRecommendationQuery,
  compatibleRecommendationSnapshot,
  isCurrentRecommendationRequest,
  recommendationErrorMessage,
  shouldFetchRecommendations,
  shouldRecoverRecommendationSnapshot,
  updateCandidateRecommendationQuery,
  type RecommendationSnapshotSession,
} from '../../utils/jobRecommendation'

function RecommendationSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Đang tải gợi ý việc làm">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-80 rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200/80">
          <div className="skeleton-shimmer h-7 w-36 rounded-lg" />
          <div className="mt-5 flex gap-3">
            <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-5 w-4/5 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-2/5 rounded-md" />
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            <div className="skeleton-shimmer h-4 w-full rounded-md" />
            <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
            <div className="skeleton-shimmer h-16 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

function statusSummary(data: CandidateJobRecommendationListResponse) {
  return [
    data.ranked_count > 0 && `${data.ranked_count} đã xếp hạng`,
    data.pending_count > 0 && `${data.pending_count} đang chuẩn bị`,
    data.unavailable_count > 0 && `${data.unavailable_count} chưa thể xếp hạng`,
    data.error_count > 0 && `${data.error_count} tạm thời gặp lỗi`,
  ].filter(Boolean).join(' · ')
}

export function RecommendationCvAvailability({
  data,
  explicitCvId,
}: {
  data: CandidateJobRecommendationListResponse | null
  explicitCvId: string | null
}) {
  if (!data || data.candidate_signal_status !== 'unavailable') return null
  const explicitUnavailable = Boolean(explicitCvId && data.selected_cv_id === explicitCvId)

  return (
    <div className="mb-5 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 shrink-0 text-amber-700" size={20} aria-hidden="true" />
        <div>
          <h3 className="font-bold text-amber-950">
            {explicitUnavailable ? 'CV này chưa sẵn sàng để tạo gợi ý việc làm' : 'Bạn cần một CV hợp lệ để nhận gợi ý việc làm'}
          </h3>
          <p className="mt-1 text-sm leading-6 text-amber-900/80">
            {explicitUnavailable ? 'Bạn có thể chọn CV khác hoặc kiểm tra lại thông tin của CV này.' : 'Hãy tạo, tải lên hoặc hoàn thiện một CV rồi quay lại trang này.'}
          </p>
          <Link to="/candidate/cvs" className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-amber-900 px-4 py-2 text-sm font-bold text-white hover:bg-amber-950">Quản lý CV</Link>
        </div>
      </div>
    </div>
  )
}

export function RecommendationStartPanel({
  cvs,
  isLoading,
  selectedCvId,
  isStarting,
  onSelect,
  onStart,
}: {
  cvs: CVListItem[]
  isLoading: boolean
  selectedCvId: string
  isStarting: boolean
  onSelect: (cvId: string) => void
  onStart: () => void
}) {
  return (
    <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-premium ring-1 ring-slate-200/80" aria-labelledby="recommendation-setup-title">
      <div className="border-b border-slate-100 px-5 py-6 sm:px-8 sm:py-7">
        <h2 id="recommendation-setup-title" className="text-2xl font-extrabold tracking-tight text-slate-950">Chọn CV để nhận gợi ý</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Chọn hồ sơ bạn muốn sử dụng. Hệ thống chỉ bắt đầu đối chiếu sau khi bạn bấm nút gợi ý.</p>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-7">
        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Đang tải danh sách CV">
            {[0, 1].map((item) => <div key={item} className="skeleton-shimmer h-20 rounded-2xl" />)}
          </div>
        ) : cvs.length === 0 ? (
          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <h3 className="font-bold text-amber-950">Bạn chưa có CV để nhận gợi ý</h3>
            <p className="mt-1 text-sm leading-6 text-amber-900/80">Hãy tạo hoặc tải lên một CV, sau đó quay lại để bắt đầu đối chiếu.</p>
            <Link to="/candidate/cvs" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-amber-900 px-4 py-2 text-sm font-bold text-white hover:bg-amber-950">Tạo hoặc tải CV</Link>
          </div>
        ) : (
          <fieldset id="recommendation-cv">
            <legend className="text-sm font-bold text-slate-900">CV dùng để gợi ý</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {cvs.map((cv) => {
                const selected = selectedCvId === cv.id
                return (
                  <label key={cv.id} className={`relative flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 transition-all ${selected ? 'bg-teal-50/70 ring-2 ring-[#49BBBD]' : 'bg-white ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'}`}>
                    <input
                      type="radio"
                      name="recommendation-cv"
                      value={cv.id}
                      checked={selected}
                      onChange={() => onSelect(cv.id)}
                      className="mt-1 h-4 w-4 accent-[#49BBBD]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-bold text-slate-950">{cv.title}</span>
                        {cv.is_default && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#49BBBD] ring-1 ring-teal-200">Mặc định</span>}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">{cv.source_type === 'UPLOADED' ? 'CV tải lên' : 'CV tạo trên GJob'} · Cập nhật {new Date(cv.updated_at).toLocaleDateString('vi-VN')}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}

        {cvs.length > 0 && !isLoading && (
          <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-slate-500">Kết quả hiển thị thứ hạng và lý do liên quan từ dữ liệu hệ thống. GJob không tự tạo phần trăm phù hợp khi chưa có điểm số đã được hiệu chỉnh.</p>
            <button
              type="button"
              onClick={onStart}
              disabled={!selectedCvId || isStarting}
              className="btn-press inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#49BBBD] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#3fa9ab] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={17} aria-hidden="true" />Gợi ý việc làm bằng AI
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default function CandidateJobRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryText = searchParams.toString()
  const publicQuery = useMemo(() => candidateRecommendationQuery(new URLSearchParams(queryText)), [queryText])
  const [data, setData] = useState<CandidateJobRecommendationListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [reload, setReload] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [cvs, setCvs] = useState<CVListItem[]>([])
  const [cvListLoading, setCvListLoading] = useState(true)
  const [selectedCvId, setSelectedCvId] = useState(publicQuery.cvId ?? '')
  const [hasStarted, setHasStarted] = useState(false)
  const [startedCvId, setStartedCvId] = useState<string | null>(null)
  const snapshotRef = useRef<RecommendationSnapshotSession | null>(null)
  const activeIdentityRef = useRef(publicQuery.identity)
  const requestIdRef = useRef(0)
  const startPendingRef = useRef(false)
  const recoveredIdentityRef = useRef<string | null>(null)
  const previousRefreshVersion = useRef(refreshVersion)

  useEffect(() => {
    const controller = new AbortController()
    cvService.getCVs(controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return
        setCvs(response.items)
        setSelectedCvId((current) => current || response.items.find((cv) => cv.is_default)?.id || response.items[0]?.id || '')
      })
      .catch(() => { if (!controller.signal.aborted) setCvs([]) })
      .finally(() => { if (!controller.signal.aborted) setCvListLoading(false) })
    return () => controller.abort()
  }, [])

  const replaceWithPageOne = useCallback(() => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('page')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const restartSession = useCallback((message?: string) => {
    snapshotRef.current = null
    recoveredIdentityRef.current = null
    setData(null)
    setError(null)
    setNotice(message ?? null)
    setGeneration((value) => value + 1)
    replaceWithPageOne()
  }, [replaceWithPageOne])

  useEffect(() => {
    if (previousRefreshVersion.current === refreshVersion) return
    previousRefreshVersion.current = refreshVersion
    restartSession()
  }, [refreshVersion, restartSession])

  useEffect(() => {
    if (!shouldFetchRecommendations(hasStarted, publicQuery.cvId, startedCvId)) {
      return
    }

    if (activeIdentityRef.current !== publicQuery.identity) {
      activeIdentityRef.current = publicQuery.identity
      snapshotRef.current = null
      recoveredIdentityRef.current = null
      setData(null)
      setError(null)
      setNotice(null)
    }

    const compatibleSnapshot = compatibleRecommendationSnapshot(snapshotRef.current, publicQuery.identity, generation)

    if (publicQuery.page > 1 && !compatibleSnapshot) {
      replaceWithPageOne()
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    const responseIdentity = `${publicQuery.identity}|${generation}|${publicQuery.page}|${requestId}`
    const request: CandidateJobRecommendationParams = { ...publicQuery.request }
    if (compatibleSnapshot) request.ranking_snapshot = compatibleSnapshot
    setIsFetching(true)
    setError(null)

    jobRecommendationService.getRecommendations(request, controller.signal)
      .then((response) => {
        const activeResponseIdentity = `${activeIdentityRef.current}|${generation}|${publicQuery.page}|${requestIdRef.current}`
        if (controller.signal.aborted || !isCurrentRecommendationRequest(activeResponseIdentity, responseIdentity)) return
        snapshotRef.current = { identity: publicQuery.identity, generation, token: response.ranking_snapshot }
        setData(response)
        setNotice(null)
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted || axios.isCancel(requestError)) return
        const activeResponseIdentity = `${activeIdentityRef.current}|${generation}|${publicQuery.page}|${requestIdRef.current}`
        if (!isCurrentRecommendationRequest(activeResponseIdentity, responseIdentity)) return
        if (shouldRecoverRecommendationSnapshot(requestError, publicQuery.identity, recoveredIdentityRef.current)) {
          recoveredIdentityRef.current = publicQuery.identity
          snapshotRef.current = null
          setData(null)
          setNotice('Danh sách gợi ý đã được cập nhật.')
          setGeneration((value) => value + 1)
          replaceWithPageOne()
          return
        }
        setError(recommendationErrorMessage(requestError))
      })
      .finally(() => {
        startPendingRef.current = false
        if (!controller.signal.aborted && requestId === requestIdRef.current) setIsFetching(false)
      })

    return () => controller.abort()
  }, [generation, hasStarted, publicQuery, reload, replaceWithPageOne, startedCvId])

  const startRecommendations = useCallback(() => {
    if (!selectedCvId || isFetching || startPendingRef.current) return
    startPendingRef.current = true
    snapshotRef.current = null
    recoveredIdentityRef.current = null
    setData(null)
    setError(null)
    setNotice(null)
    setStartedCvId(selectedCvId)
    setHasStarted(true)
    setGeneration((value) => value + 1)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('cv_id', selectedCvId)
      next.delete('page')
      next.delete('ranking_snapshot')
      return next
    })
  }, [isFetching, selectedCvId, setSearchParams])

  const changeCv = useCallback(() => {
    requestIdRef.current += 1
    startPendingRef.current = false
    snapshotRef.current = null
    recoveredIdentityRef.current = null
    setHasStarted(false)
    setStartedCvId(null)
    setData(null)
    setError(null)
    setNotice(null)
    setIsFetching(false)
    setSelectedCvId(publicQuery.cvId ?? selectedCvId)
  }, [publicQuery.cvId, selectedCvId])

  const updateParams = useCallback((updates: Record<string, string | null>, resetSession = true) => {
    setSearchParams((current) => updateCandidateRecommendationQuery(current, updates, resetSession))
  }, [setSearchParams])

  const activeCvId = data?.selected_cv_id ?? startedCvId ?? publicQuery.cvId
  const activeCv = cvs.find((cv) => cv.id === activeCvId)
  const currentReturnTo = `/candidate/job-recommendations${queryText ? `?${queryText}` : ''}`
  const isInitialLoading = isFetching && !data
  const pages = Array.from({ length: data?.total_pages ?? 0 }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === data?.total_pages || Math.abs(value - (data?.page ?? 1)) <= 1,
  )

  return (
    <div className="min-h-screen bg-slate-50/70">
      <section className="border-b border-teal-100 bg-[#eaf8f8]">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-11 lg:px-8">
          <div className="flex max-w-3xl items-start gap-4">
            <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#49BBBD] text-white shadow-sm">
              <Sparkles size={21} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">Gợi ý việc làm theo CV</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Chọn một CV để đối chiếu với các việc làm đang tuyển. Mỗi kết quả sẽ cho biết vì sao phù hợp, hoặc vì sao hệ thống chưa thể giải thích.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {!hasStarted ? (
          <RecommendationStartPanel
            cvs={cvs}
            isLoading={cvListLoading}
            selectedCvId={selectedCvId}
            isStarting={isFetching}
            onSelect={setSelectedCvId}
            onStart={startRecommendations}
          />
        ) : (
          <div className="min-w-0">
            <section className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-xs ring-1 ring-slate-200/80 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-label="CV đang dùng để gợi ý">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#49BBBD]"><FileText size={19} aria-hidden="true" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">CV đang được đối chiếu</p>
                  <p className="truncate text-base font-bold text-slate-950">{activeCv?.title ?? 'CV đã chọn'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={changeCv} className="btn-press inline-flex min-h-10 items-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">Đổi CV</button>
                <button type="button" onClick={() => restartSession()} disabled={isFetching} className="btn-press inline-flex min-h-10 items-center gap-2 rounded-xl bg-teal-50 px-4 py-2 text-xs font-bold text-[#49BBBD] ring-1 ring-teal-200 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50">
                  <RefreshCw size={14} aria-hidden="true" />Tạo lại gợi ý
                </button>
              </div>
            </section>

            {notice && <p role="status" className="motion-page mt-5 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-[#49BBBD] ring-1 ring-teal-100">{notice}</p>}

            <section className="mt-8" aria-live="polite">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">Kết quả đối chiếu</h2>
                  {data && <p className="mt-1 text-xs leading-5 text-slate-500"><span className="font-bold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> việc làm · {statusSummary(data)}</p>}
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">Chỉ những công việc có nhãn xếp hạng mới là gợi ý đã hoàn tất. Mỗi thẻ sẽ hiển thị lý do phù hợp hoặc trạng thái giải thích hiện tại.</p>
                </div>
                <QueryFetchFeedback isFetching={isFetching && Boolean(data)} errorMessage={data && error ? error : null} onRetry={() => setReload((value) => value + 1)} />
              </div>

              <RecommendationCvAvailability data={data} explicitCvId={publicQuery.cvId} />

              {isInitialLoading ? <RecommendationSkeleton /> : !data && error ? (
                <div role="alert" className="rounded-2xl bg-white px-6 py-12 text-center shadow-xs ring-1 ring-slate-200">
                  <AlertCircle className="mx-auto text-rose-500" size={34} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold text-slate-950">Không thể tải gợi ý việc làm</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{error}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => restartSession()} className="btn-press inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#49BBBD] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#49BBBD]/90 active:bg-[#49BBBD]/80">
                      <RefreshCw size={16} aria-hidden="true" />Thử lại
                    </button>
                    <Link to="/jobs" className="inline-flex min-h-11 items-center rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-200">Xem tất cả việc làm</Link>
                  </div>
                </div>
              ) : data?.items.length === 0 ? (
                <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-xs ring-1 ring-slate-200">
                  <BriefcaseBusiness className="mx-auto text-[#49BBBD]" size={34} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold text-slate-950">Chưa có kết quả phù hợp để hiển thị</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Bạn có thể chọn CV khác hoặc tạo lại gợi ý khi dữ liệu việc làm được cập nhật.</p>
                  <button type="button" onClick={changeCv} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#49BBBD] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3fa9ab]">Chọn CV khác</button>
                </div>
              ) : data ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    {data.items.map((item) => (
                      <JobCard
                        key={item.id}
                        job={item}
                        returnTo={currentReturnTo}
                        recommendation={{ rank: item.recommendation_rank, status: item.recommendation_status, reasons: item.reasons }}
                      />
                    ))}
                  </div>

                  {data.total_pages > 1 && (
                    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang gợi ý việc làm">
                      <button type="button" disabled={data.page <= 1 || isFetching} onClick={() => updateParams({ page: String(data.page - 1) }, false)} className="btn-press inline-flex min-h-11 items-center gap-1 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        <ArrowLeft size={16} aria-hidden="true" />Trước
                      </button>
                      {pages.map((value, index) => (
                        <span key={value} className="contents">
                          {index > 0 && value - pages[index - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
                          <button type="button" disabled={isFetching} aria-current={value === data.page ? 'page' : undefined} onClick={() => updateParams({ page: value === 1 ? null : String(value) }, false)} className={`btn-press min-h-11 min-w-11 rounded-xl px-3 py-2 text-xs font-bold ${value === data.page ? 'bg-[#49BBBD] text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{value}</button>
                        </span>
                      ))}
                      <button type="button" disabled={data.page >= data.total_pages || isFetching} onClick={() => updateParams({ page: String(data.page + 1) }, false)} className="btn-press inline-flex min-h-11 items-center gap-1 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        Sau<ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </nav>
                  )}
                </>
              ) : null}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
