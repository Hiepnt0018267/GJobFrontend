import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { AdminUserRole } from '../../../types/adminUser'
import { AdminFilterPill, AdminFilterResetButton } from '../AdminFilterControls'

export type AdminUserRoleFilter = AdminUserRole | 'ALL'
export type AdminUserStatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'INACTIVE'

const roleFilters: Array<{ value: AdminUserRoleFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả vai trò' },
  { value: 'CANDIDATE', label: 'Ứng viên' },
  { value: 'RECRUITER', label: 'Nhà tuyển dụng' },
  { value: 'ADMIN', label: 'Quản trị viên' },
]

const statusFilters: Array<{ value: AdminUserStatusFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xác minh' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Đã vô hiệu hóa' },
]

type AdminUserFiltersProps = {
  role: AdminUserRoleFilter
  accountStatus: AdminUserStatusFilter
  search: string
  onSearchChange: (search: string) => void
  onRoleChange: (role: AdminUserRoleFilter) => void
  onAccountStatusChange: (status: AdminUserStatusFilter) => void
  onReset?: () => void
}

export default function AdminUserFilters({
  role,
  accountStatus,
  search,
  onSearchChange,
  onRoleChange,
  onAccountStatusChange,
  onReset,
}: AdminUserFiltersProps) {
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

  const activeFilterCount = [role !== 'ALL', accountStatus !== 'ALL'].filter(Boolean).length
  const hasActiveFilters = Boolean(search || activeFilterCount > 0)

  const handleReset = () => {
    if (debounceTimer.current !== null) window.clearTimeout(debounceTimer.current)
    if (inputRef.current) inputRef.current.value = ''
    if (onReset) {
      onReset()
    } else {
      clearSearch()
      onRoleChange('ALL')
      onAccountStatusChange('ALL')
    }
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm và lọc người dùng">
      {/* Compact Search Input */}
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs md:max-w-sm">
        <span className="sr-only">Tìm người dùng</span>
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => scheduleSearch(event.target.value)}
          placeholder="Tìm họ tên, email..."
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

      {/* Role Pill */}
      <AdminFilterPill
        label="Vai trò"
        value={role}
        options={roleFilters}
        onChange={onRoleChange}
        ariaLabel="Lọc theo vai trò"
      />

      {/* Account Status Pill */}
      <AdminFilterPill
        label="Trạng thái"
        value={accountStatus}
        options={statusFilters}
        onChange={onAccountStatusChange}
        ariaLabel="Lọc theo trạng thái tài khoản"
      />

      {/* Quick Reset Button */}
      {hasActiveFilters && (
        <AdminFilterResetButton onClick={handleReset} count={activeFilterCount} />
      )}
    </section>
  )
}
