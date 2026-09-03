import type { ReactNode } from 'react'
import type { CVCreateRequest, CVTemplateLayoutKey, CVTemplateThemeConfig } from '../../types/cv'
import { getCVTemplateRenderer } from './cvTemplateRegistry'
import { resolveCVTheme } from './cvTheme'
import type { CVTemplateMode } from './templates/types'

export type CVTemplateRenderable = {
  layout_key: CVTemplateLayoutKey
  theme_config?: Partial<CVTemplateThemeConfig> | null
}

type Props = { cv: CVCreateRequest; template: CVTemplateRenderable; mode?: CVTemplateMode; className?: string; children?: ReactNode }

export default function CVTemplateRenderer({ cv, template, mode = 'view', className, children }: Props) {
  const renderTemplate = getCVTemplateRenderer(template.layout_key)
  if (!renderTemplate) return <div role="alert" className={`rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 ${className ?? ''}`}>Mẫu CV này chưa được phiên bản GJob hiện tại hỗ trợ hiển thị.</div>
  const theme = resolveCVTheme(template.layout_key, template.theme_config)
  return <>{renderTemplate({ data: cv, mode, theme, className, children })}</>
}
