import axios from 'axios'
import { EMPLOYMENT_TYPES, EXPERIENCE_REQUIREMENTS, INDUSTRIES, JOB_LEVELS, WORK_MODES } from '../types/job'
import type { CandidateJobRecommendationParams, JobRecommendationStatus } from '../types/job'

export const RECOMMENDATION_PAGE_SIZES = [9, 18, 27] as const
export const DEFAULT_RECOMMENDATION_PAGE_SIZE = 9

const hasValue = <T extends string>(values: readonly T[], value: string | null): value is T =>
  value !== null && values.includes(value as T)

export type RecommendationPublicQuery = {
  cvId: string | null
  page: number
  pageSize: number
  request: CandidateJobRecommendationParams
  identity: string
  needsPageReset: boolean
}

export type RecommendationSnapshotSession = {
  identity: string
  generation: number
  token: string
}

export function candidateRecommendationQuery(params: URLSearchParams): RecommendationPublicQuery {
  const cvId = params.get('cv_id')?.trim() || null
  const requestedPage = Math.max(1, Number(params.get('page')) || 1)
  const requestedPageSize = Number(params.get('page_size'))
  const pageSize = RECOMMENDATION_PAGE_SIZES.includes(requestedPageSize as (typeof RECOMMENDATION_PAGE_SIZES)[number])
    ? requestedPageSize
    : DEFAULT_RECOMMENDATION_PAGE_SIZE
  const request: CandidateJobRecommendationParams = { page: requestedPage, page_size: pageSize }
  const search = (params.get('search') ?? params.get('keyword') ?? '').trim()
  const location = (params.get('location') ?? '').trim()
  const industry = params.get('industry')
  const experienceRequirement = params.get('experience_requirement')
  const level = params.get('level')
  const workMode = params.get('work_mode')
  const employmentType = params.get('employment_type')
  const salary = params.get('salary') ?? ''

  if (cvId) request.cv_id = cvId
  if (search) request.search = search
  if (location) request.location = location
  if (hasValue(INDUSTRIES, industry)) request.industry = industry
  if (hasValue(EXPERIENCE_REQUIREMENTS, experienceRequirement)) request.experience_requirement = experienceRequirement
  if (hasValue(JOB_LEVELS, level)) request.level = level
  if (hasValue(WORK_MODES, workMode)) request.work_mode = workMode
  if (hasValue(EMPLOYMENT_TYPES, employmentType)) request.employment_type = employmentType
  if (salary === 'NEGOTIABLE') request.salary_type = 'NEGOTIABLE'
  else {
    const range = salary.match(/^(\d*)-(\d*)$/)
    if (range?.[1]) request.salary_min = Number(range[1])
    if (range?.[2]) request.salary_max = Number(range[2])
  }

  const identityParts = new URLSearchParams()
  Object.entries(request)
    .filter(([key, value]) => key !== 'page' && value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => identityParts.set(key, String(value)))

  return {
    cvId,
    page: requestedPage,
    pageSize,
    request,
    identity: identityParts.toString(),
    needsPageReset: requestedPage > 1,
  }
}

export function updateCandidateRecommendationQuery(
  current: URLSearchParams,
  updates: Record<string, string | null>,
  resetPage = true,
): URLSearchParams {
  const next = new URLSearchParams(current)
  Object.entries(updates).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
  if (resetPage) next.delete('page')
  return next
}

function apiDetail(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') return ''
  const detail = 'detail' in error.response.data ? error.response.data.detail : ''
  return typeof detail === 'string' ? detail.toLowerCase() : ''
}

export function isRecoverableRecommendationSnapshotError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if (error.response?.status === 409) return true
  if (error.response?.status !== 422) return false
  const detail = apiDetail(error)
  return detail.includes('pages after page 1') && detail.includes('ranking_snapshot')
}

export function compatibleRecommendationSnapshot(
  session: RecommendationSnapshotSession | null,
  identity: string,
  generation: number,
): string | undefined {
  return session?.identity === identity && session.generation === generation ? session.token : undefined
}

export function shouldRecoverRecommendationSnapshot(
  error: unknown,
  identity: string,
  recoveredIdentity: string | null,
): boolean {
  return recoveredIdentity !== identity && isRecoverableRecommendationSnapshotError(error)
}

export function recommendationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (error.response.status === 404) return 'Không tìm thấy CV để sử dụng cho gợi ý việc làm.'
  if (error.response.status === 422) return 'Thông tin lọc chưa hợp lệ. Vui lòng kiểm tra và thử lại.'
  if (error.response.status === 503) return 'Danh sách gợi ý tạm thời chưa sẵn sàng. Bạn vẫn có thể xem tất cả việc làm.'
  if (error.response.status >= 500) return 'Không thể tải gợi ý việc làm lúc này. Vui lòng thử lại.'
  return 'Không thể tải gợi ý việc làm lúc này.'
}

export const recommendationStatusCopy: Record<JobRecommendationStatus, string> = {
  ranked: 'Phù hợp theo CV',
  pending: 'Đang chuẩn bị dữ liệu xếp hạng',
  unavailable: 'Chưa thể xếp hạng',
  error: 'Chưa thể xếp hạng lúc này',
}

export function isCurrentRecommendationRequest(activeIdentity: string, responseIdentity: string): boolean {
  return activeIdentity === responseIdentity
}

export function shouldFetchRecommendations(hasStarted: boolean, cvId: string | null, startedCvId: string | null): boolean {
  return hasStarted && Boolean(cvId) && cvId === startedCvId
}
