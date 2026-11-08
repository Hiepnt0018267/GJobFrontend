import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import type { RecruiterJob } from '../../types/job'
import { RECRUITER_APPLICATION_STATUSES, type RecruiterApplicationStatus } from '../../types/recruiterApplication'
import { recruiterApplicationStatusLabels } from '../../utils/recruiterApplicationDisplay'
import { RecruiterFilterPill, RecruiterFilterResetButton } from './RecruiterFilterControls'

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
  showRankingSort?: boolean
  sort?: string
  onSortChange?: (value: string) => void
  onReset?: () => void
}

export default function RecruiterApplicationFilters({
  search,
  status,
  jobId,
  jobs,
  jobsLoading,
  showJobFilter,
  onSearchChange,
  onStatusChange,
  onJobChange,
  onReset,
}: Props) {
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

  const jobOptions = useMemo(() => [
    { value: '', label: jobsLoading ? 'Đang tải tin…' : 'Tất cả tin tuyển dụng' },
    ...jobs.map((job) => ({ value: job.id, label: job.title })),
  ], [jobs, jobsLoading])

  const statusOptions = useMemo(() => [
    { value: 'ALL' as RecruiterApplicationStatusFilter, label: 'Tất cả trạng thái' },
    ...RECRUITER_APPLICATION_STATUSES.map((item) => ({
      value: item as RecruiterApplicationStatusFilter,
      label: recruiterApplicationStatusLabels[item],
    })),
  ], [])

  const activeFilterCount = [
    status !== 'ALL',
    Boolean(showJobFilter && jobId),
  ].filter(Boolean).length

  const hasActiveFilters = Boolean(search || activeFilterCount > 0)

  const handleReset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    if (inputRef.current) inputRef.current.value = ''
    if (onReset) {
      onReset()
    } else {
      clearSearch()
      onStatusChange('ALL')
      if (showJobFilter) onJobChange('')
    }
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm và lọc ứng viên">
      {/* Compact Search Input */}
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs md:max-w-sm">
        <span className="sr-only">Tìm theo ứng viên, email, công việc hoặc CV</span>
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm ứng viên, email, CV..."
          className="h-9 w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8.5 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Job Filter Pill */}
      {showJobFilter && (
        <RecruiterFilterPill
          label="Tin tuyển dụng"
          value={jobId ?? ''}
          options={jobOptions}
          onChange={onJobChange}
          ariaLabel="Lọc theo tin tuyển dụng"
          allValue=""
          disabled={jobsLoading}
        />
      )}

      {/* Status Filter Pill */}
      <RecruiterFilterPill
        label="Trạng thái"
        value={status}
        options={statusOptions}
        onChange={onStatusChange}
        ariaLabel="Lọc trạng thái đơn ứng tuyển"
        allValue="ALL"
      />

      {/* Quick Reset Button */}
      {hasActiveFilters && (
        <RecruiterFilterResetButton onClick={handleReset} count={activeFilterCount} />
      )}
    </section>
  )
}
