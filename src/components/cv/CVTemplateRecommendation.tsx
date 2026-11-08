import { ArrowLeft, Eye, Loader2, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cvService } from '../../services/cvService'
import { cvTemplateService } from '../../services/cvTemplateService'
import type { CVCreateRequest, CVPresentationLocale, CVRecommendationPriority, CVTemplate, CVTemplateRecommendationItem, CVTemplateStyle, CVTemplateTaxonomy } from '../../types/cv'
import { deriveRecommendationContext } from './cvRecommendationContext'

const styleLabels: Record<CVTemplateStyle, string> = { SIMPLE: 'Đơn giản', PROFESSIONAL: 'Chuyên nghiệp', IMPRESSIVE: 'Ấn tượng' }
const priorityLabels: Record<CVRecommendationPriority, string> = { ATS_FIRST: 'Ưu tiên ATS', BALANCED: 'Cân bằng', DESIGN_FIRST: 'Ưu tiên thiết kế' }

type Props = {
  data: CVCreateRequest
  locale: CVPresentationLocale
  cvId?: string
  currentTemplateId: string
  templates: CVTemplate[]
  onPreview: (templateId: string) => void
  onSelect: (templateId: string) => void
}

export default function CVTemplateRecommendation({ data, locale, cvId, currentTemplateId, templates, onPreview, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [taxonomy, setTaxonomy] = useState<CVTemplateTaxonomy | null>(null)
  const [taxonomyError, setTaxonomyError] = useState(false)
  const [industry, setIndustry] = useState('')
  const [position, setPosition] = useState('')
  const [style, setStyle] = useState<'' | CVTemplateStyle>('')
  const [priority, setPriority] = useState<CVRecommendationPriority>('BALANCED')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<CVTemplateRecommendationItem[] | null>(null)
  const requestController = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!open || taxonomy) return
    cvTemplateService.getCVTemplateTaxonomy()
      .then(setTaxonomy)
      .catch(() => setTaxonomyError(true))
  }, [open, taxonomy])
  useEffect(() => () => requestController.current?.abort(), [])

  const positions = useMemo(() => {
    if (!taxonomy) return []
    if (industry) return taxonomy.industries.find((item) => item.code === industry)?.positions ?? []
    const unique = new Map<string, { code: string; display_name: string }>()
    taxonomy.industries.flatMap((item) => item.positions).forEach((item) => unique.set(item.code, item))
    return [...unique.values()].sort((a, b) => a.display_name.localeCompare(b.display_name, 'vi'))
  }, [industry, taxonomy])

  const requestRecommendations = async () => {
    setLoading(true); setError(null)
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller
    try {
      const context = deriveRecommendationContext(data)
      const response = await cvService.recommendTemplates({
        ...(cvId ? { cv_id: cvId } : {}),
        preference: { ...(position ? { target_position: position } : {}), ...(industry ? { industry } : {}), ...(style ? { preferred_style: style } : {}), recommendation_priority: priority },
        cv_context: { ...context, locale, current_template_id: currentTemplateId },
      }, controller.signal)
      setResults(response.recommendations)
    } catch {
      if (!controller.signal.aborted) setError('Chưa thể gợi ý mẫu lúc này. Hãy thử lại sau.')
    } finally { if (requestController.current === controller) { requestController.current = null; setLoading(false) } }
  }

  const close = () => { requestController.current?.abort(); requestController.current = null; setLoading(false); setOpen(false); setResults(null); setError(null) }
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="mb-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#49BBBD] bg-[#49BBBD] px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#3ba8aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] focus-visible:ring-offset-2"><Sparkles size={17} aria-hidden="true" />Gợi ý mẫu bằng AI</button>

  return <section aria-label="Gợi ý mẫu CV phù hợp" className="mb-4 rounded-2xl border border-teal-200 bg-teal-50/40 p-3">
    <div className="flex items-center justify-between gap-2"><div><p className="text-sm font-bold text-slate-950">Gợi ý mẫu CV phù hợp</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">Chọn tiêu chí của bạn; CV sẽ không tự lưu hay đổi mẫu.</p></div><button type="button" onClick={close} aria-label="Đóng gợi ý mẫu" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-slate-500 hover:bg-slate-100"><X size={16} /></button></div>
    <div aria-live="polite">{results ? <div className="mt-4">
      <button type="button" onClick={() => setResults(null)} className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-[#49BBBD]"><ArrowLeft size={14} />Thử lại với tiêu chí khác</button>
      <div className="space-y-3">{results.map((item) => {
        const template = templates.find((value) => value.id === item.template_id)
        return <article key={item.template_id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><div className="flex gap-3"><div className="grid h-20 w-14 shrink-0 place-items-center overflow-hidden rounded bg-white ring-1 ring-slate-200">{item.thumbnail_url ? <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <span className="text-[9px] font-bold text-slate-400">CV</span>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-bold text-slate-950">{item.rank}. {item.name}</p>{item.is_current && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">Đang dùng</span>}</div><p className="mt-1 text-[11px] text-slate-500">{item.styles.map((value) => styleLabels[value]).join(' · ') || 'Không ưu tiên phong cách'}</p><span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${item.ats_status === 'ATS_FRIENDLY' ? 'bg-emerald-50 text-emerald-700' : item.ats_status === 'ATS_CAUTION' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{item.ats_status === 'ATS_FRIENDLY' ? 'Thân thiện ATS' : item.ats_status === 'ATS_CAUTION' ? 'ATS: Cần lưu ý' : 'ATS: Chưa đánh giá'}</span></div></div><p className="mt-3 text-xs leading-5 text-slate-600">{item.reason}</p><ul aria-label="Điểm phù hợp" className="mt-2 space-y-1 text-[11px] leading-4 text-slate-500">{item.strengths.map((strength) => <li key={strength} className="flex gap-1.5"><span aria-hidden="true" className="text-[#49BBBD]">•</span><span>{strength}</span></li>)}</ul><div className="mt-3 flex gap-2"><button type="button" disabled={!template} onClick={() => onPreview(item.template_id)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Eye size={14} />Xem trước</button><button type="button" disabled={!template || item.is_current} onClick={() => { onSelect(item.template_id); close() }} className="flex-1 rounded-lg bg-[#49BBBD] px-2 py-2 text-xs font-bold text-white hover:bg-[#3ba8aa] disabled:cursor-default disabled:opacity-50">{item.is_current ? 'Đang sử dụng' : 'Chọn mẫu'}</button></div></article>
      })}</div>
    </div> : <div className="mt-4 space-y-3">
      {taxonomyError && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700">Không tải được danh mục vị trí và ngành nghề.</p>}
      <label className="block text-xs font-semibold text-slate-700">Vị trí mục tiêu<span className="mt-1 block text-[10px] font-normal text-slate-500">Bạn đang muốn ứng tuyển vị trí nào?</span><select value={position} onChange={(event) => setPosition(event.target.value)} disabled={!taxonomy} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Chưa xác định</option>{positions.map((item) => <option key={item.code} value={item.code}>{item.display_name}</option>)}</select></label>
      <label className="block text-xs font-semibold text-slate-700">Ngành nghề<span className="mt-1 block text-[10px] font-normal text-slate-500">Bạn đang tìm việc trong lĩnh vực nào?</span><select value={industry} onChange={(event) => { setIndustry(event.target.value); setPosition('') }} disabled={!taxonomy} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Chưa xác định</option>{taxonomy?.industries.map((item) => <option key={item.code} value={item.code}>{item.display_name}</option>)}</select></label>
      <label className="block text-xs font-semibold text-slate-700">Phong cách<span className="mt-1 block text-[10px] font-normal text-slate-500">Bạn muốn CV trông như thế nào?</span><select value={style} onChange={(event) => setStyle(event.target.value as '' | CVTemplateStyle)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Không ưu tiên</option>{Object.entries(styleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <fieldset><legend className="text-xs font-semibold text-slate-700">Bạn muốn ưu tiên ATS hay thiết kế?</legend><div className="mt-2 grid grid-cols-3 gap-1">{(Object.keys(priorityLabels) as CVRecommendationPriority[]).map((value) => <button key={value} type="button" aria-pressed={priority === value} onClick={() => setPriority(value)} className={`rounded-lg px-1.5 py-2 text-[10px] font-bold ${priority === value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{priorityLabels[value]}</button>)}</div></fieldset>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      <button type="button" onClick={() => void requestRecommendations()} disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#49BBBD] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#3ba8aa] disabled:cursor-wait disabled:opacity-60">{loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{loading ? 'Đang phân tích tiêu chí...' : 'Gợi ý mẫu'}</button>
    </div>}</div>
  </section>
}
