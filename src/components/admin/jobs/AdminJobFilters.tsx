import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { JobStatus } from '../../../types/job'

export type AdminJobStatusFilter = JobStatus | 'ALL'

const statusFilters: Array<{ value: AdminJobStatusFilter; label: string }> = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'CLOSED', label: 'Đã đóng' },
  { value: 'ALL', label: 'Tất cả' },
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

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-premium border border-slate-200/80 sm:p-5" aria-label="Tìm kiếm và lọc tin tuyển dụng">
      <label className="relative block">
        <span className="sr-only">Tìm tin tuyển dụng</span>
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm theo tiêu đề hoặc công ty..."
          className="peer w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
        <button
          type="button"
          onClick={clearSearch}
          className="pointer-events-auto absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-[color,opacity] hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0"
          aria-label="Xóa từ khóa tìm kiếm"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </label>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Lọc trạng thái tin tuyển dụng">
        {statusFilters.map((filter) => {
          const isActive = activeStatus === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onStatusChange(filter.value)}
              className={`btn-press shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50/80 text-slate-600 border border-slate-200/80 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </nav>
    </section>
  )
}
