import type { ApplicationStatus } from '../../../types/application'

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Đã gửi',
  REVIEWING: 'Đang xem xét',
  SHORTLISTED: 'Danh sách ngắn',
  REJECTED: 'Bị từ chối',
  HIRED: 'Đã tuyển',
  WITHDRAWN: 'Đã rút',
}
