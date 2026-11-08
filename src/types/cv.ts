export type CVSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
export type CVLanguageProficiency = 'BASIC' | 'CONVERSATIONAL' | 'PROFESSIONAL' | 'FLUENT' | 'NATIVE'
import { CV_TEMPLATE_LAYOUT_KEYS } from '../contracts/cvRendererKeys'

export { CV_TEMPLATE_LAYOUT_KEYS }
export type CVTemplateLayoutKey = typeof CV_TEMPLATE_LAYOUT_KEYS[number]
export type CVFontFamily = 'INTER' | 'ROBOTO' | 'ARIAL' | 'TIMES_NEW_ROMAN'
export type CVFontScale = 'SMALL' | 'NORMAL' | 'LARGE'
export type CVSectionSpacing = 'COMPACT' | 'NORMAL' | 'RELAXED'
export type CVLineSpacing = 'COMPACT' | 'NORMAL' | 'RELAXED'
export type CVHeadingStyle = 'SOLID' | 'UNDERLINE' | 'MINIMAL'
export type CVSourceType = 'BUILDER' | 'UPLOADED'
export type CVExtractionStatus = 'PROCESSING' | 'SUCCEEDED' | 'FAILED'
export type CVPresentationLocale = 'vi' | 'en'
export type CVTemplateExperienceLevel = 'STUDENT' | 'FRESHER' | 'JUNIOR' | 'EXPERIENCED'
export const CV_TEMPLATE_STYLES = ['SIMPLE', 'PROFESSIONAL', 'IMPRESSIVE'] as const
export type CVTemplateStyle = typeof CV_TEMPLATE_STYLES[number]
export type CVATSStatus = 'UNREVIEWED' | 'ATS_FRIENDLY' | 'ATS_CAUTION' | 'NOT_ATS_FRIENDLY'
export type CVRecommendationPriority = 'ATS_FIRST' | 'BALANCED' | 'DESIGN_FIRST'
export type CVContentDensity = 'SHORT' | 'NORMAL' | 'LONG'

export type CVPartialDatePrecision = 'year' | 'month' | 'day' | 'ambiguous'
export interface CVPartialDate { year: number; month?: number | null; day?: number | null; precision: CVPartialDatePrecision }
export interface CVOpenEndedDate { state: 'current' }
export type CVDateValue = string | CVPartialDate | CVOpenEndedDate

export interface CVTemplateThemeConfig { primary_color: string; secondary_color: string; font_family: CVFontFamily; font_scale: CVFontScale; section_spacing: CVSectionSpacing; line_spacing: CVLineSpacing; heading_style: CVHeadingStyle; default_section_visibility: CVSectionVisibility }
export interface CVTemplateTaxonomyItem { code: string; display_name: string }
export interface CVTemplateIndustry extends CVTemplateTaxonomyItem { positions: CVTemplateTaxonomyItem[] }
export interface CVTemplateTaxonomy { industries: CVTemplateIndustry[]; experience_levels: CVTemplateExperienceLevel[]; styles: CVTemplateStyle[] }
export interface CVTemplateSummary { id: string; code?: string; name: string; layout_key: CVTemplateLayoutKey; theme_config?: Partial<CVTemplateThemeConfig> | null; is_featured: boolean; sort_order: number; ats_status: CVATSStatus; qualification_version: string }
export interface CVTemplate extends CVTemplateSummary { code: string; description: string | null; thumbnail_url: string | null; industries: CVTemplateTaxonomyItem[]; job_positions: CVTemplateTaxonomyItem[]; experience_levels: CVTemplateExperienceLevel[]; styles: CVTemplateStyle[] }
export interface CVTemplateCatalogResponse { items: CVTemplate[] }
export interface CVTemplateRecommendationRequest {
  cv_id?: string
  preference: { target_position?: string; industry?: string; preferred_style?: CVTemplateStyle; recommendation_priority: CVRecommendationPriority }
  cv_context: { experience_level?: CVTemplateExperienceLevel; locale: CVPresentationLocale; current_template_id?: string; experience_count: number; project_count: number; skill_count: number; content_density: CVContentDensity }
}
export interface CVTemplateRecommendationItem { template_id: string; name: string; thumbnail_url: string | null; styles: CVTemplateStyle[]; ats_status: CVATSStatus; qualification_version: string; rank: number; reason: string; strengths: string[]; is_current: boolean }
export interface CVTemplateRecommendationResponse { recommendations: CVTemplateRecommendationItem[]; fallback_used: boolean; qualification_version: string }
export interface CVSectionVisibility { summary: boolean; experience: boolean; education: boolean; skills: boolean; projects: boolean; certificates: boolean; languages: boolean }
export interface CVTextMarks { bold?: boolean; italic?: boolean; underline?: boolean; font_family?: CVFontFamily; font_size?: number; color?: string }
export interface CVTextSpan { text: string; marks: CVTextMarks }
export interface CVFieldTextFormatting { spans: CVTextSpan[] }
export interface CVTextFormatting { version: 1; fields: Record<string, CVFieldTextFormatting> }
export interface CVCandidatePresentationOverrides { primary_color?: string; secondary_color?: string; font_family?: CVFontFamily; font_scale?: CVFontScale; section_spacing?: CVSectionSpacing; line_spacing?: CVLineSpacing; heading_style?: CVHeadingStyle; section_visibility?: Partial<CVSectionVisibility>; text_formatting?: CVTextFormatting }
export interface CVPresentation { template_id: string; template: CVTemplateSummary; locale: CVPresentationLocale; template_config_snapshot: CVTemplateThemeConfig; candidate_overrides: CVCandidatePresentationOverrides; presentation_version: number; created_at: string; updated_at: string }
export interface CVPersonalInfo { full_name?: string | null; email?: string | null; phone?: string | null; address?: string | null; avatar_url?: string | null; date_of_birth?: string | null; linkedin_url?: string | null; github_url?: string | null; portfolio_url?: string | null }
export interface CVEducationItem { school_name: string; degree?: string | null; field_of_study?: string | null; start_date?: CVDateValue | null; end_date?: CVDateValue | null; is_current: boolean; description?: string | null }
export interface CVExperienceItem { company_name: string; position: string; start_date?: CVDateValue | null; end_date?: CVDateValue | null; is_current: boolean; description?: string | null }
export interface CVSkillItem { name: string; level?: CVSkillLevel | null }
export interface CVProjectItem { name: string; role?: string | null; start_date?: CVDateValue | null; end_date?: CVDateValue | null; description?: string | null; technologies: string[]; project_url?: string | null }
export interface CVCertificateItem { name: string; organization?: string | null; issue_date?: CVDateValue | null; expiration_date?: CVDateValue | null; credential_url?: string | null }
export interface CVLanguageItem { name: string; proficiency?: CVLanguageProficiency | null }

