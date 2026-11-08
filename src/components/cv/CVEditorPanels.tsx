import { Check, Eye, EyeOff, Pencil, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { CVCreateRequest, CVSectionVisibility, CVTemplate, CVTemplateStyle, CVTemplateSummary } from '../../types/cv'
import { resolveCVPresentation } from './cvTheme'
import { CV_EDITOR_SECTIONS, deriveSectionState, sectionHasData, type CVEditorContentSection, type CVEditorPresentationDraft } from './cvEditorState'
import CVTemplateRecommendation from './CVTemplateRecommendation'
import CVTemplateThumbnail from './CVTemplateThumbnail'

export function CVLayoutPanel({ template, presentation, onChange }: { template: CVTemplateSummary; presentation: CVEditorPresentationDraft; onChange: (value: CVEditorPresentationDraft) => void }) {
  const resolved = resolveCVPresentation(template.layout_key, presentation.templateConfigSnapshot, presentation.candidateOverrides)
  const toggle = (key: keyof CVSectionVisibility, visible: boolean) => onChange({ ...presentation, candidateOverrides: { ...presentation.candidateOverrides, section_visibility: { ...presentation.candidateOverrides.section_visibility, [key]: visible } } })
  return <div className="space-y-2">{CV_EDITOR_SECTIONS.map(({ key, label }) => {
    const visible = resolved.sectionVisibility[key] !== false
    return <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div className="flex min-w-0 items-center gap-2.5">{visible ? <Eye size={16} className="shrink-0 text-[#49BBBD]" /> : <EyeOff size={16} className="shrink-0 text-slate-400" />}<div><p className="text-sm font-semibold text-slate-800">{label}</p><p className="text-[11px] text-slate-500">{visible ? 'Đang hiển thị' : 'Đang ẩn'}</p></div></div><button type="button" role="switch" aria-checked={visible} aria-label={`${visible ? 'Ẩn' : 'Hiện'} ${label}`} onClick={() => toggle(key, !visible)} className={`relative h-6 w-11 rounded-full transition ${visible ? 'bg-[#49BBBD]' : 'bg-slate-300'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${visible ? 'left-6' : 'left-1'}`} /></button></div>
  })}<p className="pt-2 text-xs leading-5 text-slate-500">Ẩn một mục chỉ thay đổi cách trình bày. Nội dung đã nhập vẫn được giữ nguyên.</p></div>
}

export function CVAddSectionPanel({ data, template, presentation, onShow, onEdit }: { data: CVCreateRequest; template: CVTemplateSummary; presentation: CVEditorPresentationDraft; onShow: (key: keyof CVSectionVisibility) => void; onEdit: (key: CVEditorContentSection) => void }) {
  const resolved = resolveCVPresentation(template.layout_key, presentation.templateConfigSnapshot, presentation.candidateOverrides)
  return <div className="space-y-2">{CV_EDITOR_SECTIONS.map(({ key, label }) => {
    const state = deriveSectionState(sectionHasData(data, key), resolved.sectionVisibility[key] !== false)
    const complete = state === 'VISIBLE_WITH_DATA'
    const hidden = state === 'HIDDEN_WITH_DATA'
    return <div key={key} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{label}</p><p className="mt-0.5 text-[11px] text-slate-500">{complete ? 'Đã có nội dung' : hidden ? 'Có nội dung nhưng đang ẩn' : 'Chưa có nội dung'}</p></div>{complete && <Check size={17} className="text-emerald-600" />}</div><button type="button" onClick={() => hidden ? onShow(key) : onEdit(key)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#49BBBD] hover:text-[#3ba8aa]">{hidden ? <Eye size={14} /> : complete ? <Pencil size={14} /> : <Plus size={14} />}{hidden ? 'Hiển thị' : complete ? 'Chỉnh sửa' : 'Thêm nội dung'}</button></div>
  })}</div>
}

const filters: Array<{ value: 'ALL' | CVTemplateStyle; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'SIMPLE', label: 'Đơn giản' },
  { value: 'PROFESSIONAL', label: 'Chuyên nghiệp' },
  { value: 'IMPRESSIVE', label: 'Ấn tượng' },
]
const styleLabel: Record<CVTemplateStyle, string> = { SIMPLE: 'Đơn giản', PROFESSIONAL: 'Chuyên nghiệp', IMPRESSIVE: 'Ấn tượng' }

export function CVTemplateSwitchPanel({ templates, selectedId, data, locale, cvId, onPreview, onSelect }: { templates: CVTemplate[]; selectedId: string; data: CVCreateRequest; locale: CVEditorPresentationDraft['locale']; cvId?: string; onPreview: (id: string) => void; onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState<'ALL' | CVTemplateStyle>('ALL')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(24)
  const items = useMemo(() => templates.filter((template) => {
    const item = template as CVTemplate
    const matchesFilter = filter === 'ALL' || item.styles?.includes(filter)
    return matchesFilter && template.name.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))
  }), [filter, query, templates])
  const visibleItems = items.slice(0, visibleCount)
  return <div><CVTemplateRecommendation data={data} locale={locale} cvId={cvId} currentTemplateId={selectedId} templates={templates} onPreview={onPreview} onSelect={onSelect} /><label className="relative block"><Search size={15} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(24) }} placeholder="Tìm mẫu CV" aria-label="Tìm mẫu CV" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#49BBBD]" /></label><div className="mt-3 flex flex-nowrap gap-1 overflow-x-auto">{filters.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => { setFilter(item.value); setVisibleCount(24) }} className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1.5 text-[11px] font-semibold ${filter === item.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item.label}</button>)}</div><p className="mt-3 text-[11px] font-medium text-slate-500">{items.length} mẫu phù hợp</p><div data-testid="cv-template-switch-grid" className="mt-4 grid grid-cols-2 gap-3">{visibleItems.map((template) => {
    const full = template as CVTemplate
    const selected = template.id === selectedId
    return <button key={template.id} type="button" aria-pressed={selected} aria-label={`${selected ? 'Đang sử dụng' : 'Chọn'} mẫu ${template.name}`} onClick={() => onSelect(template.id)} className={`group relative min-w-0 overflow-hidden rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] ${selected ? 'border-[#49BBBD] bg-teal-50 ring-1 ring-[#49BBBD]/30' : 'border-slate-200 bg-white hover:border-[#49BBBD]'}`}><CVTemplateThumbnail name={template.name} url={full.thumbnail_url} className="aspect-[210/297] w-full" />{selected && <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[#49BBBD] text-white shadow"><Check size={15} /></span>}<span className="mt-2 block line-clamp-2 min-h-8 text-xs font-bold leading-4 text-slate-900">{template.name}</span><span className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${selected ? 'text-[#3ba8aa]' : 'text-slate-500'}`}>{selected ? <><Check size={13} />Đang sử dụng</> : full.styles?.length ? full.styles.map((style) => styleLabel[style]).join(' · ') : 'Mẫu CV GJob'}</span></button>
  })}{items.length === 0 && <p className="col-span-2 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">Không tìm thấy mẫu phù hợp.</p>}{visibleCount < items.length && <button type="button" onClick={() => setVisibleCount((current) => current + 24)} className="col-span-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Hiển thị thêm {Math.min(24, items.length - visibleCount)} mẫu</button>}</div></div>
}

