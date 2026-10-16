import { Search, X, RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { APPLICATION_STATUSES, type ApplicationStatus } from '../../../types/application'
import { applicationStatusLabels } from './adminApplicationDisplay'

export type AdminApplicationStatusFilter = ApplicationStatus | 'ALL'

type Props = {
  search: string
  status: AdminApplicationStatusFilter
  onSearchChange: (value: string) => void
  onStatusChange: (value: AdminApplicationStatusFilter) => void
}

export default function AdminApplicationFilters({ search, status, onSearchChange, onStatusChange }: Props) {
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
    }, 400)
  }

  const clear = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    if (inputRef.current) inputRef.current.value = ''
    onSearchChange('')
  }

  const hasActiveFilters = Boolean(search || status !== 'ALL')

  const handleReset = () => {
    clear()
    onStatusChange('ALL')
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2.5" aria-label="Tìm kiếm và lọc đơn ứng tuyển">
      {/* Compact Search Input */}
      <label className="relative min-w-0 w-full sm:w-80 md:w-96">
        <span className="sr-only">Tìm đơn ứng tuyển</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm ứng viên, email, công việc, công ty..."
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
        />
        <button
          type="button"
          onClick={clear}
          aria-label="Xóa từ khóa tìm kiếm"
          className="pointer-events-auto absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </label>

      {/* Status Filter Dropdown */}
      <label className="min-w-0 w-48 flex-1 sm:flex-initial">
        <span className="sr-only">Lọc trạng thái đơn</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as AdminApplicationStatusFilter)}
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white shadow-2xs px-3 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {APPLICATION_STATUSES.map((item) => (
            <option key={item} value={item}>
              {applicationStatusLabels[item]}
            </option>
          ))}
        </select>
      </label>

      {/* Quick Reset Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-colors border border-transparent hover:border-red-200/60 ml-auto sm:ml-0"
          title="Đặt lại toàn bộ bộ lọc"
        >
          <RotateCcw size={13} />
          <span>Xóa lọc</span>
        </button>
      )}
    </section>
  )
}
