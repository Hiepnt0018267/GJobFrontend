import axios from 'axios'
import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, FileText, RefreshCw, RotateCcw, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import JobCard from '../../components/job/JobCard'
import JobFilters, { type JobFilterValues } from '../../components/job/JobFilters'
import JobSearchBar from '../../components/job/JobSearchBar'
import { jobFilterLabel, SALARY_FILTER_VALUES } from '../../config/jobSearchFilters'
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
  RECOMMENDATION_PAGE_SIZES,
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
  const snapshotRef = useRef<RecommendationSnapshotSession | null>(null)
  const activeIdentityRef = useRef(publicQuery.identity)
  const requestIdRef = useRef(0)
  const recoveredIdentityRef = useRef<string | null>(null)
  const previousRefreshVersion = useRef(refreshVersion)

  useEffect(() => {
    const controller = new AbortController()
    cvService.getCVs(controller.signal)
      .then((response) => { if (!controller.signal.aborted) setCvs(response.items) })
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
        if (!controller.signal.aborted && requestId === requestIdRef.current) setIsFetching(false)
      })

    return () => controller.abort()
  }, [generation, publicQuery, reload, replaceWithPageOne])

  const updateParams = useCallback((updates: Record<string, string | null>, resetSession = true) => {
    setSearchParams((current) => updateCandidateRecommendationQuery(current, updates, resetSession))
  }, [setSearchParams])

  const filters = useMemo<JobFilterValues>(() => {
    const salary = new URLSearchParams(queryText).get('salary') ?? ''
    return {
      industry: publicQuery.request.industry ?? '',
      experienceRequirement: publicQuery.request.experience_requirement ?? '',
      level: publicQuery.request.level ?? '',
      workMode: publicQuery.request.work_mode ?? '',
      employmentType: publicQuery.request.employment_type ?? '',
      salary: SALARY_FILTER_VALUES.includes(salary as (typeof SALARY_FILTER_VALUES)[number])
        ? salary as JobFilterValues['salary']
        : '',
      sort: 'newest',
    }
  }, [publicQuery.request, queryText])

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams()
    if (publicQuery.cvId) next.set('cv_id', publicQuery.cvId)
    if (publicQuery.pageSize !== 9) next.set('page_size', String(publicQuery.pageSize))
    setSearchParams(next)
  }, [publicQuery.cvId, publicQuery.pageSize, setSearchParams])

  const activeCvId = data?.selected_cv_id ?? publicQuery.cvId
  const activeCv = cvs.find((cv) => cv.id === activeCvId)
  const currentReturnTo = `/candidate/job-recommendations${queryText ? `?${queryText}` : ''}`
  const isInitialLoading = isFetching && !data
  const hasFilters = Boolean(publicQuery.request.search || publicQuery.request.location || filters.industry || filters.experienceRequirement || filters.level || filters.workMode || filters.employmentType || filters.salary)
  const pages = Array.from({ length: data?.total_pages ?? 0 }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === data?.total_pages || Math.abs(value - (data?.page ?? 1)) <= 1,
  )
  const chips = [
    publicQuery.request.search && { key: 'search', label: `Từ khóa: ${publicQuery.request.search}`, remove: () => updateParams({ search: null, keyword: null }) },
    publicQuery.request.location && { key: 'location', label: `Địa điểm: ${publicQuery.request.location}`, remove: () => updateParams({ location: null }) },
    filters.industry && { key: 'industry', label: jobFilterLabel.industry(filters.industry), remove: () => updateParams({ industry: null }) },
    filters.experienceRequirement && { key: 'experience_requirement', label: jobFilterLabel.experienceRequirement(filters.experienceRequirement), remove: () => updateParams({ experience_requirement: null }) },
    filters.level && { key: 'level', label: jobFilterLabel.level(filters.level), remove: () => updateParams({ level: null }) },
    filters.workMode && { key: 'work_mode', label: jobFilterLabel.workMode(filters.workMode), remove: () => updateParams({ work_mode: null }) },
    filters.employmentType && { key: 'employment_type', label: jobFilterLabel.employmentType(filters.employmentType), remove: () => updateParams({ employment_type: null }) },
    filters.salary && { key: 'salary', label: jobFilterLabel.salary(filters.salary), remove: () => updateParams({ salary: null }) },
  ].filter(Boolean) as Array<{ key: string; label: string; remove: () => void }>

  return (
    <div className="min-h-screen bg-slate-50/70">
      <section className="relative overflow-hidden bg-slate-950 py-9 text-white sm:py-11">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.24),transparent_68%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">Gợi ý việc làm theo CV</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Danh sách được xếp hạng dựa trên thông tin nghề nghiệp trong CV bạn đang sử dụng. Gợi ý hỗ trợ khám phá, không phải đánh giá đạt hoặc không đạt.
            </p>
          </div>
          <div className="rounded-2xl bg-white/8 p-1.5 ring-1 ring-white/12">
            <div className="rounded-[0.875rem] bg-white px-4 py-3 text-slate-900 shadow-premium">
              <label htmlFor="recommendation-cv" className="block text-xs font-bold text-slate-600">CV đang dùng</label>
              <select
                id="recommendation-cv"
                value={publicQuery.cvId ?? ''}
                disabled={cvListLoading}
                onChange={(event) => updateParams({ cv_id: event.target.value || null })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition-colors hover:border-indigo-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:cursor-wait disabled:text-slate-400"
              >
                <option value="">{activeCv ? `Tự động — ${activeCv.title}` : 'Tự động chọn CV mặc định'}</option>
                {cvs.map((cv) => <option key={cv.id} value={cv.id}>{cv.title}{cv.is_default ? ' — Mặc định' : ''}</option>)}
              </select>
              <p className="mt-2 text-xs leading-5 text-slate-500">Ở chế độ tự động, hệ thống chọn một CV đang sẵn sàng từ hồ sơ của bạn. CV bạn chọn thủ công sẽ luôn được giữ nguyên.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <JobFilters
            values={filters}
            showSort={false}
            onClear={clearFilters}
            onChange={(next) => updateParams({
              industry: next.industry || null,
              experience_requirement: next.experienceRequirement || null,
              level: next.level || null,
              work_mode: next.workMode || null,
              employment_type: next.employmentType || null,
              salary: next.salary || null,
            })}
          />

          <div className="min-w-0">
            <JobSearchBar
              key={`${publicQuery.request.search ?? ''}-${publicQuery.request.location ?? ''}`}
              keyword={publicQuery.request.search ?? ''}
              location={publicQuery.request.location ?? ''}
              onSearch={(search, location) => updateParams({ search: search || null, keyword: null, location: location || null })}
            />

            {chips.length > 0 && (
              <section className="mt-4 flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang áp dụng">
                {chips.map((chip) => (
                  <button key={chip.key} type="button" onClick={chip.remove} className="btn-press inline-flex min-h-8 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100">
                    {chip.label}<X size={13} aria-hidden="true" />
                  </button>
                ))}
                <button type="button" onClick={clearFilters} className="min-h-8 px-2 text-xs font-bold text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-blue-700">Xóa bộ lọc</button>
              </section>
            )}

            {notice && <p role="status" className="motion-page mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 ring-1 ring-blue-100">{notice}</p>}

            <section className="mt-6" aria-live="polite">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">Danh sách gợi ý</h2>
                  {data && <p className="mt-1 text-xs leading-5 text-slate-500"><span className="font-bold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> việc làm · {statusSummary(data)}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    Hiển thị
                    <select
                      aria-label="Số việc làm mỗi trang"
                      value={publicQuery.pageSize}
                      onChange={(event) => updateParams({ page_size: event.target.value === '9' ? null : event.target.value })}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      {RECOMMENDATION_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                  </label>
                  <QueryFetchFeedback isFetching={isFetching && Boolean(data)} errorMessage={data && error ? error : null} onRetry={() => setReload((value) => value + 1)} />
                </div>
              </div>

              <RecommendationCvAvailability data={data} explicitCvId={publicQuery.cvId} />

              {isInitialLoading ? <RecommendationSkeleton /> : !data && error ? (
                <div role="alert" className="rounded-2xl bg-white px-6 py-12 text-center shadow-xs ring-1 ring-slate-200">
                  <AlertCircle className="mx-auto text-rose-500" size={34} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold text-slate-950">Không thể tải gợi ý việc làm</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{error}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => restartSession()} className="btn-press inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                      <RefreshCw size={16} aria-hidden="true" />Thử lại
                    </button>
                    <Link to="/jobs" className="inline-flex min-h-11 items-center rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-200">Xem tất cả việc làm</Link>
                  </div>
                </div>
              ) : data?.items.length === 0 ? (
                <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-xs ring-1 ring-slate-200">
                  <BriefcaseBusiness className="mx-auto text-blue-600" size={34} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold text-slate-950">Hiện chưa có gợi ý việc làm để hiển thị</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{hasFilters ? 'Thử thay đổi bộ lọc hoặc xem danh sách việc làm thông thường.' : 'Bạn vẫn có thể khám phá toàn bộ việc làm đang tuyển.'}</p>
                  <Link to="/jobs" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Xem tất cả việc làm</Link>
                </div>
              ) : data ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                          <button type="button" disabled={isFetching} aria-current={value === data.page ? 'page' : undefined} onClick={() => updateParams({ page: value === 1 ? null : String(value) }, false)} className={`btn-press min-h-11 min-w-11 rounded-xl px-3 py-2 text-xs font-bold ${value === data.page ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{value}</button>
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

            <aside className="mt-10 flex flex-col gap-3 rounded-2xl bg-slate-900 px-5 py-5 text-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 shrink-0 text-indigo-300" size={18} aria-hidden="true" />
                <p className="max-w-2xl text-sm leading-6">Gợi ý dựa trên thông tin nghề nghiệp trong CV và chỉ mang tính hỗ trợ khám phá việc làm.</p>
              </div>
              <Link to="/jobs" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-100">Tìm việc theo cách thông thường<RotateCcw size={15} aria-hidden="true" /></Link>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