const normalizeLibraryText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('vi')

export function CVReferenceLibraryPanel({ templates, onPreview }: { templates: CVTemplate[]; onPreview: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('ALL')
  const [visibleCount, setVisibleCount] = useState(18)
  const industries = useMemo(() => {
    const unique = new Map<string, string>()
    templates.forEach((template) => template.industries?.forEach((item) => unique.set(item.code, item.display_name)))
    return [...unique].sort((left, right) => left[1].localeCompare(right[1], 'vi'))
  }, [templates])
  const items = useMemo(() => {
    const normalizedQuery = normalizeLibraryText(query.trim())
    return templates.filter((template) => {
      const matchesIndustry = industry === 'ALL' || template.industries?.some((item) => item.code === industry)
      const searchable = [template.name, template.description ?? '', ...(template.industries ?? []).map((item) => item.display_name), ...(template.job_positions ?? []).map((item) => item.display_name)].join(' ')
      return matchesIndustry && (!normalizedQuery || normalizeLibraryText(searchable).includes(normalizedQuery))
    })
  }, [industry, query, templates])
  const visibleItems = items.slice(0, visibleCount)
  const groups = useMemo(() => {
    const grouped = new Map<string, CVTemplate[]>()
    visibleItems.forEach((template) => {
      const label = template.industries?.[0]?.display_name ?? 'Mẫu CV đa ngành'
      grouped.set(label, [...(grouped.get(label) ?? []), template])
    })
    return [...grouped]
  }, [visibleItems])

  const resetResults = () => setVisibleCount(18)
  return <div data-testid="cv-reference-library" className="space-y-4">
    <label className="relative block"><Search size={15} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); resetResults() }} placeholder="Tìm theo ngành hoặc vị trí" aria-label="Tìm CV tham khảo" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/15" /></label>
    <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Ngành nghề</span><select value={industry} onChange={(event) => { setIndustry(event.target.value); resetResults() }} aria-label="Lọc CV tham khảo theo ngành" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/15"><option value="ALL">Tất cả ngành nghề</option>{industries.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
    <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-600">{items.length} mẫu tham khảo</p>{(query || industry !== 'ALL') && <button type="button" onClick={() => { setQuery(''); setIndustry('ALL'); resetResults() }} className="text-xs font-bold text-[#3ba8aa] hover:underline">Xóa bộ lọc</button>}</div>
    {groups.map(([group, groupTemplates]) => <section key={group} aria-label={group} className="space-y-2.5"><h3 className="border-b border-slate-100 pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{group}</h3><div className="grid grid-cols-2 gap-3">{groupTemplates.map((template) => {
      const position = template.job_positions?.[0]?.display_name ?? template.name
      return <button key={template.id} type="button" onClick={() => onPreview(template.id)} className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-left transition hover:-translate-y-0.5 hover:border-[#49BBBD] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"><CVTemplateThumbnail name={template.name} url={template.thumbnail_url} className="aspect-[210/297] w-full" /><span className="mt-2 block line-clamp-2 min-h-8 text-xs font-bold leading-4 text-slate-800">{position}</span><span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#3ba8aa]"><Eye size={13} />Xem tham khảo</span></button>
    })}</div></section>)}
    {items.length === 0 && <div className="rounded-xl bg-slate-50 px-4 py-8 text-center"><p className="text-sm font-semibold text-slate-700">Không tìm thấy CV phù hợp</p><p className="mt-1 text-xs text-slate-500">Hãy thử từ khóa hoặc ngành nghề khác.</p></div>}
    {visibleCount < items.length && <button type="button" onClick={() => setVisibleCount((current) => current + 18)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-[#49BBBD] hover:text-[#3ba8aa]">Xem thêm {Math.min(18, items.length - visibleCount)} mẫu</button>}
  </div>
}
