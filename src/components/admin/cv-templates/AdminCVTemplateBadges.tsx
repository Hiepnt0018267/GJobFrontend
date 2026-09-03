import type { CVTemplateLayoutKey } from '../../../types/cv'
import { layoutOptions } from './adminCVTemplateLayout'

export function AdminCVTemplateLayoutBadge({ layoutKey }: { layoutKey: CVTemplateLayoutKey }) { return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200">{layoutOptions.find((item) => item.value === layoutKey)?.label ?? layoutKey}</span> }
export function AdminCVTemplateStatusBadge({ active }: { active: boolean }) { const style = active ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-red-50 text-red-800 ring-red-200'; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style}`}>{active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span> }
export function AdminCVTemplateFeaturedBadge({ featured }: { featured: boolean }) { return featured ? <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-200">Nổi bật</span> : null }
