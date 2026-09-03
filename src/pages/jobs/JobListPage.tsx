import axios from 'axios'
import { AlertCircle, BriefcaseBusiness, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import JobCard from '../../components/job/JobCard'
import JobFilters, { type JobFilterValues } from '../../components/job/JobFilters'
import { jobFilterLabel, SALARY_FILTER_VALUES } from '../../config/jobSearchFilters'
import JobSearchBar from '../../components/job/JobSearchBar'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { jobService } from '../../services/jobService'
import { EMPLOYMENT_TYPES, EXPERIENCE_REQUIREMENTS, INDUSTRIES, JOB_LEVELS, JOB_SORT_OPTIONS, WORK_MODES, type JobListResponse, type JobSearchParams } from '../../types/job'

const PAGE_SIZE = 9
const hasValue = <T extends string>(values: readonly T[], value: string | null): value is T => value !== null && values.includes(value as T)
const messageFor = (error: unknown) => !axios.isAxiosError(error) || !error.response ? 'Không thể kết nối tới máy chủ.' : ({ 400: 'Yêu cầu không hợp lệ.', 401: 'Phiên đăng nhập không hợp lệ.', 403: 'Bạn không có quyền thực hiện thao tác này.', 404: 'Không tìm thấy việc làm.', 409: 'Dữ liệu đang có xung đột. Vui lòng thử lại.', 422: 'Thông tin tìm kiếm không hợp lệ.', 500: 'Máy chủ đang gặp sự cố. Vui lòng thử lại.' }[error.response.status] ?? 'Không thể tải danh sách việc làm. Vui lòng thử lại.')
function Skeleton() { return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Đang tải danh sách việc làm">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-200" />)}</div> }

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
    return { industry: hasValue(INDUSTRIES, industry) ? industry : '', experienceRequirement: hasValue(EXPERIENCE_REQUIREMENTS, experienceRequirement) ? experienceRequirement : '', level: hasValue(JOB_LEVELS, level) ? level : '', workMode: hasValue(WORK_MODES, workMode) ? workMode : '', employmentType: hasValue(EMPLOYMENT_TYPES, employmentType) ? employmentType : '', salary: hasValue(SALARY_FILTER_VALUES, salary) ? salary : '', sort: hasValue(JOB_SORT_OPTIONS, sort) ? sort : 'newest' }
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
    else { const salary = filters.salary.match(/^(\d*)-(\d*)$/); if (salary?.[1]) params.salary_min = Number(salary[1]); if (salary?.[2]) params.salary_max = Number(salary[2]) }
    return params
  }, [filters, location, page, search])
  const fetcher = useCallback((signal: AbortSignal) => jobService.getJobs(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<JobListResponse>({ queryKey: query, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? messageFor(error) : null
  const updateParams = useCallback((updates: Record<string, string | null>, resetPage = true) => {
    setSearchParams((current) => { const next = new URLSearchParams(current); Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); if (resetPage) next.set('page', '1'); return next })
  }, [setSearchParams])
  const clearAll = useCallback(() => setSearchParams({}), [setSearchParams])
  const pages = Array.from({ length: data?.total_pages ?? 0 }, (_, index) => index + 1).filter((value) => value === 1 || value === data?.total_pages || Math.abs(value - (data?.page ?? 1)) <= 1)
  const chips = [search && { key: 'search', label: `Từ khóa: ${search}`, remove: () => updateParams({ search: null, keyword: null }) }, location && { key: 'location', label: `Địa điểm: ${location}`, remove: () => updateParams({ location: null }) }, filters.industry && { key: 'industry', label: jobFilterLabel.industry(filters.industry), remove: () => updateParams({ industry: null }) }, filters.experienceRequirement && { key: 'experience_requirement', label: jobFilterLabel.experienceRequirement(filters.experienceRequirement), remove: () => updateParams({ experience_requirement: null }) }, filters.level && { key: 'level', label: jobFilterLabel.level(filters.level), remove: () => updateParams({ level: null }) }, filters.workMode && { key: 'work_mode', label: jobFilterLabel.workMode(filters.workMode), remove: () => updateParams({ work_mode: null }) }, filters.salary && { key: 'salary', label: jobFilterLabel.salary(filters.salary), remove: () => updateParams({ salary: null }) }, filters.employmentType && { key: 'employment_type', label: jobFilterLabel.employmentType(filters.employmentType), remove: () => updateParams({ employment_type: null }) }, filters.sort !== 'newest' && { key: 'sort', label: jobFilterLabel.sort(filters.sort), remove: () => updateParams({ sort: null }) }].filter(Boolean) as Array<{ key: string; label: string; remove: () => void }>

  return <div className="min-h-screen bg-slate-50">
    <section className="bg-slate-900 py-12 text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold tracking-tight">Tìm việc làm</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Tìm theo vị trí, kỹ năng, công ty hoặc địa điểm làm việc.</p><div className="mt-7"><JobSearchBar key={`${search}-${location}`} keyword={search} location={location} onSearch={(nextSearch, nextLocation) => updateParams({ search: nextSearch || null, keyword: null, location: nextLocation || null })} /></div></div></section>
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0 lg:px-8">
      <JobFilters values={filters} onChange={(next) => updateParams({ industry: next.industry || null, experience_requirement: next.experienceRequirement || null, level: next.level || null, work_mode: next.workMode || null, employment_type: next.employmentType || null, salary: next.salary || null, sort: next.sort === 'newest' ? null : next.sort })} onClear={clearAll} />
      <div className="min-w-0 space-y-5">{chips.length > 0 && <section className="flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang áp dụng"><span className="mr-1 text-sm font-semibold text-slate-700">Đang lọc:</span>{chips.map((chip) => <button key={chip.key} type="button" onClick={chip.remove} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{chip.label}<X size={14} aria-hidden="true" /></button>)}<button type="button" onClick={clearAll} className="ml-1 text-sm font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-blue-700">Xóa tất cả</button></section>}
      <section aria-live="polite"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-950">Việc làm đang tuyển</h2>{data && <p className="mt-1 text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> kết quả</p>}</div><QueryFetchFeedback isFetching={isFetching && Boolean(data)} errorMessage={data && errorMessage ? errorMessage : null} onRetry={refetch} /></div>
        {isInitialLoading ? <Skeleton /> : !data && errorMessage ? <div role="alert" className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-500" size={32} aria-hidden="true" /><h3 className="mt-4 font-semibold text-slate-900">Không thể tải việc làm</h3><p className="mt-2 text-sm text-slate-500">{errorMessage}</p><button type="button" onClick={refetch} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><RefreshCw size={15} aria-hidden="true" />Thử lại</button></div> : data?.items.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"><BriefcaseBusiness className="mx-auto text-blue-600" size={34} aria-hidden="true" /><h3 className="mt-4 font-semibold text-slate-900">Không tìm thấy việc làm phù hợp với bộ lọc hiện tại.</h3><p className="mt-2 text-sm text-slate-500">Hãy thử thay đổi từ khóa hoặc mở rộng bộ lọc tìm kiếm.</p><button type="button" onClick={clearAll} className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Xóa bộ lọc</button></div> : data ? <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.items.map((job) => <JobCard key={job.id} job={job} />)}</div>{data.total_pages > 1 && <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang"><button type="button" disabled={data.page <= 1} onClick={() => updateParams({ page: String(data.page - 1) }, false)} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} aria-hidden="true" />Trước</button>{pages.map((value, index) => <span key={value} className="contents">{index > 0 && value - pages[index - 1] > 1 && <span className="px-1 text-slate-400">…</span>}<button type="button" onClick={() => updateParams({ page: String(value) }, false)} className={`min-h-10 min-w-10 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${value === data.page ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>{value}</button></span>)}<button type="button" disabled={data.page >= data.total_pages} onClick={() => updateParams({ page: String(data.page + 1) }, false)} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Sau<ChevronRight size={16} aria-hidden="true" /></button></nav>}</> : null}
      </section></div>
    </main>
  </div>
}
