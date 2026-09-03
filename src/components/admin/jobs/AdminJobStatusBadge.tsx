import type { JobStatus } from '../../../types/job'

type AdminJobStatusBadgeProps = {
  status: JobStatus
}

const statusStyles: Record<JobStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  APPROVED: { label: 'Đã duyệt', className: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  REJECTED: { label: 'Bị từ chối', className: 'bg-red-50 text-red-800 ring-red-200' },
  CLOSED: { label: 'Đã đóng', className: 'bg-slate-100 text-slate-700 ring-slate-200' },
}

export default function AdminJobStatusBadge({ status }: AdminJobStatusBadgeProps) {
  const style = statusStyles[status]
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style.className}`}>{style.label}</span>
}
