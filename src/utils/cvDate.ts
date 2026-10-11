import type { CVDateValue, CVOpenEndedDate, CVPartialDate } from '../types/cv'

export const CV_DATE_FORMAT_HINT = 'Nhập năm, tháng hoặc ngày theo định dạng YYYY, YYYY-MM hoặc YYYY-MM-DD.'
export const CV_DATE_FORMAT_ERROR = 'Ngày chưa đúng định dạng. Hãy nhập YYYY, YYYY-MM hoặc YYYY-MM-DD.'

const PRECISIONS = new Set(['year', 'month', 'day', 'ambiguous'])

export class CVDateValidationError extends Error {
  readonly path?: string

  constructor(message = CV_DATE_FORMAT_ERROR, path?: string) {
    super(message)
    this.name = 'CVDateValidationError'
    this.path = path
  }
}

export function isCVOpenEndedDate(value: unknown): value is CVOpenEndedDate {
  return typeof value === 'object' && value !== null && 'state' in value && value.state === 'current'
}

export function isCVPartialDate(value: unknown): value is CVPartialDate {
  if (typeof value !== 'object' || value === null || !('year' in value) || !('precision' in value)) return false
  const candidate = value as Partial<CVPartialDate>
  if (!Number.isInteger(candidate.year) || Number(candidate.year) < 1 || Number(candidate.year) > 9999) return false
  if (typeof candidate.precision !== 'string' || !PRECISIONS.has(candidate.precision)) return false
  if (candidate.month != null && (!Number.isInteger(candidate.month) || candidate.month < 1 || candidate.month > 12)) return false
  if (candidate.day != null && (!Number.isInteger(candidate.day) || candidate.day < 1 || candidate.day > 31)) return false
  if (candidate.precision === 'year' && (candidate.month != null || candidate.day != null)) return false
  if (candidate.precision === 'month' && (candidate.month == null || candidate.day != null)) return false
  if (candidate.precision === 'day' && (candidate.month == null || candidate.day == null)) return false
  if (candidate.day != null && candidate.month == null) return false
  if (candidate.month != null && candidate.day != null && !isCalendarDate(candidate.year!, candidate.month, candidate.day)) return false
  return true
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

function isCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function formatCVDateForEditor(value: CVDateValue | null | undefined): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (isCVOpenEndedDate(value)) return 'Hiện tại'
  if (!isCVPartialDate(value)) return ''
  const year = pad(value.year, 4)
  if (value.month == null) return year
  const month = `${year}-${pad(value.month)}`
  return value.day == null ? month : `${month}-${pad(value.day)}`
}

export const formatCVDateForDisplay = formatCVDateForEditor

export function parseCVDateFromEditor(value: string, options: { allowCurrent?: boolean; path?: string } = {}): CVDateValue | null {
  const normalized = value.trim()
  if (!normalized) return null
  const lowered = normalized.toLocaleLowerCase('vi-VN')
  if (lowered === 'hiện tại' || lowered === 'current') {
    if (options.allowCurrent) return { state: 'current' }
    throw new CVDateValidationError(CV_DATE_FORMAT_ERROR, options.path)
  }

  let match = /^(\d{4})$/.exec(normalized)
  if (match) return { year: Number(match[1]), month: null, day: null, precision: 'year' }

  match = /^(\d{4})-(\d{2})$/.exec(normalized)
  if (match) {
    const year = Number(match[1]); const month = Number(match[2])
    if (month >= 1 && month <= 12) return { year, month, day: null, precision: 'month' }
  }

  match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized)
  if (match) {
    const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3])
    if (isCalendarDate(year, month, day)) return normalized
  }
  throw new CVDateValidationError(CV_DATE_FORMAT_ERROR, options.path)
}

export function normalizeCVDateForPayload(
  value: CVDateValue | null | undefined,
  options: { allowCurrent?: boolean; path?: string } = {},
): CVDateValue | null {
  if (value == null) return null
  if (typeof value === 'string') return parseCVDateFromEditor(value, options)
  if (isCVOpenEndedDate(value)) {
    if (options.allowCurrent) return { state: 'current' }
    throw new CVDateValidationError(CV_DATE_FORMAT_ERROR, options.path)
  }
  if (isCVPartialDate(value)) return { year: value.year, month: value.month ?? null, day: value.day ?? null, precision: value.precision }
  throw new CVDateValidationError(CV_DATE_FORMAT_ERROR, options.path)
}

export function isCVDateEditorValueValid(value: CVDateValue | null | undefined, allowCurrent = false): boolean {
  try {
    normalizeCVDateForPayload(value, { allowCurrent })
    return true
  } catch (error) {
    if (error instanceof CVDateValidationError) return false
    throw error
  }
}
