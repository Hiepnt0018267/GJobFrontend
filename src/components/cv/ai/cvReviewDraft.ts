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
import { isCVDateEditorValueValid, normalizeCVDateForPayload } from '../../../utils/cvDate'

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
const optionalText = (value: string | null | undefined): string | null => value?.trim() || null

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
      full_name: optionalText(info.full_name),
      email: optionalText(info.email),
      phone: optionalText(info.phone),
      address: optionalText(info.address),
      avatar_url: optionalText(info.avatar_url),
      date_of_birth: optionalText(info.date_of_birth),
      linkedin_url: optionalText(info.linkedin_url),
      github_url: optionalText(info.github_url),
      portfolio_url: optionalText(info.portfolio_url),
    },
    career_objective: optionalText(draft.career_objective),
    educations: draft.educations.map(({ value }) => ({
      ...value,
      school_name: value.school_name.trim(),
      degree: optionalText(value.degree),
      field_of_study: optionalText(value.field_of_study),
      start_date: normalizeCVDateForPayload(value.start_date, { path: 'educations.start_date' }),
      end_date: value.is_current ? { state: 'current' } : normalizeCVDateForPayload(value.end_date, { allowCurrent: true, path: 'educations.end_date' }),
      description: optionalText(value.description),
    })),
    experiences: draft.experiences.map(({ value }) => ({
      ...value,
      company_name: value.company_name.trim(),
      position: value.position.trim(),
      start_date: normalizeCVDateForPayload(value.start_date, { path: 'experiences.start_date' }),
      end_date: value.is_current ? { state: 'current' } : normalizeCVDateForPayload(value.end_date, { allowCurrent: true, path: 'experiences.end_date' }),
      description: optionalText(value.description),
    })),
    skills: draft.skills.map(({ value }) => ({ ...value, name: value.name.trim() })),
    projects: draft.projects.map(({ value }) => ({
      ...value,
      name: value.name.trim(),
      role: optionalText(value.role),
      start_date: normalizeCVDateForPayload(value.start_date, { path: 'projects.start_date' }),
      end_date: normalizeCVDateForPayload(value.end_date, { allowCurrent: true, path: 'projects.end_date' }),
      description: optionalText(value.description),
      technologies: value.technologies.map((item) => item.trim()).filter(Boolean),
      project_url: optionalText(value.project_url),
    })),
    certificates: draft.certificates.map(({ value }) => ({
      ...value,
      name: value.name.trim(),
      organization: optionalText(value.organization),
      issue_date: normalizeCVDateForPayload(value.issue_date, { path: 'certificates.issue_date' }),
      expiration_date: normalizeCVDateForPayload(value.expiration_date, { allowCurrent: true, path: 'certificates.expiration_date' }),
      credential_url: optionalText(value.credential_url),
    })),
    languages: draft.languages.map(({ value }) => {
      const normalized = value.proficiency?.trim().toLowerCase() ?? ''
      return { name: value.name.trim(), proficiency: normalized ? languageAliases[normalized] ?? null : null }
    }),
  }
}

export function cvReviewDateErrors(draft: CVReviewDraft): string[] {
  const errors: string[] = []
  const check = (path: string, value: Parameters<typeof isCVDateEditorValueValid>[0], allowCurrent = false) => {
    if (!isCVDateEditorValueValid(value, allowCurrent)) errors.push(path)
  }
  draft.educations.forEach(({ value }, index) => {
    check(`educations.${index}.start_date`, value.start_date)
    check(`educations.${index}.end_date`, value.is_current ? { state: 'current' } : value.end_date, true)
  })
  draft.experiences.forEach(({ value }, index) => {
    check(`experiences.${index}.start_date`, value.start_date)
    check(`experiences.${index}.end_date`, value.is_current ? { state: 'current' } : value.end_date, true)
  })
  draft.projects.forEach(({ value }, index) => {
    check(`projects.${index}.start_date`, value.start_date)
    check(`projects.${index}.end_date`, value.end_date, true)
  })
  draft.certificates.forEach(({ value }, index) => {
    check(`certificates.${index}.issue_date`, value.issue_date)
    check(`certificates.${index}.expiration_date`, value.expiration_date, true)
  })
  return errors
}

export function newReviewRow<T>(value: T): ReviewRow<T> {
  return { key: clientKey(), value }
}
