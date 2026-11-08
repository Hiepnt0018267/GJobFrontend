import { AlertCircle, ArrowLeft, ArrowRight, Eye, FilePlus2, FileText, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminCVTemplateFilters from '../../components/admin/cv-templates/AdminCVTemplateFilters'
import {
  DEFAULT_INDUSTRY_OPTIONS,
  type TemplateATSFilter,
  type TemplateBooleanFilter,
  type TemplateLayoutFilter,
  type TemplateStyleFilter,
} from '../../components/admin/cv-templates/adminCVTemplateFilterTypes'
import { layoutOptions } from '../../components/admin/cv-templates/adminCVTemplateLayout'
import { CV_TEMPLATE_STYLE_LABELS } from '../../components/cv/cvTemplateStyles'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { resolveApiAssetUrl } from '../../services/api'
import { adminCVTemplateService } from '../../services/adminCVTemplateService'
import { cvTemplateService } from '../../services/cvTemplateService'
import type { AdminCVTemplateListParams, AdminCVTemplateListResponse } from '../../types/adminCVTemplate'
import type { CVATSStatus, CVTemplateLayoutKey, CVTemplateStyle, CVTemplateTaxonomy } from '../../types/cv'
import { adminCVTemplateErrorMessage } from '../../utils/apiError'

const PAGE_SIZE = 12
const ATS_STATUSES: CVATSStatus[] = ['ATS_FRIENDLY', 'ATS_CAUTION', 'NOT_ATS_FRIENDLY', 'UNREVIEWED']
const TEMPLATE_STYLES: CVTemplateStyle[] = ['SIMPLE', 'IMPRESSIVE', 'PROFESSIONAL']
const LAYOUT_KEYS = new Set<CVTemplateLayoutKey>(layoutOptions.map((option) => option.value))

const booleanFilter = (value: string | null): TemplateBooleanFilter => value === 'true' ? 'TRUE' : value === 'false' ? 'FALSE' : 'ALL'
const styleFilter = (value: string | null): TemplateStyleFilter => value && TEMPLATE_STYLES.includes(value as CVTemplateStyle) ? value as CVTemplateStyle : 'ALL'
const layoutFilter = (value: string | null): TemplateLayoutFilter => value && LAYOUT_KEYS.has(value as CVTemplateLayoutKey) ? value as CVTemplateLayoutKey : 'ALL'
const atsFilter = (value: string | null): TemplateATSFilter => value && ATS_STATUSES.includes(value as CVATSStatus) ? value as CVATSStatus : 'ALL'
const toBoolean = (value: TemplateBooleanFilter): boolean | undefined => value === 'ALL' ? undefined : value === 'TRUE'

function ListSkeleton() {
  return <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Đang tải danh sách mẫu CV">
    {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-slate-200" />)}
  </div>
}

export default function AdminCVTemplatesPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const [taxonomy, setTaxonomy] = useState<CVTemplateTaxonomy | null>(null)

  useEffect(() => {
    let cancelled = false
    cvTemplateService
      .getCVTemplateTaxonomy()
      .then((val) => {
        if (!cancelled) setTaxonomy(val)
      })
      .catch(() => {
        // Fallback to DEFAULT_INDUSTRY_OPTIONS
      })
    return () => {
      cancelled = true
    }
  }, [])

  const industryOptions = useMemo(() => {
    if (!taxonomy?.industries || taxonomy.industries.length === 0) {
      return DEFAULT_INDUSTRY_OPTIONS
    }
    return [
      { value: 'ALL', label: 'Tất cả ngành nghề' },
      ...taxonomy.industries.map((ind) => ({
        value: ind.code,
        label: ind.display_name,
      })),
    ]
  }, [taxonomy])

  const queryKey = params.toString()
  const currentParams = useMemo(() => new URLSearchParams(queryKey), [queryKey])
  const search = currentParams.get('search') ?? ''
  const active = booleanFilter(currentParams.get('is_active'))
  const featured = booleanFilter(currentParams.get('is_featured'))
  const style = styleFilter(currentParams.get('style'))
  const layout = layoutFilter(currentParams.get('layout_key'))
  const atsStatus = atsFilter(currentParams.get('ats_status'))
  const industry = currentParams.get('industry') ?? currentParams.get('industry_group') ?? 'ALL'
  const rawPage = Number(currentParams.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const normalizedSearch = search.trim() || undefined
  const requestParams = useMemo<AdminCVTemplateListParams>(() => ({
    search: normalizedSearch,
    is_active: toBoolean(active),
    is_featured: toBoolean(featured),
    style: style === 'ALL' ? undefined : style,
    layout_key: layout === 'ALL' ? undefined : layout,
    ats_status: atsStatus === 'ALL' ? undefined : atsStatus,
    industry_group: industry === 'ALL' ? undefined : industry,
    page,
    page_size: PAGE_SIZE,
  }), [active, atsStatus, featured, industry, layout, normalizedSearch, page, style])
  const fetcher = useCallback((signal: AbortSignal) => adminCVTemplateService.getAdminCVTemplates(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch } = usePaginatedQuery<AdminCVTemplateListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? adminCVTemplateErrorMessage(error, 'list') : null
  const update = useCallback((changes: Record<string, string | null>) => setParams((current) => {
    const next = new URLSearchParams(current)
    Object.entries(changes).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
    return next
  }), [setParams])
  const query = new URLSearchParams({ page: String(page) })
  if (normalizedSearch) query.set('search', normalizedSearch)
  if (active !== 'ALL') query.set('is_active', String(active === 'TRUE'))
  if (featured !== 'ALL') query.set('is_featured', String(featured === 'TRUE'))
  if (style !== 'ALL') query.set('style', style)
  if (layout !== 'ALL') query.set('layout_key', layout)
  if (atsStatus !== 'ALL') query.set('ats_status', atsStatus)
  if (industry !== 'ALL') query.set('industry', industry)

  const hasFilters = Boolean(
    normalizedSearch ||
    active !== 'ALL' ||
    featured !== 'ALL' ||
    style !== 'ALL' ||
    layout !== 'ALL' ||
    atsStatus !== 'ALL' ||
    industry !== 'ALL'
  )

  const visibleItems = data?.items ?? []

  return <div className="min-h-screen bg-white">
    <AdminHeader />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-black"><ArrowLeft size={16} />Tổng quan</Link>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-[#1C1C1C]">Quản lý mẫu CV</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Quản lý danh mục, trạng thái hiển thị và thông tin các mẫu CV.</p>
        </div>
        <Link to="/admin/cv-templates/new" className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-black"><FilePlus2 size={17} />Thêm mẫu CV</Link>
      </header>

      <AdminCVTemplateFilters
        search={search}
        active={active}
        featured={featured}
        style={style}
        layout={layout}
        atsStatus={atsStatus}
        industry={industry}
        industryOptions={industryOptions}
        onSearchChange={(value) => update({ search: value || null, page: null })}
        onActiveChange={(value) => update({ is_active: value === 'ALL' ? null : String(value === 'TRUE'), page: null })}
        onFeaturedChange={(value) => update({ is_featured: value === 'ALL' ? null : String(value === 'TRUE'), page: null })}
        onStyleChange={(value) => update({ style: value === 'ALL' ? null : value, page: null })}
        onLayoutChange={(value) => update({ layout_key: value === 'ALL' ? null : value, page: null })}
        onATSStatusChange={(value) => update({ ats_status: value === 'ALL' ? null : value, page: null })}
        onIndustryChange={(value) => update({ industry: value === 'ALL' ? null : value, industry_group: null, page: null })}
        onReset={() => setParams({})}
      />

      {data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}
      {isInitialLoading ? <ListSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200">
        <AlertCircle className="mx-auto text-red-600" />
        <h2 className="mt-4 text-lg font-bold text-slate-950 font-[Inter,sans-serif]">Không thể tải danh sách mẫu CV.</h2>
        <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
        <button type="button" onClick={refetch} className="btn-press mt-5 rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black">Thử lại</button>
      </section> : visibleItems.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200">
        <FileText className="mx-auto text-[#1C1C1C]" size={30} />
        <h2 className="mt-4 text-xl font-bold text-slate-950 font-[Inter,sans-serif]">{hasFilters ? 'Không tìm thấy mẫu CV phù hợp.' : 'Chưa có mẫu CV.'}</h2>
      </section> : data ? <>
        <section className="mt-6 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((template) => <article key={template.id} className="group relative self-start rounded-2xl bg-slate-100/80 shadow-xs ring-1 ring-slate-200/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-black/10">
            <div className="relative mx-4 mt-4 flex aspect-[210/297] items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <FileText className="absolute text-slate-400" size={30} />
              {template.thumbnail_url && <img src={resolveApiAssetUrl(template.thumbnail_url)} alt={`Ảnh xem trước mẫu CV ${template.name}`} loading="lazy" className="relative h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]" onError={(event) => { event.currentTarget.style.display = 'none' }} />}
              {template.is_featured && <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-md bg-[#49BBBD] px-2 py-1 text-[11px] font-bold text-white shadow-sm"><Sparkles size={12} />Nổi bật</span>}
            </div>
            <div className="p-4">
              <h2 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950 font-[Inter,sans-serif]">{template.name}</h2>
              <div className="mt-3 flex items-center justify-between gap-3">
                {template.styles.length > 0 ? <span className="truncate rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">{CV_TEMPLATE_STYLE_LABELS[template.styles[0]]}</span> : <span className="text-[10px] font-semibold text-slate-400">Chưa phân loại</span>}
                <Link to={`/admin/cv-templates/${template.id}`} state={{ returnTo: `/admin/cv-templates?${query}` }} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#1C1C1C] transition-colors hover:text-black"><Eye size={16} />Chi tiết<ArrowRight size={15} /></Link>
              </div>
            </div>
          </article>)}
        </section>
        {data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between">
          <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="btn-press rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 disabled:opacity-40">Trước</button>
          <span className="text-sm text-slate-600">Trang {data.page} / {data.total_pages}</span>
          <button type="button" disabled={page >= data.total_pages} onClick={() => update({ page: String(page + 1) })} className="btn-press rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 disabled:opacity-40">Sau</button>
        </nav>}
      </> : null}
    </main>
  </div>
}
