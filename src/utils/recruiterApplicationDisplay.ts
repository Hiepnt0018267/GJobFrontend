import type { RecruiterApplicationStatus } from '../types/recruiterApplication'

export const recruiterApplicationStatusLabels: Record<RecruiterApplicationStatus, string> = {
  SUBMITTED: 'Mới ứng tuyển',
  REVIEWING: 'Đang xem xét',
  SHORTLISTED: 'Danh sách ngắn',
  REJECTED: 'Đã từ chối',
  HIRED: 'Đã tuyển',
  WITHDRAWN: 'Đã rút đơn',
}

export type RecruiterApplicationAction = 'review' | 'shortlist' | 'reject' | 'hire'

export function availableRecruiterApplicationActions(status: RecruiterApplicationStatus): RecruiterApplicationAction[] {
  if (status === 'SUBMITTED') return ['review', 'reject']
  if (status === 'REVIEWING') return ['shortlist', 'reject']
  if (status === 'SHORTLISTED') return ['hire', 'reject']
  return []
}
