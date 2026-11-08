import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { APPLICATION_STATUSES, type ApplicationStatus } from '../../../types/application'
import { applicationStatusLabels } from './adminApplicationDisplay'
import { AdminFilterPill, AdminFilterResetButton } from '../AdminFilterControls'

export type AdminApplicationStatusFilter = ApplicationStatus | 'ALL'

type Props = {
  search: string
  status: AdminApplicationStatusFilter
  onSearchChange: (value: string) => void
  onStatusChange: (value: AdminApplicationStatusFilter) => void
  onReset?: () => void
}

export default function AdminApplicationFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== search) inputRef.current.value = search
  }, [search])

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

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

  const statusOptions = useMemo(
    () => [
      { value: 'ALL' as AdminApplicationStatusFilter, label: 'Tất cả trạng thái' },
      ...APPLICATION_STATUSES.map((item) => ({
        value: item as AdminApplicationStatusFilter,
        label: applicationStatusLabels[item],
      })),
    ],
    []
  )

  const activeFilterCount = (status !== 'ALL' ? 1 : 0)
  const hasActiveFilters = Boolean(search || activeFilterCount > 0)

  const handleReset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    if (inputRef.current) inputRef.current.value = ''
    if (onReset) {
      onReset()
    } else {
      clear()
      onStatusChange('ALL')
    }
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm và lọc đơn ứng tuyển">
      {/* Compact Search Input */}
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs md:max-w-sm">
        <span className="sr-only">Tìm đơn ứng tuyển</span>
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm ứng viên, email, công việc..."
          className="h-9 w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8.5 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
        />
        {search && (
          <button
            type="button"
            onClick={clear}
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
        value={status}
        options={statusOptions}
        onChange={onStatusChange}
        ariaLabel="Lọc trạng thái đơn ứng tuyển"
      />

      {/* Quick Reset Button */}
      {hasActiveFilters && (
        <AdminFilterResetButton onClick={handleReset} count={activeFilterCount} />
      )}
    </section>
  )
}
