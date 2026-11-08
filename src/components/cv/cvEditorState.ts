import type { CVCandidatePresentationOverrides, CVCreateRequest, CVPresentation, CVPresentationLocale, CVPresentationUpdateRequest, CVSectionVisibility, CVTemplateSummary, CVTemplateThemeConfig } from '../../types/cv'

export type CVEditorTool = 'CONTENT' | 'DESIGN' | 'ADD_SECTION' | 'LAYOUT' | 'TEMPLATE' | 'LIBRARY'
export type CVEditorContentSection = keyof CVSectionVisibility | 'personal'
export type CVEditorZoomMode = 'MANUAL' | 'FIT'
export type CVEditorSaveState = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'
export type CVEditorSaveRoute = 'none' | 'content' | 'presentation' | 'combined'
export type CVEditorSectionState = 'VISIBLE_WITH_DATA' | 'HIDDEN_WITH_DATA' | 'VISIBLE_EMPTY' | 'EMPTY'

export type CVEditorPresentationDraft = {
  templateId: string
  locale: CVPresentationLocale
  templateConfigSnapshot: Partial<CVTemplateThemeConfig> | null
  candidateOverrides: CVCandidatePresentationOverrides
}

export const CV_EDITOR_SECTIONS: Array<{ key: keyof CVSectionVisibility; label: string }> = [
  { key: 'summary', label: 'Mục tiêu nghề nghiệp' },
  { key: 'experience', label: 'Kinh nghiệm' },
  { key: 'education', label: 'Học vấn' },
  { key: 'skills', label: 'Kỹ năng' },
  { key: 'projects', label: 'Dự án' },
  { key: 'certificates', label: 'Chứng chỉ' },
  { key: 'languages', label: 'Ngôn ngữ' },
]

function contentValue(value: CVCreateRequest) {
  const { template_id: _templateId, ...content } = value
  void _templateId
  return content
}

export function deriveEditorDirtyState(
  initialContent: CVCreateRequest,
  contentDraft: CVCreateRequest,
  initialPresentation: CVEditorPresentationDraft,
  presentationDraft: CVEditorPresentationDraft,
) {
  const contentDirty = JSON.stringify(contentValue(initialContent)) !== JSON.stringify(contentValue(contentDraft))
  const presentationDirty = JSON.stringify(initialPresentation) !== JSON.stringify(presentationDraft)
  return { contentDirty, presentationDirty, hasUnsavedChanges: contentDirty || presentationDirty }
}

export function deriveSaveRoute({ contentDirty, presentationDirty }: { contentDirty: boolean; presentationDirty: boolean }): CVEditorSaveRoute {
  if (contentDirty && presentationDirty) return 'combined'
  if (contentDirty) return 'content'
  if (presentationDirty) return 'presentation'
  return 'none'
}

export function canSave({ hasUnsavedChanges, saveState, valid = true }: { hasUnsavedChanges: boolean; saveState: CVEditorSaveState; valid?: boolean }) {
  return hasUnsavedChanges && saveState !== 'SAVING' && valid
}

export function getSaveStatus(saveState: CVEditorSaveState, hasUnsavedChanges: boolean) {
  if (saveState === 'SAVING') return 'Đang lưu...'
  if (saveState === 'ERROR') return 'Lưu thất bại'
  if (hasUnsavedChanges) return 'Có thay đổi chưa lưu'
  return 'Đã lưu'
}

export function computeFitZoom({ viewportWidth, documentWidth = 794, horizontalPadding = 48, minZoom = 50, maxZoom = 150 }: { viewportWidth: number; documentWidth?: number; horizontalPadding?: number; minZoom?: number; maxZoom?: number }) {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0 || documentWidth <= 0) return minZoom
  const raw = ((viewportWidth - horizontalPadding) / documentWidth) * 100
  return Math.round(Math.min(maxZoom, Math.max(minZoom, raw)))
}

export function getInitialZoomState(isNewCV: boolean): { zoomMode: CVEditorZoomMode; zoomPercent: number } {
  return { zoomMode: isNewCV ? 'MANUAL' : 'FIT', zoomPercent: 100 }
}

export function applyTemplateSwitch({ current, nextTemplate, initial }: { current: CVEditorPresentationDraft; nextTemplate: CVTemplateSummary; initial: CVEditorPresentationDraft }): CVEditorPresentationDraft {
  return {
    templateId: nextTemplate.id,
    locale: current.locale,
    templateConfigSnapshot: nextTemplate.id === initial.templateId ? initial.templateConfigSnapshot : nextTemplate.theme_config ?? null,
    candidateOverrides: {
      ...(current.candidateOverrides.section_visibility ? { section_visibility: { ...current.candidateOverrides.section_visibility } } : {}),
      ...(current.candidateOverrides.text_formatting ? { text_formatting: current.candidateOverrides.text_formatting } : {}),
    },
  }
}

export function buildExistingCVPresentationPatch(current: CVPresentation, draft: CVEditorPresentationDraft): CVPresentationUpdateRequest {
  const patch: CVPresentationUpdateRequest = {}
  if (draft.templateId !== current.template_id) patch.template_id = draft.templateId
  if (draft.locale !== current.locale) patch.locale = draft.locale

  const resetOverrides = Object.keys(current.candidate_overrides).length > 0
    && Object.keys(draft.candidateOverrides).length === 0
    && draft.templateId === current.template_id
  if (resetOverrides) patch.reset_overrides = true
  else {
    const keys = ['primary_color', 'secondary_color', 'font_family', 'font_scale', 'section_spacing', 'line_spacing', 'heading_style', 'section_visibility', 'text_formatting'] as const
    for (const key of keys) {
      const before = current.candidate_overrides[key]
      const after = draft.candidateOverrides[key]
      if (JSON.stringify(before) !== JSON.stringify(after)) Object.assign(patch, { [key]: after ?? null })
    }
  }
  return patch
}

export function buildNewCVPresentationPatch(createdLocale: CVPresentationLocale, draft: CVEditorPresentationDraft): CVPresentationUpdateRequest {
  return {
    ...draft.candidateOverrides,
    ...(draft.locale !== createdLocale ? { locale: draft.locale } : {}),
  }
}

export function deriveSectionState(hasData: boolean, visible: boolean): CVEditorSectionState {
  if (hasData && visible) return 'VISIBLE_WITH_DATA'
  if (hasData) return 'HIDDEN_WITH_DATA'
  if (visible) return 'VISIBLE_EMPTY'
  return 'EMPTY'
}

export function sectionHasData(data: CVCreateRequest, section: keyof CVSectionVisibility) {
  if (section === 'summary') return Boolean(data.career_objective?.trim())
  const map = {
    experience: data.experiences,
    education: data.educations,
    skills: data.skills,
    projects: data.projects,
    certificates: data.certificates,
    languages: data.languages,
  }
  return map[section].length > 0
}
