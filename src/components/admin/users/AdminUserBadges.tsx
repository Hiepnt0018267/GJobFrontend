import type { AdminUserRole } from '../../../types/adminUser'

const roleStyles: Record<AdminUserRole, { label: string; className: string }> = {
  CANDIDATE: { label: 'Ứng viên', className: 'bg-slate-100 text-slate-700 ring-slate-200/80' },
  RECRUITER: { label: 'Nhà tuyển dụng', className: 'bg-black/[0.04] text-[#1C1C1C] ring-black/10' },
  ADMIN: { label: 'Quản trị viên', className: 'bg-slate-900 text-white ring-slate-900' },
}

export function AdminUserRoleBadge({ role }: { role: AdminUserRole }) {
  const style = roleStyles[role]
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.className}`}>{style.label}</span>
}

export function AdminUserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        isActive ? 'bg-emerald-50 text-emerald-800 ring-emerald-200/80' : 'bg-red-50 text-red-800 ring-red-200/80'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} aria-hidden="true" />
      {isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
    </span>
  )
}
