import { RotateCcw } from 'lucide-react'
import type { CVCandidatePresentationOverrides, CVPresentationLocale, CVTemplateLayoutKey, CVTemplateThemeConfig } from '../../types/cv'
import { CV_THEME_OPTIONS, resolveCVPresentation } from './cvTheme'

type Props = {
  layoutKey: CVTemplateLayoutKey
  snapshot: Partial<CVTemplateThemeConfig> | null | undefined
  overrides: CVCandidatePresentationOverrides
  locale?: CVPresentationLocale
  onLocaleChange?: (locale: CVPresentationLocale) => void
  onChange: (value: CVCandidatePresentationOverrides) => void
}

export default function CVDesignControls({ layoutKey, snapshot, overrides, locale = 'vi', onLocaleChange, onChange }: Props) {
  const resolved = resolveCVPresentation(layoutKey, snapshot, overrides)
  const patch = <K extends keyof CVCandidatePresentationOverrides>(key: K, value: CVCandidatePresentationOverrides[K]) => onChange({ ...overrides, [key]: value })
  return <section aria-label="Thiết kế CV" className="space-y-4">
    <div className="grid gap-4">
      {onLocaleChange && <Select label="Ngôn ngữ mẫu CV" value={locale} options={[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }]} onChange={onLocaleChange} />}
      <label className="text-sm font-semibold text-slate-700">Màu chủ đề<div className="mt-2 flex gap-2"><input type="color" aria-label="Màu chủ đề" value={resolved.primary_color} onChange={(event) => patch('primary_color', event.target.value.toUpperCase())} className="h-10 w-14 rounded-lg border border-slate-300 bg-white p-1"/><input aria-label="Mã màu chủ đề" value={overrides.primary_color ?? ''} placeholder={resolved.primary_color} onChange={(event) => patch('primary_color', event.target.value.toUpperCase())} className="input min-w-0 font-mono uppercase" maxLength={7}/></div></label>
      <label className="text-sm font-semibold text-slate-700">Màu phụ<div className="mt-2 flex gap-2"><input type="color" aria-label="Màu phụ" value={resolved.secondary_color} onChange={(event) => patch('secondary_color', event.target.value.toUpperCase())} className="h-10 w-14 rounded-lg border border-slate-300 bg-white p-1"/><input aria-label="Mã màu phụ" value={overrides.secondary_color ?? ''} placeholder={resolved.secondary_color} onChange={(event) => patch('secondary_color', event.target.value.toUpperCase())} className="input min-w-0 font-mono uppercase" maxLength={7}/></div></label>
      <Select label="Phông chữ" value={resolved.font_family} options={CV_THEME_OPTIONS.fontFamilies} onChange={(value) => patch('font_family', value)} />
      <Select label="Cỡ chữ" value={resolved.font_scale} options={CV_THEME_OPTIONS.fontScales} onChange={(value) => patch('font_scale', value)} />
      <Select label="Khoảng cách dòng" value={resolved.line_spacing} options={CV_THEME_OPTIONS.lineSpacings} onChange={(value) => patch('line_spacing', value)} />
      <Select label="Khoảng cách mục" value={resolved.section_spacing} options={CV_THEME_OPTIONS.sectionSpacings} onChange={(value) => patch('section_spacing', value)} />
      <Select label="Kiểu tiêu đề" value={resolved.heading_style} options={CV_THEME_OPTIONS.headingStyles} onChange={(value) => patch('heading_style', value)} />
    </div>
    <button type="button" onClick={() => onChange({})} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><RotateCcw size={14}/>Khôi phục thiết kế và bố cục mặc định</button>
  </section>
}

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: ReadonlyArray<{ value: T; label: string }>; onChange: (value: T) => void }) {
  return <label className="text-sm font-semibold text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value as T)} className="input mt-2 bg-white">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}
