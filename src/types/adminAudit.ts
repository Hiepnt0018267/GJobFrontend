import type { ApplicationStatus } from './application'
import type {
  CVCertificateItem,
  CVEducationItem,
  CVExperienceItem,
  CVLanguageItem,
  CVPersonalInfo,
  CVProjectItem,
  CVSkillItem,
  CVTemplateLayoutKey,
  CVTemplateThemeConfig,
} from './cv'
import type { JobStatus } from './job'

export type AdminAuditCandidate = {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
}

export type AdminAuditCVTemplate = {
  id: string
  name: string
  layout_key: CVTemplateLayoutKey
  is_active: boolean
  theme_config: CVTemplateThemeConfig
}

export type AdminAuditCVListItem = {
  id: string
  title: string
  is_default: boolean
  candidate_id: string
  template_id: string
  candidate: AdminAuditCandidate
  template: AdminAuditCVTemplate
  created_at: string
  updated_at: string
}

export type AdminAuditCVDetail = AdminAuditCVListItem & {
  personal_info: CVPersonalInfo
  career_objective: string | null
  educations: CVEducationItem[]
  experiences: CVExperienceItem[]
  skills: CVSkillItem[]
  projects: CVProjectItem[]
  certificates: CVCertificateItem[]
  languages: CVLanguageItem[]
}

export type AdminAuditCVListResponse = {
  items: AdminAuditCVListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type AdminAuditCVListParams = {
  search?: string
  template_id?: string
  candidate_id?: string
  is_default?: boolean
  page?: number
  page_size?: number
}

export type AdminAuditApplicationJob = {
  id: string
  title: string
  company_name: string
  status: JobStatus
}

export type AdminAuditApplicationCV = {
  id: string
  title: string
  template: AdminAuditCVTemplate
}

export type AdminAuditApplicationListItem = {
  id: string
  status: ApplicationStatus
  candidate_id: string
  job_id: string
  cv_id: string
  candidate: AdminAuditCandidate
  job: AdminAuditApplicationJob
  cv: AdminAuditApplicationCV
  created_at: string
  updated_at: string
}

export type AdminAuditApplicationDetail = Omit<AdminAuditApplicationListItem, 'cv'> & {
  cv: AdminAuditCVDetail
}

export type AdminAuditApplicationListResponse = {
  items: AdminAuditApplicationListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type AdminAuditApplicationListParams = {
  search?: string
  status?: ApplicationStatus
  job_id?: string
  candidate_id?: string
  page?: number
  page_size?: number
}
