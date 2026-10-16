import axios from 'axios'
import { AlertCircle, BriefcaseBusiness, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import JobCard from '../../components/job/JobCard'
import JobFilters, { type JobFilterValues } from '../../components/job/JobFilters'
import { jobFilterLabel, jobSortLabels, SALARY_FILTER_VALUES } from '../../config/jobSearchFilters'
import JobSearchBar from '../../components/job/JobSearchBar'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { jobService } from '../../services/jobService'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_REQUIREMENTS,
  INDUSTRIES,
  JOB_LEVELS,
  JOB_SORT_OPTIONS,
  WORK_MODES,
  type JobListResponse,
  type JobSearchParams,
} from '../../types/job'

const PAGE_SIZE = 9
const hasValue = <T extends string>(values: readonly T[], value: string | null): value is T =>
  value !== null && values.includes(value as T)

const messageFor = (error: unknown) =>
  !axios.isAxiosError(error) || !error.response
    ? 'Không thể kết nối tới máy chủ.'
    : ({
        400: 'Yêu cầu không hợp lệ.',
        401: 'Phiên đăng nhập không hợp lệ.',
        403: 'Bạn không có quyền thực hiện thao tác này.',
        404: 'Không tìm thấy việc làm.',
        409: 'Dữ liệu đang có xung đột. Vui lòng thử lại.',
        422: 'Thông tin tìm kiếm không hợp lệ.',
        500: 'Máy chủ đang gặp sự cố. Vui lòng thử lại.',
      }[error.response.status] ?? 'Không thể tải danh sách việc làm. Vui lòng thử lại.')

function Skeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Đang tải danh sách việc làm">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex h-64 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-5 w-3/4 rounded-md" />
                <div className="skeleton-shimmer h-3.5 w-1/2 rounded-md" />
              </div>
            </div>
            <div className="skeleton-shimmer mt-4 h-6 w-32 rounded-md" />
            <div className="flex gap-2 pt-2">
              <div className="skeleton-shimmer h-5 w-20 rounded-md" />
              <div className="skeleton-shimmer h-5 w-16 rounded-md" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="skeleton-shimmer h-4 w-24 rounded-md" />
            <div className="skeleton-shimmer h-4 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const query = searchParams.toString()
  const parsedParams = useMemo(() => new URLSearchParams(query), [query])
  const search = (parsedParams.get('search') ?? parsedParams.get('keyword') ?? '').trim()
  const location = (parsedParams.get('location') ?? '').trim()

  const filters = useMemo<JobFilterValues>(() => {
    const industry = parsedParams.get('industry')
    const experienceRequirement = parsedParams.get('experience_requirement')
    const level = parsedParams.get('level')
    const workMode = parsedParams.get('work_mode')
    const employmentType = parsedParams.get('employment_type')
    const sort = parsedParams.get('sort')
    const salary = parsedParams.get('salary')
    return {
      industry: hasValue(INDUSTRIES, industry) ? industry : '',
      experienceRequirement: hasValue(EXPERIENCE_REQUIREMENTS, experienceRequirement) ? experienceRequirement : '',
      level: hasValue(JOB_LEVELS, level) ? level : '',
      workMode: hasValue(WORK_MODES, workMode) ? workMode : '',
      employmentType: hasValue(EMPLOYMENT_TYPES, employmentType) ? employmentType : '',
      salary: hasValue(SALARY_FILTER_VALUES, salary) ? salary : '',
      sort: hasValue(JOB_SORT_OPTIONS, sort) ? sort : 'newest',
    }
  }, [parsedParams])

  const page = Math.max(1, Number(parsedParams.get('page')) || 1)
  const requestParams = useMemo<JobSearchParams>(() => {
    const params: JobSearchParams = { page, page_size: PAGE_SIZE, sort: filters.sort }
    if (search) params.search = search
    if (location) params.location = location
    if (filters.industry) params.industry = filters.industry
    if (filters.experienceRequirement) params.experience_requirement = filters.experienceRequirement
    if (filters.level) params.level = filters.level
    if (filters.workMode) params.work_mode = filters.workMode
    if (filters.employmentType) params.employment_type = filters.employmentType
    if (filters.salary === 'NEGOTIABLE') params.salary_type = 'NEGOTIABLE'
    else {
      const salary = filters.salary.match(/^(\d*)-(\d*)$/)
      if (salary?.[1]) params.salary_min = Number(salary[1])
      if (salary?.[2]) params.salary_max = Number(salary[2])
    }
    return params
  }, [filters, location, page, search])

  const fetcher = useCallback((signal: AbortSignal) => jobService.getJobs(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<JobListResponse>({
    queryKey: query,
    refreshKey: refreshVersion,
    fetcher,
  })
  const errorMessage = error ? messageFor(error) : null

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        Object.entries(updates).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
        if (resetPage) next.set('page', '1')
        return next
      })
    },
    [setSearchParams]
  )

  const clearAll = useCallback(() => setSearchParams({}), [setSearchParams])

  const pages = Array.from({ length: data?.total_pages ?? 0 }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === data?.total_pages || Math.abs(value - (data?.page ?? 1)) <= 1
  )

  const chips = [
    search && { key: 'search', label: `Từ khóa: ${search}`, remove: () => updateParams({ search: null, keyword: null }) },
    location && { key: 'location', label: `Địa điểm: ${location}`, remove: () => updateParams({ location: null }) },
    filters.industry && { key: 'industry', label: jobFilterLabel.industry(filters.industry), remove: () => updateParams({ industry: null }) },
    filters.experienceRequirement && {
      key: 'experience_requirement',
      label: jobFilterLabel.experienceRequirement(filters.experienceRequirement),
      remove: () => updateParams({ experience_requirement: null }),
    },
    filters.level && { key: 'level', label: jobFilterLabel.level(filters.level), remove: () => updateParams({ level: null }) },
    filters.workMode && { key: 'work_mode', label: jobFilterLabel.workMode(filters.workMode), remove: () => updateParams({ work_mode: null }) },
    filters.salary && { key: 'salary', label: jobFilterLabel.salary(filters.salary), remove: () => updateParams({ salary: null }) },
    filters.employmentType && {
      key: 'employment_type',
      label: jobFilterLabel.employmentType(filters.employmentType),
      remove: () => updateParams({ employment_type: null }),
    },
  ].filter(Boolean) as Array<{ key: string; label: string; remove: () => void }>

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Figma Branded Header with integrated Search Bar */}
      <section
        className="relative overflow-hidden py-10 sm:py-14 text-white rounded-b-3xl sm:rounded-b-[48px] shadow-lg shadow-teal-900/10"
        style={{
          background: 'linear-gradient(135deg, #49BBBD 0%, #49BBBD 50%, #49BBBD 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
              Cơ hội nghề nghiệp xác thực
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Khám phá việc làm lý tưởng
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-teal-50/90 max-w-xl leading-relaxed">
              Tìm kiếm và ứng tuyển trực tiếp vào các vị trí phù hợp với năng lực chuyên môn của bạn.
            </p>
          </div>
          <div className="mt-6 max-w-4xl">
            <JobSearchBar
              key={`${search}-${location}`}
              keyword={search}
              location={location}
              onSearch={(nextSearch, nextLocation) =>
                updateParams({ search: nextSearch || null, keyword: null, location: nextLocation || null })
              }
            />
          </div>
        </div>
      </section>

      {/* Main Jobs Layout */}
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0 lg:px-8">
        {/* Sidebar Filters */}
        <JobFilters
          values={filters}
          onChange={(next) =>
            updateParams({
              industry: next.industry || null,
              experience_requirement: next.experienceRequirement || null,
              level: next.level || null,
              work_mode: next.workMode || null,
              employment_type: next.employmentType || null,
              salary: next.salary || null,
              sort: next.sort === 'newest' ? null : next.sort,
            })
          }
          onClear={clearAll}
        />

        {/* Content Column */}
        <div className="min-w-0 space-y-5">
          {/* Active Chips */}
          {chips.length > 0 && (
            <section className="flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang áp dụng">
              <span className="mr-1 text-xs font-bold text-slate-600">Đang lọc:</span>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.remove}
                  className="btn-press inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-teal-200/90 bg-teal-50 px-3 py-1 text-xs font-bold text-[#49BBBD] transition-colors hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  {chip.label}
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="btn-press ml-1 text-xs font-bold text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-[#49BBBD]"
              >
                Xóa tất cả
              </button>
            </section>
          )}

          <section aria-live="polite">
            {/* Results Header + In-line Sort Controls */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3.5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-[Plus_Jakarta_Sans,sans-serif]">Việc làm đang tuyển</h2>
                {data && (
                  <p className="text-xs text-slate-500">
                    <span className="font-bold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> vị
                    trí phù hợp
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Desktop Sort Dropdown right at results header */}
                <div className="hidden sm:flex sm:items-center sm:gap-2">
                  <span className="text-xs font-semibold text-slate-500">Sắp xếp:</span>
                  <select
                    aria-label="Sắp xếp việc làm"
                    value={filters.sort}
                    onChange={(event) =>
                      updateParams({ sort: event.target.value === 'newest' ? null : event.target.value })
                    }
                    className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs outline-none transition-all duration-150 hover:border-teal-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  >
                    {JOB_SORT_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {jobSortLabels[value]}
                      </option>
                    ))}
                  </select>
                </div>

                <QueryFetchFeedback
                  isFetching={isFetching && Boolean(data)}
                  errorMessage={data && errorMessage ? errorMessage : null}
                  onRetry={refetch}
                />
              </div>
            </div>

            {/* Job Grid / Feedback */}
            {isInitialLoading ? (
              <Skeleton />
            ) : !data && errorMessage ? (
              <div role="alert" className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-premium">
                <AlertCircle className="mx-auto text-rose-500" size={32} aria-hidden="true" />
                <h3 className="mt-4 text-base font-bold text-slate-900 font-[Plus_Jakarta_Sans,sans-serif]">Không thể tải danh sách việc làm</h3>
                <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-[#49BBBD] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#49BBBD]/20 hover:bg-[#49BBBD]/90 active:bg-[#49BBBD]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] focus-visible:ring-offset-2"
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Thử lại
                </button>
              </div>
            ) : data?.items.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-premium">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#49BBBD] ring-1 ring-[#49BBBD]/20">
                  <BriefcaseBusiness size={28} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900 font-[Plus_Jakarta_Sans,sans-serif]">
                  Không tìm thấy việc làm phù hợp với bộ lọc hiện tại
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Hãy thử thay đổi từ khóa hoặc mở rộng tiêu chí tìm kiếm để có nhiều kết quả hơn.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="btn-press mt-5 inline-flex rounded-xl bg-[#49BBBD] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#49BBBD]/20 hover:bg-[#49BBBD]/90 active:bg-[#49BBBD]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] focus-visible:ring-offset-2"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            ) : data ? (
              <>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {data.total_pages > 1 && (
                  <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang việc làm">
                    <button
                      type="button"
                      disabled={data.page <= 1}
                      onClick={() => updateParams({ page: String(data.page - 1) }, false)}
                      className="btn-press inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                      Trước
                    </button>
                    {pages.map((value, index) => (
                      <span key={value} className="contents">
                        {index > 0 && value - pages[index - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
                        <button
                          type="button"
                          onClick={() => updateParams({ page: String(value) }, false)}
                          className={`btn-press min-h-10 min-w-10 rounded-xl px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] ${
                            value === data.page
                              ? 'bg-[#49BBBD] text-white shadow-sm shadow-[#49BBBD]/30 font-extrabold'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {value}
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      disabled={data.page >= data.total_pages}
                      onClick={() => updateParams({ page: String(data.page + 1) }, false)}
                      className="btn-press inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sau
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  )
}
