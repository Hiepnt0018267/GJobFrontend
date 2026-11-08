import { AlertCircle, ArrowLeft, ArrowRight, FileText, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminAuditScope from '../../components/admin/audit/AdminAuditScope'
import AdminCVList from '../../components/admin/audit/AdminCVList'
import { AdminFilterPill, AdminFilterResetButton } from '../../components/admin/AdminFilterControls'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { adminAuditService } from '../../services/adminAuditService'
import type { AdminAuditCVListResponse } from '../../types/adminAudit'
import { adminAuditErrorMessage } from '../../utils/apiError'

const PAGE_SIZE = 10
type DefaultFilter = 'ALL' | 'TRUE' | 'FALSE'

const defaultFilterOptions: Array<{ value: DefaultFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả CV' },
  { value: 'TRUE', label: 'CV mặc định' },
  { value: 'FALSE', label: 'CV không mặc định' },
]

function CVFilters({
  search,
  isDefault,
  onSearchChange,
  onDefaultChange,
  onReset,
}: {
  search: string
  isDefault: DefaultFilter
  onSearchChange: (value: string) => void
  onDefaultChange: (value: DefaultFilter) => void
  onReset?: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== search) inputRef.current.value = search
  }, [search])

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  const schedule = (value: string) => {
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

  const activeFilterCount = isDefault !== 'ALL' ? 1 : 0
  const hasActiveFilters = Boolean(search || activeFilterCount > 0)

  const handleReset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    if (inputRef.current) inputRef.current.value = ''
    if (onReset) {
      onReset()
    } else {
      clear()
      onDefaultChange('ALL')
    }
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm và lọc CV ứng viên">
      {/* Compact Search Input */}
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs md:max-w-sm">
        <span className="sr-only">Tìm CV ứng viên</span>
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => schedule(event.target.value)}
          placeholder="Tìm theo tên CV, ứng viên hoặc email..."
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

      {/* Default Filter Pill */}
      <AdminFilterPill
        label="Mặc định"
        value={isDefault}
        options={defaultFilterOptions}
        onChange={onDefaultChange}
        ariaLabel="Lọc CV mặc định"
      />

      {/* Quick Reset Button */}
      {hasActiveFilters && (
        <AdminFilterResetButton onClick={handleReset} count={activeFilterCount} />
      )}
    </section>
  )
}
function ListSkeleton() { return <div className="mt-6 space-y-3" aria-busy="true" aria-label="Đang tải danh sách CV ứng viên">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-200" />)}</div> }

export default function AdminCandidateCVsPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const search = currentParams.get('search') ?? ''
  const normalizedSearch = search.trim() || undefined
  const candidateId = currentParams.get('candidate_id') ?? undefined
  const templateId = currentParams.get('template_id') ?? undefined
  const rawDefault = currentParams.get('is_default')
  const isDefault: DefaultFilter = rawDefault === 'true' ? 'TRUE' : rawDefault === 'false' ? 'FALSE' : 'ALL'
  const rawPage = Number(currentParams.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const requestParams = useMemo(() => ({ search: normalizedSearch, candidate_id: candidateId, template_id: templateId, is_default: isDefault === 'ALL' ? undefined : isDefault === 'TRUE', page, page_size: PAGE_SIZE }), [candidateId, isDefault, normalizedSearch, page, templateId])
  const fetcher = useCallback((signal: AbortSignal) => adminAuditService.getCandidateCVs(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<AdminAuditCVListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? adminAuditErrorMessage(error, 'list', 'cv') : null
  const listParams = new URLSearchParams({ page: String(page) })
  if (normalizedSearch) listParams.set('search', normalizedSearch)
  if (candidateId) listParams.set('candidate_id', candidateId)
  if (templateId) listParams.set('template_id', templateId)
  if (isDefault !== 'ALL') listParams.set('is_default', String(isDefault === 'TRUE'))
  const returnTo = `/admin/cvs?${listParams.toString()}`
  const updateParams = useCallback((updates: Record<string, string | null>) => setParams((current) => { const next = new URLSearchParams(current); Object.entries(updates).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value)); return next }), [setParams])
  const setSearch = (value: string) => updateParams({ search: value || null, page: null })
  const setDefault = (value: DefaultFilter) => updateParams({ is_default: value === 'ALL' ? null : String(value === 'TRUE'), page: null })
  const setPage = (nextPage: number) => updateParams({ page: String(nextPage) })
  const scopes = [candidateId && { key: 'candidate_id', label: 'Ứng viên', value: 'đã chọn', to: `/admin/users/${candidateId}` }, templateId && { key: 'template_id', label: 'Mẫu CV', value: 'đã chọn' }].filter(Boolean) as Array<{ key: string; label: string; value: string; to?: string }>
  const hasFilters = Boolean(normalizedSearch || candidateId || templateId || isDefault !== 'ALL')

  return <div className="min-h-screen bg-white"><AdminHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-black"><ArrowLeft size={16} aria-hidden="true" />Tổng quan</Link><h1 className="mt-3 text-xl font-semibold tracking-tight text-[#1C1C1C]">CV ứng viên</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Kiểm tra các CV ứng viên đã lưu bằng dữ liệu hiện hành, chỉ đọc.</p></div>{data && <p className="text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> kết quả</p>}</header><AdminAuditScope scopes={scopes} onClear={(key) => updateParams({ [key]: null, page: null })} /><CVFilters search={search} isDefault={isDefault} onSearchChange={setSearch} onDefaultChange={setDefault} onReset={() => updateParams({ search: null, is_default: null, page: null })} />{data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}{isInitialLoading ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" /><h2 className="mt-4 text-lg font-bold text-slate-950 font-[Inter,sans-serif]">Không thể tải danh sách CV ứng viên.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p><button type="button" onClick={refetch} className="btn-press mt-5 rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors">Thử lại</button></section> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04] text-[#1C1C1C] ring-1 ring-black/10"><FileText size={27} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold text-slate-950 font-[Inter,sans-serif]">{hasFilters ? 'Không tìm thấy CV phù hợp.' : 'Chưa có CV nào trong hệ thống.'}</h2><p className="mt-2 text-sm text-slate-500">{hasFilters ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.' : 'CV ứng viên sẽ xuất hiện tại đây khi được tạo.'}</p></section> : data ? <><AdminCVList cvs={data.items} returnTo={returnTo} />{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang CV ứng viên"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 transition-colors"><ArrowLeft size={16} aria-hidden="true" />Trước</button><span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages} className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 transition-colors">Sau<ArrowRight size={16} aria-hidden="true" /></button></nav>}</> : null}</main></div>
}
