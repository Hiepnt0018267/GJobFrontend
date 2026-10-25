import type { AdminUserAccountStatus, AdminUserRole } from '../../../types/adminUser'

const roleStyles: Record<AdminUserRole, { label: string; className: string }> = {
  CANDIDATE: { label: 'Ứng viên', className: 'bg-slate-100 text-slate-700 ring-slate-200/80' },
  RECRUITER: { label: 'Nhà tuyển dụng', className: 'bg-black/[0.04] text-[#1C1C1C] ring-black/10' },
  ADMIN: { label: 'Quản trị viên', className: 'bg-slate-900 text-white ring-slate-900' },
}

export function AdminUserRoleBadge({ role, onDark = false }: { role: AdminUserRole; onDark?: boolean }) {
  const style = roleStyles[role]
  const className = onDark ? 'bg-white/10 text-white ring-white/20' : style.className
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>{style.label}</span>
}

const statusStyles: Record<AdminUserAccountStatus, { label: string; dot: string; className: string }> = {
  PENDING: { label: 'Chờ xác minh', dot: 'bg-amber-500', className: 'bg-amber-50 text-amber-800 ring-amber-200/80' },
  ACTIVE: { label: 'Đang hoạt động', dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80' },
  INACTIVE: { label: 'Đã vô hiệu hóa', dot: 'bg-red-500', className: 'bg-red-50 text-red-800 ring-red-200/80' },
}

export function AdminUserStatusBadge({ status }: { status: AdminUserAccountStatus }) {
  const style = statusStyles[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  )
}
