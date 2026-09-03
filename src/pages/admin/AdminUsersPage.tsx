import { AlertCircle, ArrowLeft, ArrowRight, UsersRound } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import AdminUserDirectory from '../../components/admin/users/AdminUserDirectory'
import AdminUserFilters, { type AdminUserActiveFilter, type AdminUserRoleFilter } from '../../components/admin/users/AdminUserFilters'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { adminUserService } from '../../services/adminUserService'
import type { AdminUserListResponse, AdminUserRole } from '../../types/adminUser'
import { adminUserErrorMessage } from '../../utils/apiError'

const PAGE_SIZE = 10
const validRoles: AdminUserRole[] = ['CANDIDATE', 'RECRUITER', 'ADMIN']

function ListSkeleton() {
  return <div className="mt-6 space-y-3" aria-busy="true" aria-label="Đang tải danh sách người dùng">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-200" />)}</div>
}

export default function AdminUsersPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const rawRole = currentParams.get('role')
  const role = rawRole && validRoles.includes(rawRole as AdminUserRole) ? rawRole as AdminUserRole : undefined
  const activeFilter: AdminUserActiveFilter = currentParams.get('is_active') === 'true' ? 'ACTIVE' : currentParams.get('is_active') === 'false' ? 'INACTIVE' : 'ALL'
  const roleFilter: AdminUserRoleFilter = role ?? 'ALL'
  const search = currentParams.get('search') ?? ''
  const normalizedSearch = search.trim() || undefined
  const rawPage = Number(currentParams.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const requestParams = useMemo(() => ({ search: normalizedSearch, role, is_active: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE', page, page_size: PAGE_SIZE }), [activeFilter, normalizedSearch, page, role])
  const fetcher = useCallback((signal: AbortSignal) => adminUserService.getAdminUsers(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<AdminUserListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? adminUserErrorMessage(error, 'list') : null
  const listQueryParams = new URLSearchParams({ page: String(page) })
  if (normalizedSearch) listQueryParams.set('search', normalizedSearch)
  if (role) listQueryParams.set('role', role)
  if (activeFilter !== 'ALL') listQueryParams.set('is_active', String(activeFilter === 'ACTIVE'))
  const listQuery = listQueryParams.toString()

  const updateParams = useCallback((updates: Record<string, string | null>) => setParams((current) => {
    const next = new URLSearchParams(current)
    Object.entries(updates).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
    return next
  }), [setParams])
  const setSearch = (value: string) => updateParams({ search: value || null, page: null })
  const setRole = (value: AdminUserRoleFilter) => updateParams({ role: value === 'ALL' ? null : value, page: null })
  const setActiveStatus = (value: AdminUserActiveFilter) => updateParams({ is_active: value === 'ALL' ? null : String(value === 'ACTIVE'), page: null })
  const setPage = (nextPage: number) => updateParams({ page: String(nextPage) })
  const hasFilters = Boolean(normalizedSearch || role || activeFilter !== 'ALL')

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Tổng quan</Link><h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Quản lý người dùng</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Tìm kiếm, lọc và quản lý trạng thái tài khoản trên hệ thống.</p></div>{data && <p className="text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> kết quả</p>}</header><AdminUserFilters role={roleFilter} activeStatus={activeFilter} search={search} onSearchChange={setSearch} onRoleChange={setRole} onActiveStatusChange={setActiveStatus} />{data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}{isInitialLoading ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" /><h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải danh sách người dùng.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p><button type="button" onClick={refetch} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Thử lại</button></section> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><UsersRound size={27} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold text-slate-950">{hasFilters ? 'Không tìm thấy người dùng phù hợp.' : 'Chưa có người dùng nào trong hệ thống.'}</h2><p className="mt-2 text-sm text-slate-500">{hasFilters ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.' : 'Danh sách người dùng sẽ xuất hiện tại đây khi có dữ liệu.'}</p></section> : data ? <><AdminUserDirectory users={data.items} returnTo={`/admin/users?${listQuery}`} />{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} aria-hidden="true" />Trước</button><span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau<ArrowRight size={16} aria-hidden="true" /></button></nav>}</> : null}</main></div>
}
