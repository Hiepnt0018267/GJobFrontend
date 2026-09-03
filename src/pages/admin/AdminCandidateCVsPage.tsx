import { AlertCircle, ArrowLeft, ArrowRight, FileText, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminAuditScope from '../../components/admin/audit/AdminAuditScope'
import AdminCVList from '../../components/admin/audit/AdminCVList'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { adminAuditService } from '../../services/adminAuditService'
import type { AdminAuditCVListResponse } from '../../types/adminAudit'
import { adminAuditErrorMessage } from '../../utils/apiError'

const PAGE_SIZE = 10
type DefaultFilter = 'ALL' | 'TRUE' | 'FALSE'

function CVFilters({ search, isDefault, onSearchChange, onDefaultChange }: { search: string; isDefault: DefaultFilter; onSearchChange: (value: string) => void; onDefaultChange: (value: DefaultFilter) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)
  useEffect(() => { if (inputRef.current && inputRef.current.value !== search) inputRef.current.value = search }, [search])
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current) }, [])
  const schedule = (value: string) => { if (timer.current !== null) window.clearTimeout(timer.current); const normalized = value.trim(); if (normalized === search) return; timer.current = window.setTimeout(() => { timer.current = null; onSearchChange(normalized) }, 400) }
  const clear = () => { if (timer.current !== null) window.clearTimeout(timer.current); if (inputRef.current) inputRef.current.value = ''; onSearchChange('') }
  return <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5" aria-label="Tìm kiếm và lọc CV ứng viên"><div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px]"><label className="relative block"><span className="sr-only">Tìm CV ứng viên</span><FileText size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input ref={inputRef} defaultValue={search} onChange={(event) => schedule(event.target.value)} placeholder="Tìm theo tên CV, ứng viên hoặc email..." className="peer w-full rounded-xl border border-slate-300 py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><button type="button" onClick={clear} aria-label="Xóa từ khóa tìm kiếm" className="pointer-events-auto absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0"><X size={16} aria-hidden="true" /></button></label><label><span className="sr-only">Lọc CV mặc định</span><select value={isDefault} onChange={(event) => onDefaultChange(event.target.value as DefaultFilter)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="ALL">Tất cả CV</option><option value="TRUE">CV mặc định</option><option value="FALSE">CV không mặc định</option></select></label></div></section>
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

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Tổng quan</Link><h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">CV ứng viên</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Kiểm tra các CV ứng viên đã lưu bằng dữ liệu hiện hành, chỉ đọc.</p></div>{data && <p className="text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</span> kết quả</p>}</header><AdminAuditScope scopes={scopes} onClear={(key) => updateParams({ [key]: null, page: null })} /><CVFilters search={search} isDefault={isDefault} onSearchChange={setSearch} onDefaultChange={setDefault} />{data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}{isInitialLoading ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" /><h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải danh sách CV ứng viên.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p><button type="button" onClick={refetch} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Thử lại</button></section> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><FileText size={27} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold text-slate-950">{hasFilters ? 'Không tìm thấy CV phù hợp.' : 'Chưa có CV nào trong hệ thống.'}</h2><p className="mt-2 text-sm text-slate-500">{hasFilters ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.' : 'CV ứng viên sẽ xuất hiện tại đây khi được tạo.'}</p></section> : data ? <><AdminCVList cvs={data.items} returnTo={returnTo} />{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang CV ứng viên"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} aria-hidden="true" />Trước</button><span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau<ArrowRight size={16} aria-hidden="true" /></button></nav>}</> : null}</main></div>
}
