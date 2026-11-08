import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, FileText, LayoutGrid, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { isSupportedCVTemplateLayout } from '../../components/cv/cvTemplateRegistry'
import CVPreview from '../../components/cv/CVPreview'
import { createSampleCVData } from '../../components/cv/sampleCVData'
import { cvTemplateService } from '../../services/cvTemplateService'
import { resolveApiAssetUrl } from '../../services/api'
import type { CVTemplate, CVTemplateIndustry, CVTemplateStyle, CVTemplateTaxonomy, CVTemplateTaxonomyItem } from '../../types/cv'
import { CV_TEMPLATE_STYLE_LABELS } from '../../components/cv/cvTemplateStyles'
import heroCVPortrait from '../../assets/cv-hero-portrait.webp'

type Filters = { industry_group: string; job_position: string; style: '' | CVTemplateStyle; ats_friendly: boolean }
type CatalogMode = 'styles' | 'positions'
const EMPTY_FILTERS: Filters = { industry_group: '', job_position: '', style: '', ats_friendly: false }
const TEMPLATE_STYLES = new Set<CVTemplateStyle>(['SIMPLE', 'PROFESSIONAL', 'IMPRESSIVE'])
const styleLabels = CV_TEMPLATE_STYLE_LABELS
const styleDescriptions: Record<CVTemplateStyle, string> = {
  SIMPLE: 'có thiết kế đơn giản, ưu tiên tính dễ đọc và dễ sử dụng. Phù hợp với ứng viên muốn tập trung vào khả năng truyền tải thông tin rõ ràng, gọn gàng và kỹ năng chính.',
  PROFESSIONAL: 'có bố cục chỉn chu, rõ ràng và màu sắc trang nhã. Phù hợp với ứng viên muốn thể hiện sự nghiêm túc, chuyên nghiệp và đáng tin cậy.',
  IMPRESSIVE: 'có thiết kế nổi bật, giàu điểm nhấn thị giác nhưng vẫn bảo đảm nội dung dễ theo dõi. Phù hợp với ứng viên muốn tạo dấu ấn cá nhân ngay từ lần xem đầu tiên.',
}

function filtersFromSearchParams(params: URLSearchParams, mode: CatalogMode): Filters {
  const style = params.get('style')
  const taxonomyCode = (key: 'industry_group' | 'job_position') => {
    const value = params.get(key) ?? ''
    return /^[A-Z][A-Z0-9_]{1,79}$/.test(value) ? value : ''
  }
  const filters: Filters = {
    industry_group: taxonomyCode('industry_group'),
    job_position: taxonomyCode('job_position'),
    style: style && TEMPLATE_STYLES.has(style as CVTemplateStyle) ? style as CVTemplateStyle : '',
    ats_friendly: params.get('ats_friendly') === 'true',
  }
  if (mode === 'styles') {
    filters.industry_group = ''
    filters.job_position = ''
  } else {
    filters.style = ''
  }
  return filters
}