type CVBase = { id: string; title: string; is_default: boolean; has_managed_photo: boolean; content_version: number; created_at: string; updated_at: string; extraction_status?: CVExtractionStatus | null; extraction_error_code?: string | null; is_matchable?: boolean | null; is_verified?: boolean | null }
export type BuilderCVListItem = CVBase & { source_type: 'BUILDER'; template_id: string; template: CVTemplateSummary; presentation: CVPresentation; original_filename: null; mime_type: null; file_size: null; uploaded_at: null }
export type UploadedCVListItem = CVBase & { source_type: 'UPLOADED'; template_id: null; template: null; presentation: null; original_filename: string; mime_type: string; file_size: number; uploaded_at: string }
export type CVListItem = BuilderCVListItem | UploadedCVListItem
export type CVStructuredData = { personal_info: CVPersonalInfo; career_objective?: string | null; educations: CVEducationItem[]; experiences: CVExperienceItem[]; skills: CVSkillItem[]; projects: CVProjectItem[]; certificates: CVCertificateItem[]; languages: CVLanguageItem[] }
type CVSections = CVStructuredData
export type BuilderCV = BuilderCVListItem & CVSections
export type UploadedCV = UploadedCVListItem & CVSections
export type CV = BuilderCV | UploadedCV
export interface CVListResponse { items: CVListItem[]; total: number }
export interface CVCreateRequest { title: string; template_id: string; personal_info: CVPersonalInfo; career_objective?: string | null; educations: CVEducationItem[]; experiences: CVExperienceItem[]; skills: CVSkillItem[]; projects: CVProjectItem[]; certificates: CVCertificateItem[]; languages: CVLanguageItem[] }
export type CVContentUpdateRequest = Partial<Omit<CVCreateRequest, 'template_id'>>
export type CVPresentationUpdateRequest = { template_id?: string; locale?: CVPresentationLocale; primary_color?: string | null; secondary_color?: string | null; font_family?: CVFontFamily | null; font_scale?: CVFontScale | null; section_spacing?: CVSectionSpacing | null; line_spacing?: CVLineSpacing | null; heading_style?: CVHeadingStyle | null; section_visibility?: Partial<CVSectionVisibility> | null; text_formatting?: CVTextFormatting | null; reset_overrides?: boolean }
export type CVUpdateRequest = CVContentUpdateRequest & CVPresentationUpdateRequest

export interface CVExtraction {
  id: string
  cv_id: string
  status: CVExtractionStatus
  provider: string
  model: string
  result: CVStructuredData | null
  error_code: string | null
  failure_reason: string | null
  started_at: string
  completed_at: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}
export interface CVExtractionConfirmationResponse {
  cv_id: string
  extraction_id: string
  confirmed_at: string
  cv: CV
}

export function isBuilderCV(cv: CVListItem): cv is BuilderCVListItem
export function isBuilderCV(cv: CV): cv is BuilderCV
export function isBuilderCV(cv: CVListItem | CV): boolean { return cv.source_type === 'BUILDER' }
export function isUploadedCV(cv: CVListItem): cv is UploadedCVListItem
export function isUploadedCV(cv: CV): cv is UploadedCV
export function isUploadedCV(cv: CVListItem | CV): boolean { return cv.source_type === 'UPLOADED' }
export const cvSourceLabel = (cv: CVListItem | CV): string => isUploadedCV(cv) ? 'CV tải lên' : 'CV GJob'
export const cvFileTypeLabel = (mimeType: string | null): string => mimeType === 'application/pdf' ? 'PDF' : mimeType?.includes('wordprocessingml') ? 'DOCX' : 'Tệp CV'
export const formatFileSize = (bytes: number | null): string => { if (bytes === null || !Number.isFinite(bytes)) return 'Chưa rõ dung lượng'; if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB` }
export const emptyCV = (templateId: string, personal_info: CVPersonalInfo = {}): CVCreateRequest => ({ title: '', template_id: templateId, personal_info, career_objective: '', educations: [], experiences: [], skills: [], projects: [], certificates: [], languages: [] })
export const cvToEditableData = (cv: BuilderCV): CVCreateRequest => ({ title: cv.title, template_id: cv.template_id, personal_info: cv.personal_info, career_objective: cv.career_objective, educations: cv.educations, experiences: cv.experiences, skills: cv.skills, projects: cv.projects, certificates: cv.certificates, languages: cv.languages })
