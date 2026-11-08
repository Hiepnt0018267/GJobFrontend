import type { CVDateValue, CVLanguageProficiency, CVPresentationLocale, CVSkillLevel } from '../../types/cv'
import { isCVOpenEndedDate, isCVPartialDate } from '../../utils/cvDate'

export type CVDocumentLabels = {
  objective: string
  experience: string
  education: string
  skills: string
  projects: string
  certificates: string
  languages: string
  contact: string
  present: string
  fullName: string
  professionalProfile: string
  candidate: string
  portrait: string
  defaultAvatar: string
}

const CV_LABELS: Record<CVPresentationLocale, CVDocumentLabels> = {
  vi: {
    objective: 'Mục tiêu nghề nghiệp',
    experience: 'Kinh nghiệm',
    education: 'Học vấn',
    skills: 'Kỹ năng',
    projects: 'Dự án',
    certificates: 'Chứng chỉ',
    languages: 'Ngôn ngữ',
    contact: 'Liên hệ',
    present: 'Hiện tại',
    fullName: 'Họ và tên',
    professionalProfile: 'Hồ sơ nghề nghiệp',
    candidate: 'Ứng viên',
    portrait: 'Ảnh chân dung',
    defaultAvatar: 'Ảnh đại diện mặc định',
  },
  en: {
    objective: 'Career Objective',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certificates: 'Certificates',
    languages: 'Languages',
    contact: 'Contact',
    present: 'Present',
    fullName: 'Full name',
    professionalProfile: 'Professional profile',
    candidate: 'Candidate',
    portrait: 'Portrait',
    defaultAvatar: 'Default profile image',
  },
}

const LANGUAGE_PROFICIENCY_LABELS: Record<CVPresentationLocale, Record<CVLanguageProficiency, string>> = {
  vi: { BASIC: 'Cơ bản', CONVERSATIONAL: 'Giao tiếp', PROFESSIONAL: 'Chuyên nghiệp', FLUENT: 'Thành thạo', NATIVE: 'Bản ngữ' },
  en: { BASIC: 'Basic', CONVERSATIONAL: 'Conversational', PROFESSIONAL: 'Professional', FLUENT: 'Fluent', NATIVE: 'Native' },
}

const SKILL_LEVEL_LABELS: Record<CVPresentationLocale, Record<CVSkillLevel, string>> = {
  vi: { BEGINNER: 'Mới bắt đầu', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao', EXPERT: 'Chuyên gia' },
  en: { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced', EXPERT: 'Expert' },
}

const ENGLISH_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const pad = (value: number) => String(value).padStart(2, '0')

export function normalizeCVLocale(value: unknown): CVPresentationLocale {
  return value === 'en' ? 'en' : 'vi'
}

export function getCVLabels(locale: unknown): CVDocumentLabels {
  return CV_LABELS[normalizeCVLocale(locale)]
}

export function formatCVLanguageProficiency(value: string | null | undefined, locale: unknown): string {
  if (!value) return ''
  const normalizedLocale = normalizeCVLocale(locale)
  return value in LANGUAGE_PROFICIENCY_LABELS[normalizedLocale]
    ? LANGUAGE_PROFICIENCY_LABELS[normalizedLocale][value as CVLanguageProficiency]
    : value
}

export function formatCVSkillLevel(value: string | null | undefined, locale: unknown): string {
  if (!value) return ''
  const normalizedLocale = normalizeCVLocale(locale)
  return value in SKILL_LEVEL_LABELS[normalizedLocale]
    ? SKILL_LEVEL_LABELS[normalizedLocale][value as CVSkillLevel]
    : value
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function localizedDate(year: number, month: number | null, day: number | null, locale: CVPresentationLocale): string {
  if (month == null) return String(year).padStart(4, '0')
  if (locale === 'vi') return day == null ? `${pad(month)}/${year}` : `${pad(day)}/${pad(month)}/${year}`
  const monthLabel = ENGLISH_MONTHS[month - 1]
  return day == null ? `${monthLabel} ${year}` : `${monthLabel} ${day}, ${year}`
}

export function formatCVDateForDisplay(value: CVDateValue | null | undefined, locale: unknown = 'vi'): string {
  const normalizedLocale = normalizeCVLocale(locale)
  if (value == null) return ''
  if (isCVOpenEndedDate(value)) return getCVLabels(normalizedLocale).present
  if (isCVPartialDate(value)) return localizedDate(value.year, value.month ?? null, value.day ?? null, normalizedLocale)
  if (typeof value !== 'string') return ''

  const raw = value.trim()
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(raw)
  if (!match) return raw
  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) : null
  const day = match[3] ? Number(match[3]) : null
  if (month != null && (month < 1 || month > 12)) return raw
  if (day != null && (month == null || !isValidCalendarDate(year, month, day))) return raw
  return localizedDate(year, month, day, normalizedLocale)
}
