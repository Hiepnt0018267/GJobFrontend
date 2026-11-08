import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { JobStatus } from '../../../types/job'
import { AdminFilterPill, AdminFilterResetButton } from '../AdminFilterControls'

export type AdminJobStatusFilter = JobStatus | 'ALL'

const statusFilters: Array<{ value: AdminJobStatusFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
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
  onReset?: () => void
}

export default function AdminJobFilters({
  activeStatus,
  search,
  onSearchChange,
  onStatusChange,
  onReset,
}: AdminJobFiltersProps) {
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

  const activeFilterCount = (activeStatus !== 'ALL' ? 1 : 0)
  const hasActiveFilters = Boolean(search || activeFilterCount > 0)

  const handleReset = () => {
    if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
    if (inputRef.current) inputRef.current.value = ''
    if (onReset) {
      onReset()
    } else {
      clearSearch()
      onStatusChange('ALL')
    }
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm và lọc tin tuyển dụng">
      {/* Compact Search Input */}
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs md:max-w-sm">
        <span className="sr-only">Tìm tin tuyển dụng</span>
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm tiêu đề, công ty..."
          className="h-9 w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8.5 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Status Pill */}
      <AdminFilterPill
        label="Trạng thái"
        value={activeStatus}
        options={statusFilters}
        onChange={onStatusChange}
        ariaLabel="Lọc trạng thái tin tuyển dụng"
      />

      {/* Quick Reset Button */}
      {hasActiveFilters && (
        <AdminFilterResetButton onClick={handleReset} count={activeFilterCount} />
      )}
    </section>
  )
}
