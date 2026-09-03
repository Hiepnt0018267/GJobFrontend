import { Search, X } from 'lucide-react'
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

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5" aria-label="Tìm kiếm và lọc người dùng">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <label className="relative block">
          <span className="sr-only">Tìm người dùng</span>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input ref={inputRef} defaultValue={search} onChange={(event) => scheduleSearch(event.target.value)} placeholder="Tìm theo họ tên hoặc email..." className="peer w-full rounded-xl border border-slate-300 py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <button type="button" onClick={clearSearch} className="pointer-events-auto absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-[color,opacity] hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0" aria-label="Xóa từ khóa tìm kiếm"><X size={16} aria-hidden="true" /></button>
        </label>
        <label className="block text-sm font-semibold text-slate-700"><span className="sr-only">Lọc theo vai trò</span><select value={role} onChange={(event) => onRoleChange(event.target.value as AdminUserRoleFilter)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{roleFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select></label>
        <label className="block text-sm font-semibold text-slate-700"><span className="sr-only">Lọc theo trạng thái tài khoản</span><select value={activeStatus} onChange={(event) => onActiveStatusChange(event.target.value as AdminUserActiveFilter)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{activeFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select></label>
      </div>
    </section>
  )
}
