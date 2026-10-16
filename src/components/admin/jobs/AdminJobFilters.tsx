import { Search, X, RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { JobStatus } from '../../../types/job'

export type AdminJobStatusFilter = JobStatus | 'ALL'

const statusFilters: Array<{ value: AdminJobStatusFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'CLOSED', label: 'Đã đóng' },
]

type AdminJobFiltersProps = {
  activeStatus: AdminJobStatusFilter
  search: string
  onSearchChange: (search: string) => void
  onStatusChange: (status: AdminJobStatusFilter) => void
}

export default function AdminJobFilters({ activeStatus, search, onSearchChange, onStatusChange }: AdminJobFiltersProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<number | null>(null)

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== search) inputRef.current.value = search
  }, [search])

  useEffect(() => () => {
    if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
  }, [])

  const scheduleSearch = (value: string) => {
    if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
    const normalizedInput = value.trim()
    if (normalizedInput === search) return
    debounceTimer.current = window.setTimeout(() => {
      debounceTimer.current = null
      onSearchChange(normalizedInput)
    }, 400)
  }

  const clearSearch = () => {
    if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
    if (inputRef.current) inputRef.current.value = ''
    onSearchChange('')
  }

  const hasActiveFilters = Boolean(search || activeStatus !== 'ALL')

  const handleReset = () => {
    clearSearch()
    onStatusChange('ALL')
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2.5" aria-label="Tìm kiếm và lọc tin tuyển dụng">
      {/* Compact Search Input */}
      <label className="relative min-w-0 w-full sm:w-72 md:w-80">
        <span className="sr-only">Tìm tin tuyển dụng</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm tiêu đề, công ty..."
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
        />
        <button
          type="button"
          onClick={clearSearch}
          className="pointer-events-auto absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0"
          aria-label="Xóa từ khóa tìm kiếm"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </label>

      {/* Mobile status select */}
      <div className="w-full sm:hidden">
        <label>
          <span className="sr-only">Lọc trạng thái tin tuyển dụng</span>
          <select
            value={activeStatus}
            onChange={(e) => onStatusChange(e.target.value as AdminJobStatusFilter)}
            className="h-10 w-full rounded-xl border border-slate-200/90 bg-white shadow-2xs px-3 text-xs font-medium text-slate-700 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Desktop compact segmented status tabs */}
      <nav className="hidden sm:flex items-center p-1 bg-white rounded-xl gap-1 border border-slate-200/90 shadow-2xs" aria-label="Lọc trạng thái tin tuyển dụng">
        {statusFilters.map((filter) => {
          const isActive = activeStatus === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onStatusChange(filter.value)}
              className={`h-8 rounded-lg px-3 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </nav>

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