export default function CandidateCVTemplatesPage({ mode = 'styles' }: { mode?: CatalogMode }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchFilterKey = searchParams.toString()
  const navigationFilterKey = `${mode}:${searchFilterKey}`
  const routeFilters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchFilterKey), mode),
    [mode, searchFilterKey],
  )
  const refreshVersion = useDataRefreshVersion()
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const [taxonomy, setTaxonomy] = useState<CVTemplateTaxonomy | null>(null)
  const [filterOverride, setFilterOverride] = useState<{ key: string; value: Filters } | null>(null)
  const filters = filterOverride?.key === navigationFilterKey ? filterOverride.value : routeFilters
  const [preview, setPreview] = useState<CVTemplate | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [catalogRevision, setCatalogRevision] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const templateRequestId = useRef(0)
  const [positionQuery, setPositionQuery] = useState('')
  const [positionSearchFocused, setPositionSearchFocused] = useState(false)
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(() => new Set())
  const [featuredSlide, setFeaturedSlide] = useState(0)
  const [featuredPaused, setFeaturedPaused] = useState(false)
  const [featuredTransitionEnabled, setFeaturedTransitionEnabled] = useState(true)
  const [featuredVisibleCount, setFeaturedVisibleCount] = useState(() => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth >= 1024) return 3
    if (window.innerWidth >= 640) return 2
    return 1
  })
  const hasFilters = Object.values(filters).some(Boolean)
  const showCatalog = mode === 'styles' || Boolean(filters.job_position)
  const activeStyleLabel = filters.style
    ? `${styleLabels[filters.style]}${filters.ats_friendly ? ' thân thiện ATS' : ''}`
    : filters.ats_friendly ? 'thân thiện ATS' : 'đa phong cách'
  const styleDescription = filters.style
    ? styleDescriptions[filters.style]
    : 'với nhiều phong cách, bố cục rõ ràng và dễ tùy chỉnh. Phù hợp với nhiều ngành nghề và mục tiêu ứng tuyển khác nhau.'
  const filterVisualKey = `${filters.style || 'ALL'}:${filters.ats_friendly ? 'ATS' : 'ANY'}`
  const catalogDescription = `${loading && templates.length === 0 ? 'Đang tải các mẫu CV tiếng Việt' : `Tuyển chọn ${templates.length.toLocaleString('vi-VN')} mẫu CV tiếng Việt`} ${styleDescription}${filters.ats_friendly ? ' Các mẫu đang hiển thị đều được đánh giá thân thiện với hệ thống ATS.' : ''}`

  const loadTemplates = useCallback(async () => {
    const requestId = ++templateRequestId.current
    setLoading(true); setError(null)
    try {
      const response = await cvTemplateService.getCVTemplates({
        industry_group: filters.industry_group || undefined,
        job_position: filters.job_position || undefined,
        style: filters.style || undefined,
        ats_status: filters.ats_friendly ? 'ATS_FRIENDLY' : undefined,
      })
      if (requestId !== templateRequestId.current) return
      setFeaturedSlide(0)
      setTemplates(response.items)
      setCatalogRevision((current) => current + 1)
    } catch {
      if (requestId === templateRequestId.current) setError('Không thể tải danh sách mẫu CV. Kiểm tra kết nối rồi thử lại.')
    } finally {
      if (requestId === templateRequestId.current) setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let cancelled = false
    cvTemplateService.getCVTemplateTaxonomy().then((value) => { if (!cancelled) setTaxonomy(value) }).catch(() => { if (!cancelled) setError('Không thể tải bộ lọc mẫu CV. Hãy thử lại.') })
    return () => { cancelled = true }
  }, [])
  useEffect(() => { void Promise.resolve().then(loadTemplates) }, [loadTemplates, refreshVersion])
  useEffect(() => {
    if (!preview) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setPreview(null) }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', close)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', close)
    }
  }, [preview])

  const allPositions = useMemo(() => {
    const unique = new Map<string, { code: string; display_name: string }>()
    taxonomy?.industries.forEach((industry) => industry.positions.forEach((position) => unique.set(position.code, position)))
    return [...unique.values()].sort((a, b) => a.display_name.localeCompare(b.display_name, 'vi'))
  }, [taxonomy])
  const selectedPosition = useMemo(
    () => allPositions.find((item) => item.code === filters.job_position),
    [allPositions, filters.job_position],
  )
  const positionDirectory = useMemo(() => {
    return (taxonomy?.industries ?? [])
      .filter((industry) => !filters.industry_group || industry.code === filters.industry_group)
      .filter((industry) => industry.positions.length > 0)
  }, [filters.industry_group, taxonomy])
  const positionSuggestions = useMemo(() => {
    const normalized = positionQuery.trim().toLocaleLowerCase('vi')
    if (!normalized) return []
    const seen = new Set<string>()
    const suggestions: Array<{ industry: CVTemplateIndustry; position: CVTemplateTaxonomyItem }> = []
    for (const industry of taxonomy?.industries ?? []) {
      const industryMatches = industry.display_name.toLocaleLowerCase('vi').includes(normalized)
      for (const position of industry.positions) {
        if (seen.has(position.code)) continue
        if (!industryMatches && !position.display_name.toLocaleLowerCase('vi').includes(normalized)) continue
        seen.add(position.code)
        suggestions.push({ industry, position })
      }
    }
    return suggestions.slice(0, 8)
  }, [positionQuery, taxonomy])
  const templateByPosition = useMemo(() => {
    const result = new Map<string, CVTemplate>()
    const orderedTemplates = [...templates].sort((left, right) => Number(right.is_featured) - Number(left.is_featured))
    orderedTemplates.forEach((template) => {
      template.job_positions.forEach((position) => {
        if (!result.has(position.code)) result.set(position.code, template)
      })
    })
    return result
  }, [templates])
  const featuredPositions = useMemo(() => {
    const result: Array<{ industry: CVTemplateIndustry; position: CVTemplateTaxonomyItem; template: CVTemplate }> = []
    for (const template of templates) {
      if (!template.is_featured) continue
      const position = template.job_positions[0]
      if (!position) continue
      const industry = (taxonomy?.industries ?? []).find((item) => item.positions.some((candidate) => candidate.code === position.code))
      if (!industry) continue
      result.push({ industry, position, template })
    }
    return result.slice(0, 12)
  }, [taxonomy, templates])
  const featuredCanRotate = featuredPositions.length > featuredVisibleCount
  const featuredCarouselItems = featuredCanRotate
    ? [...featuredPositions, ...featuredPositions, ...featuredPositions]
    : featuredPositions
  const featuredActiveIndex = featuredPositions.length > 0 ? featuredSlide % featuredPositions.length : 0

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) setFeaturedVisibleCount(3)
      else if (window.innerWidth >= 640) setFeaturedVisibleCount(2)
      else setFeaturedVisibleCount(1)
    }
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])
  useEffect(() => {
    if (featuredPaused || !featuredCanRotate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setFeaturedTransitionEnabled(true)
      setFeaturedSlide((current) => current + 1)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [featuredCanRotate, featuredPaused])
  const pageSize = 24
  const totalPages = Math.max(1, Math.ceil(templates.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleTemplates = useMemo(
    () => templates.slice((safePage - 1) * pageSize, safePage * pageSize),
    [safePage, templates],
  )
  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setPage(1)
    setFilterOverride((current) => ({
      key: navigationFilterKey,
      value: { ...(current?.key === navigationFilterKey ? current.value : routeFilters), [key]: value },
    }))
  }
  const clearFilters = () => {
    setPage(1)
    setFilterOverride({ key: navigationFilterKey, value: EMPTY_FILTERS })
  }
  const toggleIndustry = (industryCode: string) => {
    setExpandedIndustries((current) => {
      const next = new Set(current)
      if (next.has(industryCode)) next.delete(industryCode)
      else next.add(industryCode)
      return next
    })
  }
  const openPositionSuggestion = (industryCode: string, positionCode: string) => {
    setPositionSearchFocused(false)
    navigate(`/candidate/cvs/templates/positions?industry_group=${encodeURIComponent(industryCode)}&job_position=${encodeURIComponent(positionCode)}`)
  }
  const showPreviousFeaturedTemplate = () => {
    if (!featuredCanRotate) return
    if (featuredSlide > 0) {
      setFeaturedTransitionEnabled(true)
      setFeaturedSlide((current) => current - 1)
      return
    }
    setFeaturedTransitionEnabled(false)
    setFeaturedSlide(featuredPositions.length)
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      setFeaturedTransitionEnabled(true)
      setFeaturedSlide(featuredPositions.length - 1)
    }))
  }
  const showNextFeaturedTemplate = () => {
    if (!featuredCanRotate) return
    setFeaturedTransitionEnabled(true)
    setFeaturedSlide((current) => current + 1)
  }
  const finishFeaturedTransition = () => {
    if (!featuredCanRotate || featuredSlide < featuredPositions.length * 2) return
    setFeaturedTransitionEnabled(false)
    setFeaturedSlide(featuredPositions.length)
    window.requestAnimationFrame(() => setFeaturedTransitionEnabled(true))
  }

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    {mode === 'styles' && <div key={filterVisualKey} className="cv-filter-copy-enter">
      <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-sm text-slate-500"><Link to="/" className="hover:text-[#15999B]">Trang chủ</Link><span>/</span><span>Mẫu CV theo phong cách</span><span>/</span><span className="font-semibold text-slate-700">{filters.style ? styleLabels[filters.style] : 'Tất cả mẫu'}</span></nav>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Mẫu CV xin việc tiếng Việt <span className="text-[#49BBBD]">{activeStyleLabel}</span> chuẩn 2026</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{catalogDescription}</p>
    </div>}
    {mode === 'positions' && filters.job_position && <Link to="/candidate/cvs" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#49BBBD]"><ArrowLeft size={16} />CV của tôi</Link>}
    {mode === 'styles' && <section aria-label="Bộ lọc mẫu CV theo phong cách" className="mt-7">
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={() => setFilter('style', '')} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 ease-out ${!filters.style ? '-translate-y-0.5 border-[#49BBBD] bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/25' : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#49BBBD]/40 hover:bg-teal-50 hover:text-[#15999B]'}`}><LayoutGrid size={16} />Tất cả</button>
        {(taxonomy?.styles ?? []).map((style) => {
          const StyleIcon = style === 'SIMPLE' ? Circle : style === 'PROFESSIONAL' ? BriefcaseBusiness : Sparkles
          return <button key={style} type="button" onClick={() => setFilter('style', style)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 ease-out ${filters.style === style ? '-translate-y-0.5 border-[#49BBBD] bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/25' : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#49BBBD]/40 hover:bg-teal-50 hover:text-[#15999B]'}`}><StyleIcon size={16} />{styleLabels[style]}</button>
        })}
        <button type="button" aria-label="Thân thiện ATS" title="Thân thiện ATS" onClick={() => setFilter('ats_friendly', !filters.ats_friendly)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 ease-out ${filters.ats_friendly ? '-translate-y-0.5 border-[#49BBBD] bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/25' : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#49BBBD]/40 hover:bg-teal-50 hover:text-[#15999B]'}`}><ShieldCheck size={16} />ATS</button>
      </div>
      {loading && templates.length > 0 && <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#15999B]" role="status"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#49BBBD]" />Đang cập nhật mẫu CV...</div>}
    </section>}

    {mode === 'positions' && !filters.job_position && <>
      <section aria-label="Tìm mẫu CV theo vị trí" className="relative left-1/2 -mt-8 min-h-[470px] w-screen -translate-x-1/2 bg-[#49BBBD] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 16% 18%, rgba(255,255,255,.22), transparent 31%), radial-gradient(circle at 82% 70%, rgba(21,153,155,.48), transparent 36%), linear-gradient(125deg, #15999B 0%, #49BBBD 52%, #2CA7AA 100%)' }} />
          <div className="pointer-events-none absolute -left-40 top-44 h-56 w-[760px] -rotate-12 rounded-[100%] border-[56px] border-[#0B7678]/35" />
          <div className="pointer-events-none absolute right-[28%] top-[-180px] h-[620px] w-[360px] rotate-[38deg] rounded-[100%] border-[72px] border-[#0B7678]/25" />
        </div>
        <div className="relative mx-auto grid min-h-[470px] max-w-7xl gap-8 px-5 pt-6 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
          <div className="z-10 flex flex-col justify-center pb-12 lg:pb-16">
            <nav aria-label="Đường dẫn" className="mb-10 flex flex-wrap items-center gap-2 text-sm text-white/65"><Link to="/" className="transition hover:text-white">Trang chủ</Link><span>/</span><Link to="/candidate/cvs/templates/styles" className="transition hover:text-white">Mẫu CV</Link><span>/</span><span className="font-semibold text-white">Mẫu CV theo vị trí ứng tuyển</span></nav>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[58px]">Mẫu CV theo<br className="hidden sm:block" /> vị trí ứng tuyển<br className="hidden sm:block" /> mới nhất 2026</h1>
            <p className="mt-5 text-xl font-medium text-white sm:text-2xl">Tạo CV ngay - Chốt việc liền tay</p>
            <form className="relative z-30 mt-7 max-w-xl" onSubmit={(event) => { event.preventDefault(); const first = positionSuggestions[0]; if (first) openPositionSuggestion(first.industry.code, first.position.code) }}>
              <label className="block">
                <span className="sr-only">Tìm vị trí ứng tuyển</span>
                <span className="flex items-center gap-3 rounded-full border-[5px] border-[#49BBBD]/75 bg-white px-5 shadow-2xl shadow-black/20 transition focus-within:border-[#63d2d4] focus-within:ring-4 focus-within:ring-white/15">
                  <Search size={21} className="shrink-0 text-slate-400" />
                  <input type="search" role="combobox" aria-expanded={positionSearchFocused && Boolean(positionQuery.trim())} aria-controls="cv-position-suggestions" aria-autocomplete="list" value={positionQuery} onFocus={() => setPositionSearchFocused(true)} onBlur={() => setPositionSearchFocused(false)} onKeyDown={(event) => { if (event.key === 'Escape') { setPositionQuery(''); setPositionSearchFocused(false) } }} onChange={(event) => setPositionQuery(event.target.value)} placeholder="Tìm kiếm mẫu CV theo vị trí của bạn" className="min-w-0 flex-1 bg-transparent py-3 text-base font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400" />
                  {positionQuery && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setPositionQuery(''); setPositionSearchFocused(true) }} aria-label="Xóa từ khóa tìm kiếm" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={17} /></button>}
                </span>
              </label>
              {positionSearchFocused && positionQuery.trim() && <div id="cv-position-suggestions" role="listbox" onMouseDown={(event) => event.preventDefault()} className="absolute left-1 right-1 top-[calc(100%+2px)] max-h-72 overflow-y-auto rounded-2xl bg-white py-1 text-left text-slate-900 shadow-2xl ring-1 ring-slate-200">
                {positionSuggestions.length > 0 ? positionSuggestions.map(({ industry, position }) => <Link key={`${industry.code}:${position.code}`} role="option" aria-selected="false" to={`/candidate/cvs/templates/positions?industry_group=${encodeURIComponent(industry.code)}&job_position=${encodeURIComponent(position.code)}`} className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5 transition last:border-b-0 hover:bg-teal-50 focus:bg-teal-50 focus:outline-none">
                  <span className="min-w-0"><span className="block truncate font-semibold text-[#15999B]">{position.display_name}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{industry.display_name}</span></span><ArrowRight size={17} className="shrink-0 text-slate-400" />
                </Link>) : <div className="px-5 py-5 text-center text-sm text-slate-500">Không tìm thấy vị trí phù hợp.</div>}
              </div>}
            </form>
          </div>
          <div className="relative hidden min-h-[470px] overflow-hidden lg:block" aria-hidden="true">
            <div className="absolute bottom-[-118px] right-3 aspect-[210/297] w-[405px] overflow-hidden rounded-t-[30px] bg-white shadow-[0_24px_80px_rgba(0,83,85,.38)] ring-1 ring-white/80">
              <HeroCVShowcase />
            </div>
          </div>
        </div>
      </section>

      {(loading || featuredPositions.length > 0) && <section
        className="mt-10"
        aria-labelledby="featured-position-templates-title"
        aria-roledescription="carousel"
        onMouseEnter={() => setFeaturedPaused(true)}
        onMouseLeave={() => setFeaturedPaused(false)}
        onFocus={() => setFeaturedPaused(true)}
        onBlur={() => setFeaturedPaused(false)}
      >
        <h2 id="featured-position-templates-title" className="text-center text-3xl font-bold text-[#15999B]">Mẫu CV tiêu biểu</h2>
        {loading && <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((index) => <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-200" />)}</div>}
        {!loading && featuredPositions.length > 0 && <>
          <div className="mt-5 overflow-hidden">
            <div
              className={`flex will-change-transform motion-reduce:transition-none ${featuredTransitionEnabled ? 'transition-transform duration-500 ease-out' : 'transition-none'}`}
              style={{ transform: `translate3d(-${featuredSlide * (100 / featuredVisibleCount)}%, 0, 0)` }}
              onTransitionEnd={(event) => { if (event.target === event.currentTarget) finishFeaturedTransition() }}
            >
              {featuredCarouselItems.map((item, index) => <div
                key={`${Math.floor(index / Math.max(featuredPositions.length, 1))}:${item.template.id}`}
                className="shrink-0 px-2 first:pl-0 last:pr-0"
                style={{ flexBasis: `${100 / featuredVisibleCount}%` }}
              >
                <PositionTemplateCard industry={item.industry} position={item.position} template={item.template} onPreview={() => setPreview(item.template)} />
              </div>)}
            </div>
          </div>
          {featuredCanRotate && <div className="mt-6 flex items-center justify-between gap-5">
            <div className="flex items-center gap-2" aria-label={`Mẫu ${featuredActiveIndex + 1} trên ${featuredPositions.length}`}>
              {featuredPositions.map((item, index) => <button
                key={item.template.id}
                type="button"
                onClick={() => { setFeaturedTransitionEnabled(true); setFeaturedSlide(featuredPositions.length + index) }}
                aria-label={`Xem mẫu CV tiêu biểu ${index + 1}`}
                aria-pressed={featuredActiveIndex === index}
                className={`h-2.5 rounded-full transition-all ${featuredActiveIndex === index ? 'w-7 bg-[#49BBBD]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
              />)}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={showPreviousFeaturedTemplate} aria-label="Xem mẫu CV trước" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#49BBBD]/40 hover:bg-teal-50 hover:text-[#15999B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"><ChevronLeft size={20} /></button>
              <button type="button" onClick={showNextFeaturedTemplate} aria-label="Xem mẫu CV tiếp theo" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#49BBBD]/40 hover:bg-teal-50 hover:text-[#15999B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"><ChevronRight size={20} /></button>
            </div>
          </div>}
        </>}
      </section>}

      <section className="mt-12" aria-labelledby="cv-position-directory-title">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#15999B]">Khám phá theo ngành nghề</p><h2 id="cv-position-directory-title" className="mt-1 text-2xl font-bold text-slate-950">Mẫu CV theo từng vị trí công việc</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Mỗi nhóm ngành tổng hợp các vị trí phổ biến cùng mẫu CV đại diện để bạn chọn nhanh hơn.</p></div>
        {!taxonomy && <div className="mt-5 h-56 animate-pulse rounded-2xl bg-slate-200" />}
        {!loading && error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Chưa tải được danh sách mẫu CV</p><p className="mt-1">{error}</p><button type="button" onClick={() => void loadTemplates()} className="mt-2 font-semibold underline underline-offset-2">Thử lại</button></div></div>}
        {taxonomy && positionDirectory.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Search className="mx-auto text-slate-300" size={32} /><p className="mt-3 font-semibold text-slate-700">Không tìm thấy vị trí phù hợp với từ khóa.</p><button type="button" onClick={() => setPositionQuery('')} className="mt-3 text-sm font-semibold text-[#15999B] hover:underline">Xóa tìm kiếm</button></div>}
        <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2">
          {positionDirectory.map((industry, industryIndex) => {
            const expanded = expandedIndustries.has(industry.code)
            const visiblePositions = expanded ? industry.positions : industry.positions.slice(0, 3)
            return <article key={industry.code} className={industryIndex % 2 === 0 ? 'bg-white' : 'bg-slate-100/80'}>
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#49BBBD]/12 text-[#15999B]"><BriefcaseBusiness size={24} /></span>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-[#15999B]">{industry.display_name}</h3>
                    <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">Tuyển chọn mẫu CV phù hợp cho {industry.positions.length} vị trí thuộc nhóm {industry.display_name}, giúp bạn trình bày kinh nghiệm và kỹ năng chuyên môn rõ ràng hơn.</p>
                  </div>
                </div>
                <div className="mx-auto mt-7 grid w-full max-w-[1160px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visiblePositions.map((position) => {
                    const template = templateByPosition.get(position.code)
                    return <PositionTemplateCard key={position.code} industry={industry} position={position} template={template} onPreview={template ? () => setPreview(template) : undefined} />
                  })}
                </div>
                {industry.positions.length > 3 && <div className="mt-8 flex items-center gap-4"><button type="button" onClick={() => toggleIndustry(industry.code)} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#15999B] transition hover:text-[#0B7678]">{expanded ? <><ChevronUp size={18} />Thu gọn</> : <><ChevronDown size={18} />Xem thêm {industry.positions.length - 3} vị trí</>}</button><span className="h-px flex-1 bg-slate-300/80" /></div>}
              </div>
            </article>
          })}
        </div>
      </section>
    </>}

    {mode === 'positions' && filters.job_position && (
      <section className="mt-7 py-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800">Mẫu CV theo vị trí</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {selectedPosition?.display_name ?? 'Vị trí đã chọn'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Tổng hợp các mẫu CV được thiết kế tối ưu cho vị trí {selectedPosition?.display_name ?? 'này'}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/candidate/cvs/templates/positions"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#15999B]"
            >
              <ArrowLeft size={14} />
              Chọn vị trí khác
            </Link>
          </div>
        </div>
      </section>
    )}

    {showCatalog && loading && templates.length === 0 && <div className="mx-auto mt-8 grid w-full max-w-[1160px] gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((index) => <div key={index} className="aspect-[210/297] animate-pulse rounded-xl bg-slate-200" />)}</div>}
    {showCatalog && !loading && error && <div role="alert" className="mt-8 flex max-w-xl items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Chưa tải được mẫu CV</p><p className="mt-1">{error}</p><button type="button" onClick={() => void loadTemplates()} className="mt-3 font-semibold underline underline-offset-2">Thử lại</button></div></div>}
    {showCatalog && !loading && !error && templates.length === 0 && <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><FileText className="mx-auto text-slate-400" size={32} /><h2 className="mt-4 font-bold text-slate-900">{hasFilters ? 'Không tìm thấy mẫu CV phù hợp với bộ lọc hiện tại.' : 'Chưa có mẫu CV khả dụng'}</h2>{hasFilters ? <button type="button" onClick={clearFilters} className="mt-4 rounded-lg bg-[#49BBBD] px-4 py-2 text-sm font-semibold text-white">Xóa bộ lọc</button> : <p className="mt-2 text-sm text-slate-600">Vui lòng quay lại sau hoặc liên hệ quản trị viên.</p>}</div>}
    {showCatalog && !error && templates.length > 0 && <div aria-busy={loading} className={`transition-[opacity,transform,filter] duration-300 ease-out ${loading ? 'pointer-events-none translate-y-1 opacity-55 saturate-50' : 'translate-y-0 opacity-100 saturate-100'}`}><div className="mx-auto mt-8 flex w-full max-w-[1160px] items-center justify-between gap-4"><p className="text-sm font-semibold text-slate-600">{templates.length} mẫu CV phù hợp</p><p className="text-xs text-slate-500">Trang {safePage}/{totalPages}</p></div><div key={catalogRevision} className="mx-auto mt-4 grid w-full max-w-[1160px] gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleTemplates.map((template, index) => <div key={template.id} className="cv-filter-card-enter" style={{ animationDelay: `${Math.min(index, 8) * 65}ms` }}><TemplateCard template={template} onPreview={() => setPreview(template)} /></div>)}</div>{totalPages > 1 && <nav aria-label="Phân trang mẫu CV" className="mt-8 flex items-center justify-center gap-3"><button type="button" disabled={safePage === 1} onClick={() => setPage(Math.max(1, safePage - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} />Trước</button><span className="min-w-20 text-center text-sm font-semibold text-slate-600">{safePage} / {totalPages}</span><button type="button" disabled={safePage === totalPages} onClick={() => setPage(Math.min(totalPages, safePage + 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Sau<ChevronRight size={16} /></button></nav>}</div>}

    {/* GJob Trust & Value Pillars */}
    <section className="mt-16 border-t border-slate-200/90 pt-12 pb-6" aria-label="Cam kết chuẩn CV GJob">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#15999B]">Tiêu chuẩn CV GJob</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Tại sao nên tạo CV theo vị trí tại GJob?</h2>
        <p className="mt-2 text-sm text-slate-600">Được tối ưu cho cả nhà tuyển dụng lẫn hệ thống sàng lọc hồ sơ tự động (ATS).</p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#49BBBD]">
            <ShieldCheck size={22} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">100% Thân thiện ATS</h3>
          <p className="mt-2 text-xs leading-5 text-slate-600">Bố cục một cột hoặc hai cột chuẩn hóa, thứ tự DOM đọc chuẩn giúp máy quét phân tích trọn vẹn thông tin.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Sparkles size={22} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">Đặc thù theo chuyên môn</h3>
          <p className="mt-2 text-xs leading-5 text-slate-600">Định hướng từ khóa và kỹ năng phù hợp riêng với từng ngành nghề, giúp hồ sơ nổi bật trước mắt HR.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileText size={22} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">Xuất PDF A4 chuẩn in ấn</h3>
          <p className="mt-2 text-xs leading-5 text-slate-600">Độ phân giải cao, ngắt trang thông minh, sẵn sàng gửi nộp cho nhà tuyển dụng hoặc in ra phỏng vấn trực tiếp.</p>
        </div>
      </div>
    </section>
  </main>{preview && <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} onUse={() => navigate(`/candidate/cvs/create?templateId=${encodeURIComponent(preview.id)}`)} />}</div>
}

function HeroCVShowcase() {
  return <div className="h-full w-full bg-[#f8fbfb] p-5 text-slate-800">
    <div className="grid grid-cols-[132px_1fr] gap-4">
      <div className="overflow-hidden rounded-2xl bg-[#dff4f4] shadow-sm ring-1 ring-[#49BBBD]/20">
        <img src={heroCVPortrait} alt="" className="h-[172px] w-full object-cover object-[center_20%]" />
      </div>
      <div className="flex flex-col justify-center border-y-2 border-[#49BBBD] py-4">
        <p className="text-[23px] font-extrabold leading-tight tracking-tight text-slate-950">NGUYỄN<br />MINH ANH</p>
        <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#15999B]">Chuyên viên Marketing</p>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 text-[7px] text-slate-500"><span>minhanh@email.com</span><span>0900 000 000</span><span>Hà Nội, Việt Nam</span><span>linkedin.com/in/minhanh</span></div>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-[132px_1fr] gap-4">
      <aside className="rounded-2xl bg-[#15999B] px-4 py-5 text-white">
        <CVHeroSectionTitle inverse>Giới thiệu</CVHeroSectionTitle>
        <p className="mt-2 text-[7px] leading-[1.55] text-white/85">Chuyên viên Marketing sáng tạo, có kinh nghiệm xây dựng nội dung và phát triển thương hiệu trên nền tảng số.</p>
        <div className="mt-5"><CVHeroSectionTitle inverse>Kỹ năng</CVHeroSectionTitle><ul className="mt-2 space-y-1.5 text-[7px] text-white/90"><li>Content Marketing</li><li>Social Media</li><li>Digital Campaign</li><li>Data Analysis</li><li>Brand Strategy</li></ul></div>
        <div className="mt-5"><CVHeroSectionTitle inverse>{'Ngôn' + ' ngữ'}</CVHeroSectionTitle><div className="mt-2 space-y-2 text-[7px]"><div><span>Tiếng Việt</span><div className="mt-1 h-1 rounded-full bg-white/25"><div className="h-full w-full rounded-full bg-white" /></div></div><div><span>Tiếng Anh</span><div className="mt-1 h-1 rounded-full bg-white/25"><div className="h-full w-4/5 rounded-full bg-white" /></div></div></div></div>
      </aside>

      <div className="min-w-0 py-1">
        <CVHeroSectionTitle>Mục tiêu nghề nghiệp</CVHeroSectionTitle>
        <p className="mt-2 text-[7px] leading-[1.55] text-slate-600">Phát triển các chiến dịch truyền thông hiệu quả, góp phần xây dựng thương hiệu bền vững và tạo ra giá trị đo lường được cho doanh nghiệp.</p>
        <div className="mt-5"><CVHeroSectionTitle>Kinh nghiệm làm việc</CVHeroSectionTitle><div className="mt-3 space-y-4"><CVHeroTimeline period="2023 — Hiện tại" title="Digital Marketing Executive" company="GJob Technology" /><CVHeroTimeline period="2021 — 2023" title="Content Marketing Specialist" company="Creative Studio" /></div></div>
        <div className="mt-5"><CVHeroSectionTitle>Học vấn</CVHeroSectionTitle><div className="mt-3"><CVHeroTimeline period="2017 — 2021" title="Cử nhân Marketing" company="Đại học Kinh tế Quốc dân" /></div></div>
        <div className="mt-5"><CVHeroSectionTitle>Dự án nổi bật</CVHeroSectionTitle><p className="mt-2 text-[7px] leading-[1.55] text-slate-600">Chiến dịch ra mắt sản phẩm mới · Xây dựng kế hoạch nội dung đa kênh · Theo dõi và tối ưu hiệu quả.</p></div>
      </div>
    </div>
  </div>
}

function CVHeroSectionTitle({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return <div className={`border-b pb-1 text-[8px] font-extrabold uppercase tracking-[0.16em] ${inverse ? 'border-white/35 text-white' : 'border-[#49BBBD] text-[#15999B]'}`}>{children}</div>
}

function CVHeroTimeline({ period, title, company }: { period: string; title: string; company: string }) {
  return <div className="grid grid-cols-[68px_1fr] gap-2"><span className="text-[6px] font-semibold text-slate-400">{period}</span><div><p className="text-[8px] font-bold text-slate-800">{title}</p><p className="mt-0.5 text-[7px] font-semibold text-[#15999B]">{company}</p><p className="mt-1 text-[6px] leading-[1.5] text-slate-500">Lập kế hoạch, phối hợp triển khai và tối ưu hoạt động dựa trên dữ liệu thực tế.</p></div></div>
}

function PositionTemplateCard({
  industry,
  position,
  template,
  onPreview,
}: {
  industry: CVTemplateIndustry
  position: CVTemplateTaxonomyItem
  template?: CVTemplate
  onPreview?: () => void
}) {
  const positionUrl = `/candidate/cvs/templates/positions?industry_group=${encodeURIComponent(industry.code)}&job_position=${encodeURIComponent(position.code)}`
  if (!template || !onPreview) {
    return <article className="flex min-w-0 flex-col rounded-xl bg-[#EEF1F4] p-4 shadow-sm">
      <div className="flex aspect-[210/297] flex-col items-center justify-center bg-white px-6 text-center ring-1 ring-inset ring-[#49BBBD]/15"><BriefcaseBusiness size={34} className="text-[#49BBBD]/55" /><p className="mt-3 text-sm font-semibold text-slate-500">Mẫu cho vị trí này đang được cập nhật</p></div>
      <Link to={positionUrl} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-slate-800 transition hover:text-[#15999B]">CV {position.display_name}<ArrowRight size={14} /></Link>
    </article>
  }

  return <CatalogTemplateCard
    template={template}
    title={`CV ${position.display_name}`}
    subtitle={industry.display_name}
    onPreview={onPreview}
  />
}

function TemplateCard({ template, onPreview }: { template: CVTemplate; onPreview: () => void }) {
  return <CatalogTemplateCard template={template} title={template.name} onPreview={onPreview} />
}

function CatalogTemplateCard({
  template,
  title,
  subtitle,
  onPreview,
}: {
  template: CVTemplate
  title: string
  subtitle?: string
  onPreview: () => void
}) {
  const supported = isSupportedCVTemplateLayout(template.layout_key)
  return <article className="motion-card group flex min-w-0 flex-col rounded-xl bg-[#EEF1F4] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-400/20">
    <div>
      <div className="relative aspect-[210/297] overflow-hidden bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 group-hover:shadow-lg">
        <TemplateThumbnail template={template} />
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {template.is_featured && <span className="inline-flex items-center gap-1 rounded-md bg-[#49BBBD] px-2 py-1 text-[10px] font-bold text-white shadow-sm"><Sparkles size={11} />Nổi bật</span>}
          {template.ats_status === 'ATS_FRIENDLY' && <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm"><ShieldCheck size={11} />ATS</span>}
        </div>
        {supported && <button type="button" onClick={onPreview} className="absolute inset-0 flex items-end p-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#49BBBD]" aria-label={`Dùng mẫu ${title}`}>
          <span className="flex w-full translate-y-3 items-center justify-center gap-2 rounded-md bg-[#49BBBD] px-4 py-3 text-sm font-bold text-white opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:bg-[#15999B] group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"><FileText size={16} />Dùng mẫu</span>
        </button>}
      </div>
    </div>
    <div className="flex flex-1 flex-col px-1 pt-4">
      <h2 className="line-clamp-2 text-base font-bold leading-6 text-slate-950 transition-colors group-hover:text-[#15999B]">{title}</h2>
      {subtitle && <p className="mt-1 line-clamp-1 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-auto flex min-h-6 flex-wrap gap-2 pt-3">
        {template.ats_status === 'ATS_FRIENDLY' && <span className="rounded-full border border-[#49BBBD]/25 bg-white px-3 py-1 text-xs font-semibold text-[#15999B]">ATS</span>}
        {template.styles.map((style) => <span key={style} className="rounded-full border border-[#49BBBD]/20 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{styleLabels[style]}</span>)}
      </div>
      {!supported && <p className="mt-2 text-xs font-semibold text-amber-700">Mẫu này chưa hỗ trợ tạo CV</p>}
    </div>
  </article>
}

function TemplateThumbnail({ template }: { template: CVTemplate }) {
  const [imageFailed, setImageFailed] = useState(false)
  if (template.thumbnail_url && !imageFailed) {
    return <img src={resolveApiAssetUrl(template.thumbnail_url)} alt={`Ảnh xem trước mẫu CV ${template.name}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" onError={() => setImageFailed(true)} />
  }
  return <LiveTemplateThumbnail template={template} />
}

function LiveTemplateThumbnail({ template }: { template: CVTemplate }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(() => typeof IntersectionObserver === 'undefined')
  const [scale, setScale] = useState(0)
  const sampleCV = useMemo(() => createSampleCVData(template.id), [template.id])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShouldRender(true)
      observer.disconnect()
    }, { rootMargin: '320px 0px' })
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldRender) return
    const host = hostRef.current
    if (!host) return
    const updateScale = () => setScale(host.getBoundingClientRect().width / 794)
    updateScale()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateScale)
      return () => window.removeEventListener('resize', updateScale)
    }
    const observer = new ResizeObserver(updateScale)
    observer.observe(host)
    return () => observer.disconnect()
  }, [shouldRender])

  return <div ref={hostRef} className="absolute inset-0 overflow-hidden bg-white" aria-label={`Bản xem trước tự động của ${template.name}`}>
    {(!shouldRender || scale === 0) && <div className="flex h-full items-center justify-center bg-slate-100"><FileText className="text-slate-300" size={42} /></div>}
    {shouldRender && scale > 0 && <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: 794, transform: `scale(${scale})` }}>
      <CVPreview cv={sampleCV} template={template} presentation={{ locale: 'vi' }} className="!max-w-none !shadow-none !ring-0" />
    </div>}
  </div>
}

function TemplatePreviewDialog({ template, onClose, onUse }: { template: CVTemplate; onClose: () => void; onUse: () => void }) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const focusable = dialogRef.current?.querySelector<HTMLElement>('button')
    focusable?.focus()
  }, [])

  return createPortal(
    <div className="cv-preview-backdrop-enter fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm motion-reduce:animate-none sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="template-preview-title" className="cv-preview-panel-enter grid h-[min(88dvh,820px)] w-[min(94vw,1320px)] origin-top overflow-hidden rounded-3xl bg-white shadow-[0_28px_80px_-22px_rgba(15,23,42,0.5)] ring-1 ring-white/20 motion-reduce:animate-none xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-h-0 min-w-0 flex-col">
          <header className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3 sm:px-7">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15999B]">Xem trước mẫu CV</p>
              <h2 id="template-preview-title" className="truncate text-lg font-bold text-slate-950 sm:text-xl">{template.name}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Đóng bản xem trước" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 xl:hidden"><X size={20} /></button>
          </header>
          <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4 sm:p-8">
            <div className="mx-auto w-[794px] max-w-none bg-white shadow-xl ring-1 ring-slate-300">
              <CVPreview cv={createSampleCVData(template.id)} template={template} presentation={{ locale: 'vi' }} className="!max-w-none !shadow-none !ring-0" />
            </div>
          </div>
        </div>

        <aside className="relative flex min-h-0 flex-col border-t border-slate-200 bg-slate-50 xl:border-l xl:border-t-0">
          <button type="button" onClick={onClose} aria-label="Đóng bản xem trước" className="absolute right-4 top-4 hidden h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-slate-300 hover:text-slate-900 xl:inline-flex"><X size={20} /></button>
          <div className="overflow-auto px-5 pb-5 pt-5 sm:px-7 xl:pt-8">
            <h3 className="pr-12 text-xl font-bold text-[#15999B]">Bạn muốn tạo CV từ?</h3>
            <button type="button" onClick={onUse} className="mt-6 flex w-full items-start gap-3 rounded-2xl border border-[#49BBBD]/70 bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#49BBBD] hover:bg-teal-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] motion-reduce:transform-none">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#49BBBD] bg-[#49BBBD] text-white"><Check size={13} strokeWidth={3} /></span>
              <span><span className="block font-bold text-slate-900">Tạo CV mới với mẫu này</span><span className="mt-1 block text-sm leading-5 text-slate-600">Bắt đầu với thông tin tài khoản của bạn và chỉnh sửa trực tiếp trên CV.</span></span>
            </button>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Thông tin mẫu</p>
              <p className="mt-2 font-semibold text-slate-900">{template.name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {template.styles.map((style) => <span key={style} className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{styleLabels[style]}</span>)}
                {template.ats_status === 'ATS_FRIENDLY' && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Thân thiện ATS</span>}
              </div>
            </div>
          </div>
          <div className="mt-auto border-t border-slate-200 bg-white p-5 sm:px-7">
            <button type="button" onClick={onUse} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#49BBBD] px-5 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#15999B] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15999B] focus-visible:ring-offset-2 motion-reduce:transform-none">Tạo CV<ArrowRight size={17} /></button>
          </div>
        </aside>
      </section>
    </div>,
    document.body,
  )
}

