import { ShieldCheck } from 'lucide-react'
import type { CVATSStatus } from '../../types/cv'

const CV_ATS_STATUS_LABELS: Record<CVATSStatus, string> = {
  UNREVIEWED: 'ATS: Chưa đánh giá',
  ATS_FRIENDLY: 'Thân thiện ATS',
  ATS_CAUTION: 'ATS: Cần lưu ý',
  NOT_ATS_FRIENDLY: 'Không tối ưu cho ATS',
}

export function CandidateATSFriendlyBadge({ status }: { status: CVATSStatus }) {
  if (status !== 'ATS_FRIENDLY') return null
  return <span title="Được kiểm tra về khả năng đọc văn bản và cấu trúc CV; không bảo đảm tương thích với mọi hệ thống ATS." className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200"><ShieldCheck size={13} />Thân thiện ATS</span>
}

export function AdminATSQualificationBadge({ status }: { status: CVATSStatus }) {
  const tone = status === 'ATS_FRIENDLY'
    ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    : status === 'ATS_CAUTION'
      ? 'bg-amber-50 text-amber-800 ring-amber-200'
      : status === 'NOT_ATS_FRIENDLY'
        ? 'bg-rose-50 text-rose-800 ring-rose-200'
        : 'bg-slate-100 text-slate-700 ring-slate-200'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tone}`}>{CV_ATS_STATUS_LABELS[status]}</span>
}
