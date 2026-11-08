import type { CVCreateRequest, CVTemplateLayoutKey, CVTemplateThemeConfig } from '../../types/cv'
import { getCVTemplateRenderer } from './cvTemplateRegistry'
import { normalizeCVLocale } from './cvLocale'
import { resolveCVPresentation } from './cvTheme'
import type { CVInlineEditorBindings, CVRendererMode, CVRenderPresentation } from './templates/types'
import CVTextFormattingProvider from './CVTextFormattingProvider'

export type CVTemplateRenderable = {
  layout_key: CVTemplateLayoutKey
  theme_config?: Partial<CVTemplateThemeConfig> | null
}

type Props = { cv: CVCreateRequest; template: CVTemplateRenderable; presentation?: CVRenderPresentation; mode?: CVRendererMode; className?: string; photoUrl?: string | null; editor?: CVInlineEditorBindings }

export default function CVTemplateRenderer({ cv, template, presentation = {}, mode = 'preview', className, photoUrl, editor }: Props) {
  const renderTemplate = getCVTemplateRenderer(template.layout_key)
  if (!renderTemplate) return <div role="alert" className={`rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 ${className ?? ''}`}>Mẫu CV này chưa được phiên bản GJob hiện tại hỗ trợ hiển thị.</div>
  const templateConfig = presentation.templateConfigSnapshot ?? template.theme_config
  const theme = resolveCVPresentation(template.layout_key, templateConfig, presentation.candidateOverrides)
  return <CVTextFormattingProvider formatting={presentation.candidateOverrides?.text_formatting} editable={mode === 'editor-preview' && Boolean(editor)} updateField={editor?.onTextFormattingChange}>{renderTemplate({ cv, presentation: { locale: normalizeCVLocale(presentation.locale), sectionVisibility: theme.sectionVisibility }, mode, theme, className, photoUrl, editor })}</CVTextFormattingProvider>
}
