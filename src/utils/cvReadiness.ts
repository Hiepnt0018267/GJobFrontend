import { isBuilderCV, type CVListItem } from '../types/cv'

export type CandidateCVReadiness = 'READY' | 'PROCESSING' | 'NEEDS_RETRY'

export function getCandidateCVReadiness(cv: CVListItem): CandidateCVReadiness {
  if (isBuilderCV(cv) || cv.is_matchable === true) return 'READY'
  if (cv.extraction_status === 'PROCESSING') return 'PROCESSING'
  return 'NEEDS_RETRY'
}

export const candidateCVReadinessMeta: Record<CandidateCVReadiness, { label: string; className: string }> = {
  READY: { label: 'Sẵn sàng', className: 'bg-emerald-50 text-emerald-700' },
  PROCESSING: { label: 'Đang xử lý', className: 'bg-amber-50 text-amber-800' },
  NEEDS_RETRY: { label: 'Cần thử lại', className: 'bg-red-50 text-red-700' },
}
