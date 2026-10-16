import { Search, X, RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { AdminUserRole } from '../../../types/adminUser'

export type AdminUserRoleFilter = AdminUserRole | 'ALL'
export type AdminUserActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

const roleFilters: Array<{ value: AdminUserRoleFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả vai trò' },
  { value: 'CANDIDATE', label: 'Ứng viên' },
  { value: 'RECRUITER', label: 'Nhà tuyển dụng' },
  { value: 'ADMIN', label: 'Quản trị viên' },
]

const activeFilters: Array<{ value: AdminUserActiveFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Đã vô hiệu hóa' },
]

type AdminUserFiltersProps = {
  role: AdminUserRoleFilter
  activeStatus: AdminUserActiveFilter
  search: string
  onSearchChange: (search: string) => void
  onRoleChange: (role: AdminUserRoleFilter) => void
  onActiveStatusChange: (status: AdminUserActiveFilter) => void
}

export default function AdminUserFilters({ role, activeStatus, search, onSearchChange, onRoleChange, onActiveStatusChange }: AdminUserFiltersProps) {
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

  const hasActiveFilters = Boolean(search || role !== 'ALL' || activeStatus !== 'ALL')

  const handleReset = () => {
    clearSearch()
    onRoleChange('ALL')
    onActiveStatusChange('ALL')
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2.5" aria-label="Tìm kiếm và lọc người dùng">
      {/* Compact Search Input */}
      <label className="relative min-w-0 w-full sm:w-72 md:w-80">
        <span className="sr-only">Tìm người dùng</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm họ tên, email..."
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

      {/* Role filter select */}
      <label className="min-w-0 w-44 flex-1 sm:flex-initial">
        <span className="sr-only">Lọc theo vai trò</span>
        <select
          value={role}
          onChange={(event) => onRoleChange(event.target.value as AdminUserRoleFilter)}
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white shadow-2xs px-3 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
        >
          {roleFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </label>

      {/* Active status filter select */}
      <label className="min-w-0 w-44 flex-1 sm:flex-initial">
        <span className="sr-only">Lọc theo trạng thái tài khoản</span>
        <select
          value={activeStatus}
          onChange={(event) => onActiveStatusChange(event.target.value as AdminUserActiveFilter)}
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white shadow-2xs px-3 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
        >
          {activeFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
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
