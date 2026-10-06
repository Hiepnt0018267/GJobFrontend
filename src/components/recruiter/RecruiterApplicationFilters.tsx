import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { RecruiterJob } from '../../types/job'
import { RECRUITER_APPLICATION_STATUSES, type RecruiterApplicationStatus } from '../../types/recruiterApplication'
import { recruiterApplicationStatusLabels } from '../../utils/recruiterApplicationDisplay'

export type RecruiterApplicationStatusFilter = RecruiterApplicationStatus | 'ALL'

type Props = {
  search: string
  status: RecruiterApplicationStatusFilter
  jobId?: string
  jobs: RecruiterJob[]
  jobsLoading: boolean
  showJobFilter: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: RecruiterApplicationStatusFilter) => void
  onJobChange: (value: string) => void
}

export default function RecruiterApplicationFilters({ search, status, jobId, jobs, jobsLoading, showJobFilter, onSearchChange, onStatusChange, onJobChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== search) inputRef.current.value = search
  }, [search])
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current) }, [])

  const scheduleSearch = (value: string) => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    const normalized = value.trim()
    if (normalized === search) return
    timer.current = window.setTimeout(() => {
      timer.current = null
      onSearchChange(normalized)
    }, 350)
  }

  const clearSearch = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    if (inputRef.current) inputRef.current.value = ''
    onSearchChange('')
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-premium border border-slate-200/80 sm:p-5" aria-label="Tìm kiếm và lọc ứng viên">
      <div className={`grid gap-3 ${showJobFilter ? 'xl:grid-cols-[minmax(0,1fr)_220px_280px]' : 'lg:grid-cols-[minmax(0,1fr)_240px]'}`}>
        <label className="relative block">
          <span className="sr-only">Tìm theo ứng viên, email, công việc hoặc CV</span>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            defaultValue={search}
            onChange={(event) => scheduleSearch(event.target.value)}
            placeholder="Tìm theo ứng viên, email, công việc hoặc CV..."
            className="peer w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Xóa từ khóa tìm kiếm"
            className="pointer-events-auto absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </label>
        <label>
          <span className="sr-only">Lọc trạng thái đơn ứng tuyển</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as RecruiterApplicationStatusFilter)}
            className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-150 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {RECRUITER_APPLICATION_STATUSES.map((item) => (
              <option key={item} value={item}>
                {recruiterApplicationStatusLabels[item]}
              </option>
            ))}
          </select>
        </label>
        {showJobFilter && (
          <label>
            <span className="sr-only">Lọc theo tin tuyển dụng</span>
            <select
              value={jobId ?? ''}
              disabled={jobsLoading}
              onChange={(event) => onJobChange(event.target.value)}
              className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-150 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-wait disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">{jobsLoading ? 'Đang tải tin tuyển dụng…' : 'Tất cả tin tuyển dụng'}</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  )
}
