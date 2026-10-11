import { RECRUITER_APPLICATION_STATUSES, type ApplicantRankingMode, type ApplicantRankingStatus, type RecruiterApplicationListItem, type RecruiterApplicationListParams, type RecruiterApplicationSort, type RecruiterApplicationStatus } from '../types/recruiterApplication'

export const rankingStatusLabels: Record<ApplicantRankingStatus, string> = {
  ranked: 'Đã xếp hạng',
  pending: 'Đang chờ xếp hạng',
  unavailable: 'Chưa có dữ liệu AI',
  error: 'AI tạm thời không khả dụng',
}

export function rankingPresentation(application: RecruiterApplicationListItem) {
  const status = application.ranking_status
  const rank = application.ai_rank
  return {
    rankLabel: status === 'ranked' && typeof rank === 'number' && Number.isInteger(rank) && rank > 0 ? `Xếp hạng AI #${rank}` : null,
    statusLabel: status ? rankingStatusLabels[status] ?? 'Chưa có thông tin xếp hạng' : 'Chưa có thông tin xếp hạng',
    tone: status === 'ranked' ? 'ranked' as const : 'neutral' as const,
  }
}

/** AI ranking belongs to one job's applicant pool, never the global directory. */
export function recruiterListScopeQuery(params: URLSearchParams, allowRanking: boolean) {
  const scoped = new URLSearchParams(params)
  if (!allowRanking) {
    scoped.delete('sort')
    scoped.delete('ranking_snapshot')
    scoped.delete('ai_top_n')
    scoped.delete('ranking_mode')
    scoped.delete('top_n')
  }
  return scoped
}

export function recruiterRankingQuery(params: URLSearchParams, pageSize: number, allowRanking = true) {
  const scoped = recruiterListScopeQuery(params, allowRanking)
  const sort: RecruiterApplicationSort = scoped.get('sort') === 'ai_match' ? 'ai_match' : 'newest'
  const ai = sort === 'ai_match'
  const mode: ApplicantRankingMode = scoped.get('ranking_mode') === 'top_n' ? 'top_n' : 'all'
  const topN = mode === 'top_n' ? Number(scoped.get('top_n')) : undefined
  const rawPage = Number(params.get('page') ?? '1')
  const requestedPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const rawSnapshot = params.get('ranking_snapshot')
  const snapshot = ai && rawSnapshot && /^[0-9a-f]{32}$/.test(rawSnapshot) ? rawSnapshot : undefined
  const page = ai && !snapshot ? 1 : requestedPage
  const rawStatus = params.get('status')
  const status = rawStatus && RECRUITER_APPLICATION_STATUSES.includes(rawStatus as RecruiterApplicationStatus) ? rawStatus as RecruiterApplicationStatus : undefined
  const request: RecruiterApplicationListParams = {
    search: params.get('search')?.trim() || undefined,
    status,
    job_id: params.get('job_id') || undefined,
    page,
    page_size: pageSize,
    ...(ai ? { sort: 'ai_match', ranking_mode: mode, ...(mode === 'top_n' ? { top_n: topN } : {}), ...(snapshot ? { ranking_snapshot: snapshot } : {}) } : {}),
  }
  return { sort, ai, mode, topN, page, snapshot, request, needsReset: scoped.toString() !== params.toString() || (ai && (requestedPage !== page || Boolean(rawSnapshot && !snapshot))) }
}

/** Sort/filter/job changes invalidate the entire backend ranking traversal. */
export function updateRecruiterListQuery(current: URLSearchParams, updates: Record<string, string | null>, resetSession = true, snapshot?: string | null) {
  const next = new URLSearchParams(current)
  Object.entries(updates).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value))
  if (resetSession) {
    next.delete('page')
    next.delete('ranking_snapshot')
  } else if (next.get('sort') === 'ai_match' && snapshot && /^[0-9a-f]{32}$/.test(snapshot)) {
    next.set('ranking_snapshot', snapshot)
  }
  if (next.get('sort') !== 'ai_match') {
    for (const key of ['ranking_snapshot', 'ranking_mode', 'top_n', 'ai_top_n']) next.delete(key)
  }
  return next
}

export function validRankingTopN(value: string) {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0
}

export function rankingActionQuery(current: URLSearchParams, mode: ApplicantRankingMode, topN = 10) {
  if (mode === 'top_n' && !validRankingTopN(String(topN))) throw new Error('N phải là số nguyên dương.')
  return updateRecruiterListQuery(current, { sort: 'ai_match', ranking_mode: mode,
    top_n: mode === 'top_n' ? String(topN) : null, ai_top_n: null })
}

export function rankingResultTitle(mode: ApplicantRankingMode, topN?: number) {
  return mode === 'top_n' ? `Top ${topN} theo xếp hạng AI` : 'Xếp hạng ứng viên bằng AI'
}
