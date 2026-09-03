import { AlertCircle, ArrowLeft, ArrowRight, Eye, FilePlus2, FileText } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import { AdminCVTemplateFeaturedBadge, AdminCVTemplateLayoutBadge, AdminCVTemplateStatusBadge } from '../../components/admin/cv-templates/AdminCVTemplateBadges'
import AdminCVTemplateFilters, { type TemplateBooleanFilter } from '../../components/admin/cv-templates/AdminCVTemplateFilters'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { adminCVTemplateService } from '../../services/adminCVTemplateService'
import type { AdminCVTemplateListResponse } from '../../types/adminCVTemplate'
import { adminCVTemplateErrorMessage } from '../../utils/apiError'

const PAGE_SIZE = 10
const booleanFilter = (value: string | null): TemplateBooleanFilter => value === 'true' ? 'TRUE' : value === 'false' ? 'FALSE' : 'ALL'
const toBoolean = (value: TemplateBooleanFilter): boolean | undefined => value === 'ALL' ? undefined : value === 'TRUE'
function ListSkeleton() { return <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Đang tải danh sách mẫu CV">{[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-slate-200" />)}</div> }

export default function AdminCVTemplatesPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const search = currentParams.get('search') ?? ''
  const active = booleanFilter(currentParams.get('is_active'))
  const featured = booleanFilter(currentParams.get('is_featured'))
  const rawPage = Number(currentParams.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const normalizedSearch = search.trim() || undefined
  const requestParams = useMemo(() => ({ search: normalizedSearch, is_active: toBoolean(active), is_featured: toBoolean(featured), page, page_size: PAGE_SIZE }), [active, featured, normalizedSearch, page])
  const fetcher = useCallback((signal: AbortSignal) => adminCVTemplateService.getAdminCVTemplates(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<AdminCVTemplateListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? adminCVTemplateErrorMessage(error, 'list') : null
  const update = useCallback((changes: Record<string, string | null>) => setParams((current) => { const next = new URLSearchParams(current); Object.entries(changes).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value)); return next }), [setParams])
  const query = new URLSearchParams({ page: String(page) })
  if (normalizedSearch) query.set('search', normalizedSearch)
  if (active !== 'ALL') query.set('is_active', String(active === 'TRUE'))
  if (featured !== 'ALL') query.set('is_featured', String(featured === 'TRUE'))
  const hasFilters = Boolean(normalizedSearch || active !== 'ALL' || featured !== 'ALL')

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />Tổng quan</Link><h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Quản lý mẫu CV</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Quản lý danh mục, trạng thái hiển thị và thông tin các mẫu CV.</p></div><Link to="/admin/cv-templates/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><FilePlus2 size={17} />Thêm mẫu CV</Link></header><AdminCVTemplateFilters search={search} active={active} featured={featured} onSearchChange={(value) => update({ search: value || null, page: null })} onActiveChange={(value) => update({ is_active: value === 'ALL' ? null : String(value === 'TRUE'), page: null })} onFeaturedChange={(value) => update({ is_featured: value === 'ALL' ? null : String(value === 'TRUE'), page: null })} />{data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}{isInitialLoading ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" /><h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải danh sách mẫu CV.</h2><p className="mt-2 text-sm text-slate-500">{errorMessage}</p><button type="button" onClick={refetch} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Thử lại</button></section> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><FileText className="mx-auto text-blue-700" size={30} /><h2 className="mt-4 text-xl font-bold text-slate-950">{hasFilters ? 'Không tìm thấy mẫu CV phù hợp.' : 'Chưa có mẫu CV.'}</h2></section> : data ? <><section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.items.map((template) => <article key={template.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="relative flex h-32 items-center justify-center overflow-hidden bg-slate-100"><FileText className="absolute text-slate-400" size={30} />{template.thumbnail_url && <img src={template.thumbnail_url} alt="" className="relative h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} />}</div><div className="p-5"><div className="flex flex-wrap gap-2"><AdminCVTemplateLayoutBadge layoutKey={template.layout_key} /><AdminCVTemplateStatusBadge active={template.is_active} /><AdminCVTemplateFeaturedBadge featured={template.is_featured} /></div><h2 className="mt-4 truncate text-lg font-bold text-slate-950">{template.name}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{template.description || 'Chưa có mô tả.'}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500"><span>{template.usage_count} CV đang sử dụng</span><span>Thứ tự {template.sort_order}</span></div><Link to={`/admin/cv-templates/${template.id}`} state={{ returnTo: `/admin/cv-templates?${query}` }} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"><Eye size={16} />Chi tiết<ArrowRight size={15} /></Link></div></article>)}</section>{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between"><button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold disabled:opacity-40">Trước</button><span className="text-sm text-slate-600">Trang {data.page} / {data.total_pages}</span><button type="button" disabled={page >= data.total_pages} onClick={() => update({ page: String(page + 1) })} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold disabled:opacity-40">Sau</button></nav>}</> : null}</main></div>
}
