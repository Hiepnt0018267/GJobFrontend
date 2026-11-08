import type { CVCandidatePresentationOverrides, CVCreateRequest, CVFieldTextFormatting, CVPresentationLocale, CVSectionVisibility, CVTemplateThemeConfig } from '../../../types/cv'
import type { ResolvedCVTheme } from '../cvTheme'

export type CVRendererMode = 'preview' | 'editor-preview' | 'print'

export type CVRenderPresentation = {
  locale?: CVPresentationLocale
  templateConfigSnapshot?: Partial<CVTemplateThemeConfig> | null
  candidateOverrides?: CVCandidatePresentationOverrides | null
}

export type CVResolvedRenderPresentation = { locale: CVPresentationLocale; sectionVisibility: Partial<CVSectionVisibility> }

export type CVSectionKey = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certificates' | 'languages'

export type CVInlineEditorBindings = {
  onTextFormattingChange: (fieldId: string, formatting?: CVFieldTextFormatting) => void
  onChoosePhoto: () => void
  onTitleChange: (value: string) => void
  onPersonalInfoChange: (changes: Partial<CVCreateRequest['personal_info']>) => void
  onCareerObjectiveChange: (value: string) => void
  onEducationChange: (index: number, changes: Partial<CVCreateRequest['educations'][number]>) => void
  onAddEducation: () => void
  onDeleteEducation: (index: number) => void
  onExperienceChange: (index: number, changes: Partial<CVCreateRequest['experiences'][number]>) => void
  onAddExperience: () => void
  onDeleteExperience: (index: number) => void
  onSkillChange: (index: number, changes: Partial<CVCreateRequest['skills'][number]>) => void
  onAddSkill: () => void
  onDeleteSkill: (index: number) => void
  onProjectChange: (index: number, changes: Partial<CVCreateRequest['projects'][number]>) => void
  onAddProject: () => void
  onDeleteProject: (index: number) => void
  onCertificateChange: (index: number, changes: Partial<CVCreateRequest['certificates'][number]>) => void
  onAddCertificate: () => void
  onDeleteCertificate: (index: number) => void
  onLanguageChange: (index: number, changes: Partial<CVCreateRequest['languages'][number]>) => void
  onAddLanguage: () => void
  onDeleteLanguage: (index: number) => void
  onMoveExperienceUp?: (index: number) => void
  onMoveExperienceDown?: (index: number) => void
  onReorderExperiences?: (fromIndex: number, toIndex: number) => void
  onMoveEducationUp?: (index: number) => void
  onMoveEducationDown?: (index: number) => void
  onReorderEducations?: (fromIndex: number, toIndex: number) => void
  onMoveSkillUp?: (index: number) => void
  onMoveSkillDown?: (index: number) => void
  onReorderSkills?: (fromIndex: number, toIndex: number) => void
  onMoveProjectUp?: (index: number) => void
  onMoveProjectDown?: (index: number) => void
  onReorderProjects?: (fromIndex: number, toIndex: number) => void
  onMoveCertificateUp?: (index: number) => void
  onMoveCertificateDown?: (index: number) => void
  onReorderCertificates?: (fromIndex: number, toIndex: number) => void
  onMoveLanguageUp?: (index: number) => void
  onMoveLanguageDown?: (index: number) => void
  onReorderLanguages?: (fromIndex: number, toIndex: number) => void
  sectionOrder?: CVSectionKey[]
  onMoveSectionUp?: (key: CVSectionKey) => void
  onMoveSectionDown?: (key: CVSectionKey) => void
  onRemoveSection?: (key: CVSectionKey) => void
  onReorderSections?: (draggedKey: CVSectionKey, targetKey: CVSectionKey) => void
}

export type CVTemplateComponentProps = {
  cv: CVCreateRequest
  presentation: CVResolvedRenderPresentation
  mode: CVRendererMode
  theme: ResolvedCVTheme
  className?: string
  photoUrl?: string | null
  editor?: CVInlineEditorBindings
}
