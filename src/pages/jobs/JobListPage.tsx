import axios from 'axios'
import { AlertCircle, BriefcaseBusiness, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import JobCard from '../../components/job/JobCard'
import JobFilters from '../../components/job/JobFilters'
import type { JobFilterValues } from '../../components/job/JobFilters'
import JobSearchBar from '../../components/job/JobSearchBar'
import { jobService } from '../../services/jobService'
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, JOB_SORT_OPTIONS } from '../../types/job'
import type { JobListResponse, JobSearchParams } from '../../types/job'

const PAGE_SIZE = 9
const emptyResponse: JobListResponse = { items: [], page: 1, page_size: PAGE_SIZE, total: 0, total_pages: 0 }
const hasValue = <T extends string>(values: readonly T[], value: string | null): value is T => value !== null && values.includes(value as T)
const messageFor = (error: unknown) => !axios.isAxiosError(error) || !error.response ? 'Không thể kết nối tới máy chủ.' : ({ 400: 'Yêu cầu không hợp lệ.', 401: 'Phiên đăng nhập không hợp lệ.', 403: 'Bạn không có quyền thực hiện thao tác này.', 404: 'Không tìm thấy việc làm.', 409: 'Dữ liệu đang có xung đột. Vui lòng thử lại.', 422: 'Thông tin tìm kiếm không hợp lệ.', 500: 'Máy chủ đang gặp sự cố. Vui lòng thử lại.' }[error.response.status] ?? 'Không thể tải danh sách việc làm. Vui lòng thử lại.')

function Skeleton() { return <div className="grid gap-4"><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /></div> }

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<JobListResponse>(emptyResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const query = searchParams.toString()
  const filters = useMemo<JobFilterValues>(() => {
    const employmentType = searchParams.get('employment_type')
    const experienceLevel = searchParams.get('experience_level')
    const sort = searchParams.get('sort')
    return { employmentType: hasValue(EMPLOYMENT_TYPES, employmentType) ? employmentType : '', experienceLevel: hasValue(EXPERIENCE_LEVELS, experienceLevel) ? experienceLevel : '', salary: searchParams.get('salary') ?? '', sort: hasValue(JOB_SORT_OPTIONS, sort) ? sort : 'newest' }
  }, [searchParams])
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  useEffect(() => {
    const salary = searchParams.get('salary')?.match(/^(\d*)-(\d*)$/)
    const params: JobSearchParams = { page, page_size: PAGE_SIZE, sort: filters.sort }
    const keyword = searchParams.get('keyword')?.trim(); const location = searchParams.get('location')?.trim()
    if (keyword) params.keyword = keyword
    if (location) params.location = location
    if (filters.employmentType) params.employment_type = filters.employmentType
    if (filters.experienceLevel) params.experience_level = filters.experienceLevel
    if (salary?.[1]) params.salary_min = Number(salary[1])
    if (salary?.[2]) params.salary_max = Number(salary[2])
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError(null)
    jobService.getJobs(params).then((response) => { if (active) setData(response) }).catch((requestError: unknown) => { if (active) setError(messageFor(requestError)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [query, filters, page, requestVersion, searchParams])

  function updateParams(updates: Record<string, string | null>) { const next = new URLSearchParams(searchParams); Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); if (!('page' in updates)) next.set('page', '1'); setSearchParams(next) }
  const pages = Array.from({ length: data.total_pages }, (_, index) => index + 1).filter((value) => value === 1 || value === data.total_pages || Math.abs(value - data.page) <= 1)

  return <div className="min-h-screen bg-slate-50"><section className="bg-slate-900 py-12 text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold tracking-tight">Tìm việc làm phù hợp</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Khám phá cơ hội mới và tìm vị trí phù hợp với kinh nghiệm của bạn.</p><div className="mt-7"><JobSearchBar key={`${searchParams.get('keyword') ?? ''}-${searchParams.get('location') ?? ''}`} keyword={searchParams.get('keyword') ?? ''} location={searchParams.get('location') ?? ''} onSearch={(keyword, location) => updateParams({ keyword, location })} /></div></div></section><main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8"><JobFilters values={filters} onChange={(next) => updateParams({ employment_type: next.employmentType || null, experience_level: next.experienceLevel || null, salary: next.salary || null, sort: next.sort === 'newest' ? null : next.sort })} onClear={() => setSearchParams({})} /><section aria-live="polite"><div className="mb-5"><h2 className="text-xl font-semibold text-slate-900">Danh sách việc làm</h2>{!loading && !error && <p className="mt-1 text-sm text-slate-500">{data.total} việc làm phù hợp</p>}</div>{loading ? <Skeleton /> : error ? <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-500" size={32} /><h3 className="mt-4 font-semibold text-slate-900">Không thể tải việc làm</h3><p className="mt-2 text-sm text-slate-500">{error}</p><button onClick={() => setRequestVersion((value) => value + 1)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={15} />Thử lại</button></div> : data.items.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"><BriefcaseBusiness className="mx-auto text-blue-600" size={34} /><h3 className="mt-4 font-semibold text-slate-900">Không tìm thấy việc làm phù hợp.</h3><p className="mt-2 text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc.</p></div> : <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.items.map((job) => <JobCard key={job.id} job={job} />)}</div>{data.total_pages > 1 && <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang"><button disabled={data.page <= 1} onClick={() => updateParams({ page: String(data.page - 1) })} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} />Trước</button>{pages.map((value, index) => <span key={value} className="contents">{index > 0 && value - pages[index - 1] > 1 && <span className="px-1 text-slate-400">…</span>}<button onClick={() => updateParams({ page: String(value) })} className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold ${value === data.page ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>{value}</button></span>)}<button disabled={data.page >= data.total_pages} onClick={() => updateParams({ page: String(data.page + 1) })} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Sau<ChevronRight size={16} /></button></nav>}</>}</section></main></div>
}
