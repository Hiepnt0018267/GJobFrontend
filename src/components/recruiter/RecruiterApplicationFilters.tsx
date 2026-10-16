import { Search, X, RotateCcw } from 'lucide-react'
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

  const hasActiveFilters = Boolean(search || status !== 'ALL' || (showJobFilter && jobId))

  const handleReset = () => {
    clearSearch()
    onStatusChange('ALL')
    if (showJobFilter) onJobChange('')
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm và lọc ứng viên">
      <label className="relative min-w-0 w-full sm:w-60">
        <span className="sr-only">Tìm theo ứng viên, email, công việc hoặc CV</span>
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm ứng viên, email, CV..."
          className="h-9 w-full rounded-xl border border-black/[0.08] bg-white shadow-2xs py-1.5 pl-8 pr-7 text-xs text-[#1C1C1C] placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-black/[0.15] focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C]/10"
        />
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Xóa từ khóa tìm kiếm"
          className="pointer-events-auto absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0"
        >
          <X size={13} aria-hidden="true" />
        </button>
      </label>

      {showJobFilter && (
        <label className="min-w-0 max-w-xs flex-1 sm:flex-initial">
          <span className="sr-only">Lọc theo tin tuyển dụng</span>
          <select
            value={jobId ?? ''}
            disabled={jobsLoading}
            onChange={(event) => onJobChange(event.target.value)}
            className="h-9 w-full rounded-xl border border-black/[0.08] bg-white shadow-2xs px-3 text-xs font-normal text-[#1C1C1C] outline-none transition-all duration-150 hover:border-black/[0.15] focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C]/10 disabled:cursor-wait disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">{jobsLoading ? 'Đang tải tin…' : 'Tất cả tin tuyển dụng'}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="min-w-0 w-44">
        <span className="sr-only">Lọc trạng thái đơn ứng tuyển</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as RecruiterApplicationStatusFilter)}
          className="h-9 w-full rounded-xl border border-black/[0.08] bg-white shadow-2xs px-3 text-xs font-normal text-[#1C1C1C] outline-none transition-all duration-150 hover:border-black/[0.15] focus:border-[#1C1C1C] focus:ring-1 focus:ring-[#1C1C1C]/10"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {RECRUITER_APPLICATION_STATUSES.map((item) => (
            <option key={item} value={item}>
              {recruiterApplicationStatusLabels[item]}
            </option>
          ))}
        </select>
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 h-9 px-2.5 text-xs font-normal text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-colors ml-auto sm:ml-0"
          title="Đặt lại toàn bộ bộ lọc"
        >
          <RotateCcw size={12} />
          <span>Xóa lọc</span>
        </button>
      )}
    </section>
  )
}
