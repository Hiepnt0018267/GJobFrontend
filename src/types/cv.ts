export type CVSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
export type CVLanguageProficiency = 'BASIC' | 'CONVERSATIONAL' | 'PROFESSIONAL' | 'FLUENT' | 'NATIVE'
export type CVTemplateLayoutKey = 'MODERN' | 'CLASSIC' | 'MINIMAL'
export type CVFontFamily = 'INTER' | 'ARIAL' | 'TIMES_NEW_ROMAN'
export type CVFontScale = 'SMALL' | 'NORMAL' | 'LARGE'
export type CVSectionSpacing = 'COMPACT' | 'NORMAL' | 'RELAXED'
export type CVHeadingStyle = 'SOLID' | 'UNDERLINE' | 'MINIMAL'

export interface CVTemplateThemeConfig {
  primary_color: string
  font_family: CVFontFamily
  font_scale: CVFontScale
  section_spacing: CVSectionSpacing
  heading_style: CVHeadingStyle
}

export interface CVTemplateSummary {
  id: string
  name: string
  layout_key: CVTemplateLayoutKey
  theme_config?: Partial<CVTemplateThemeConfig> | null
  is_featured: boolean
  sort_order: number
}

export interface CVTemplate extends CVTemplateSummary {
  description: string | null
  thumbnail_url: string | null
}

export interface CVTemplateCatalogResponse {
  items: CVTemplate[]
}

export interface CVPersonalInfo {
  full_name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  avatar_url?: string | null
  date_of_birth?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
}

export interface CVEducationItem {
  school_name: string
  degree?: string | null
  field_of_study?: string | null
  start_date?: string | null
  end_date?: string | null
  is_current: boolean
  description?: string | null
}

export interface CVExperienceItem {
  company_name: string
  position: string
  start_date?: string | null
  end_date?: string | null
  is_current: boolean
  description?: string | null
}

export interface CVSkillItem {
  name: string
  level?: CVSkillLevel | null
}

export interface CVProjectItem {
  name: string
  role?: string | null
  start_date?: string | null
  end_date?: string | null
  description?: string | null
  technologies: string[]
  project_url?: string | null
}

export interface CVCertificateItem {
  name: string
  organization?: string | null
  issue_date?: string | null
  expiration_date?: string | null
  credential_url?: string | null
}

export interface CVLanguageItem {
  name: string
  proficiency?: CVLanguageProficiency | null
}

export interface CVListItem {
  id: string
  title: string
  is_default: boolean
  template_id: string
  template: CVTemplateSummary
  created_at: string
  updated_at: string
}

export interface CV extends CVListItem {
  personal_info: CVPersonalInfo
  career_objective?: string | null
  educations: CVEducationItem[]
  experiences: CVExperienceItem[]
  skills: CVSkillItem[]
  projects: CVProjectItem[]
  certificates: CVCertificateItem[]
  languages: CVLanguageItem[]
}

export interface CVListResponse {
  items: CVListItem[]
  total: number
}

export interface CVCreateRequest {
  title: string
  template_id: string
  personal_info: CVPersonalInfo
  career_objective?: string | null
  educations: CVEducationItem[]
  experiences: CVExperienceItem[]
  skills: CVSkillItem[]
  projects: CVProjectItem[]
  certificates: CVCertificateItem[]
  languages: CVLanguageItem[]
}

export type CVUpdateRequest = Partial<CVCreateRequest>

export const emptyCV = (templateId: string, personal_info: CVPersonalInfo = {}): CVCreateRequest => ({
  title: '',
  template_id: templateId,
  personal_info,
  career_objective: '',
  educations: [],
  experiences: [],
  skills: [],
  projects: [],
  certificates: [],
  languages: [],
})

export const cvToEditableData = (cv: CV): CVCreateRequest => ({
  title: cv.title,
  template_id: cv.template_id,
  personal_info: cv.personal_info,
  career_objective: cv.career_objective,
  educations: cv.educations,
  experiences: cv.experiences,
  skills: cv.skills,
  projects: cv.projects,
  certificates: cv.certificates,
  languages: cv.languages,
})
