import { BadgeCheck, CircleX, Clock3, LockKeyhole } from 'lucide-react'
import type { JobStatus } from '../../../types/job'

type AdminJobStatusBadgeProps = {
  status: JobStatus
}

const statusStyles: Record<JobStatus, { label: string; icon: typeof Clock3; className: string }> = {
  PENDING: { label: 'Chờ duyệt', icon: Clock3, className: 'bg-amber-50 text-amber-800 ring-amber-200/80' },
  APPROVED: { label: 'Đã duyệt', icon: BadgeCheck, className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80' },
  REJECTED: { label: 'Bị từ chối', icon: CircleX, className: 'bg-red-50 text-red-700 ring-red-200/80' },
  CLOSED: { label: 'Đã đóng', icon: LockKeyhole, className: 'bg-slate-100 text-slate-700 ring-slate-200/80' },
}

export default function AdminJobStatusBadge({ status }: AdminJobStatusBadgeProps) {
  const style = statusStyles[status]
  const Icon = style.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.className}`}>
      <Icon size={13} aria-hidden="true" />
      {style.label}
    </span>
  )
}
