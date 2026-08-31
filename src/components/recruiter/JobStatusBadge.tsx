import { BadgeCheck, CircleX, Clock3, LockKeyhole } from 'lucide-react'
import type { JobStatus } from '../../types/job'

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', icon: Clock3, className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  APPROVED: { label: 'Đã duyệt', icon: BadgeCheck, className: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  REJECTED: { label: 'Bị từ chối', icon: CircleX, className: 'bg-red-50 text-red-700 ring-red-200' },
  CLOSED: { label: 'Đã đóng', icon: LockKeyhole, className: 'bg-slate-100 text-slate-700 ring-slate-200' },
} satisfies Record<JobStatus, { label: string; icon: typeof Clock3; className: string }>

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}><Icon size={13} />{config.label}</span>
}
