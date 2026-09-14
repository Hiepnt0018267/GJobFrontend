import type {
  CVCertificateItem,
  CVEducationItem,
  CVExperienceItem,
  CVLanguageItem,
  CVLanguageProficiency,
  CVPersonalInfo,
  CVProjectItem,
  CVSkillItem,
  CVStructuredData,
} from '../../../types/cv'

export type ReviewRow<T> = { key: string; value: T }
export type ReviewLanguageItem = Omit<CVLanguageItem, 'proficiency'> & { proficiency?: string | null }

export type CVReviewDraft = {
  personal_info: CVPersonalInfo
  career_objective: string
  educations: ReviewRow<CVEducationItem>[]
  experiences: ReviewRow<CVExperienceItem>[]
  skills: ReviewRow<CVSkillItem>[]
  projects: ReviewRow<CVProjectItem>[]
  certificates: ReviewRow<CVCertificateItem>[]
  languages: ReviewRow<ReviewLanguageItem>[]
}

let fallbackKey = 0
const clientKey = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto
  ? crypto.randomUUID()
  : `cv-review-${fallbackKey += 1}`

const rows = <T,>(items: T[]): ReviewRow<T>[] => items.map((value) => ({ key: clientKey(), value: { ...value } }))
const optional = (value: string | null | undefined): string | null => value?.trim() || null

const languageAliases: Record<string, CVLanguageProficiency> = {
  basic: 'BASIC', 'cơ bản': 'BASIC',
  conversational: 'CONVERSATIONAL', 'giao tiếp': 'CONVERSATIONAL',
  professional: 'PROFESSIONAL', 'chuyên nghiệp': 'PROFESSIONAL',
  fluent: 'FLUENT', 'thành thạo': 'FLUENT',
  native: 'NATIVE', 'bản ngữ': 'NATIVE',
}
const languageLabels: Record<CVLanguageProficiency, string> = {
  BASIC: 'Cơ bản', CONVERSATIONAL: 'Giao tiếp', PROFESSIONAL: 'Chuyên nghiệp', FLUENT: 'Thành thạo', NATIVE: 'Bản ngữ',
}

export function createCVReviewDraft(result: CVStructuredData): CVReviewDraft {
  return {
    personal_info: { ...result.personal_info },
    career_objective: result.career_objective ?? '',
    educations: rows(result.educations),
    experiences: rows(result.experiences),
    skills: rows(result.skills),
    projects: rows(result.projects.map((item) => ({ ...item, technologies: [...item.technologies] }))),
    certificates: rows(result.certificates),
    languages: rows(result.languages.map((item) => ({ ...item, proficiency: item.proficiency ? languageLabels[item.proficiency] : null }))),
  }
}

export function toCVStructuredData(draft: CVReviewDraft): CVStructuredData {
  const info = draft.personal_info
  return {
    personal_info: {
      full_name: optional(info.full_name),
      email: optional(info.email),
      phone: optional(info.phone),
      address: optional(info.address),
      avatar_url: optional(info.avatar_url),
      date_of_birth: optional(info.date_of_birth),
      linkedin_url: optional(info.linkedin_url),
      github_url: optional(info.github_url),
      portfolio_url: optional(info.portfolio_url),
    },
    career_objective: optional(draft.career_objective),
    educations: draft.educations.map(({ value }) => ({
      ...value,
      school_name: value.school_name.trim(),
      degree: optional(value.degree),
      field_of_study: optional(value.field_of_study),
      start_date: optional(value.start_date),
      end_date: value.is_current ? null : optional(value.end_date),
      description: optional(value.description),
    })),
    experiences: draft.experiences.map(({ value }) => ({
      ...value,
      company_name: value.company_name.trim(),
      position: value.position.trim(),
      start_date: optional(value.start_date),
      end_date: value.is_current ? null : optional(value.end_date),
      description: optional(value.description),
    })),
    skills: draft.skills.map(({ value }) => ({ ...value, name: value.name.trim() })),
    projects: draft.projects.map(({ value }) => ({
      ...value,
      name: value.name.trim(),
      role: optional(value.role),
      start_date: optional(value.start_date),
      end_date: optional(value.end_date),
      description: optional(value.description),
      technologies: value.technologies.map((item) => item.trim()).filter(Boolean),
      project_url: optional(value.project_url),
    })),
    certificates: draft.certificates.map(({ value }) => ({
      ...value,
      name: value.name.trim(),
      organization: optional(value.organization),
      issue_date: optional(value.issue_date),
      expiration_date: optional(value.expiration_date),
      credential_url: optional(value.credential_url),
    })),
    languages: draft.languages.map(({ value }) => {
      const normalized = value.proficiency?.trim().toLowerCase() ?? ''
      return { name: value.name.trim(), proficiency: normalized ? languageAliases[normalized] ?? null : null }
    }),
  }
}

export function newReviewRow<T>(value: T): ReviewRow<T> {
  return { key: clientKey(), value }
}
