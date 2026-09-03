import type { AdminUserRole } from '../../../types/adminUser'

const roleStyles: Record<AdminUserRole, { label: string; className: string }> = {
  CANDIDATE: { label: 'Ứng viên', className: 'bg-blue-50 text-blue-800 ring-blue-200' },
  RECRUITER: { label: 'Nhà tuyển dụng', className: 'bg-violet-50 text-violet-800 ring-violet-200' },
  ADMIN: { label: 'Quản trị viên', className: 'bg-slate-100 text-slate-800 ring-slate-200' },
}

export function AdminUserRoleBadge({ role }: { role: AdminUserRole }) {
  const style = roleStyles[role]
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style.className}`}>{style.label}</span>
}

export function AdminUserStatusBadge({ isActive }: { isActive: boolean }) {
  const style = isActive
    ? { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-800 ring-emerald-200' }
    : { label: 'Đã vô hiệu hóa', className: 'bg-red-50 text-red-800 ring-red-200' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style.className}`}>{style.label}</span>
}
