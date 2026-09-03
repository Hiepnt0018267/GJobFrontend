import type { ApplicationStatus } from '../types/application'

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Đã ứng tuyển',
  REVIEWING: 'Đang xem xét',
  SHORTLISTED: 'Danh sách ngắn',
  REJECTED: 'Bị từ chối',
  HIRED: 'Đã tuyển',
  WITHDRAWN: 'Đã rút đơn',
}

export function canWithdrawApplication(status: ApplicationStatus): boolean {
  return status === 'SUBMITTED' || status === 'REVIEWING' || status === 'SHORTLISTED'
}
