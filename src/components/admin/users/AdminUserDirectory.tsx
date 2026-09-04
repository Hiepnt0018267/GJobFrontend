import { ArrowRight, CalendarClock, Eye, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AdminUserListItem } from '../../../types/adminUser'
import { formatJobTimestamp } from '../../../utils/jobDisplay'
import AdminUserAvatar from './AdminUserAvatar'
import { AdminUserRoleBadge, AdminUserStatusBadge } from './AdminUserBadges'

type AdminUserDirectoryProps = {
  users: AdminUserListItem[]
  returnTo: string
}

export default function AdminUserDirectory({ users, returnTo }: AdminUserDirectoryProps) {
  return (
    <section className="mt-6" aria-label="Danh sách người dùng">
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
        <table className="w-full table-fixed text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="w-[34%] px-5 py-4">Người dùng</th><th className="w-[16%] px-4 py-4">Vai trò</th><th className="w-[20%] px-4 py-4">Trạng thái</th><th className="w-[20%] px-4 py-4">Cập nhật</th><th className="w-[10%] px-5 py-4 text-right"><span className="sr-only">Thao tác</span></th></tr></thead>
          <tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id} className="transition-colors hover:bg-slate-50/80"><td className="px-5 py-4"><div className="flex min-w-0 items-center gap-3"><AdminUserAvatar name={user.full_name} url={user.avatar_url} /><div className="min-w-0"><p className="truncate font-semibold text-slate-950" title={user.full_name}>{user.full_name}</p><p className="mt-1 truncate text-sm text-slate-500" title={user.email}>{user.email}</p></div></div></td><td className="px-4 py-4"><AdminUserRoleBadge role={user.role} /></td><td className="px-4 py-4"><AdminUserStatusBadge isActive={user.is_active} /></td><td className="px-4 py-4 text-sm text-slate-600"><span className="inline-flex items-start gap-1.5"><CalendarClock size={15} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />{formatJobTimestamp(user.updated_at)}</span></td><td className="px-5 py-4 text-right"><Link to={`/admin/users/${user.id}`} state={{ returnTo }} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Eye size={14} aria-hidden="true" />Chi tiết</Link></td></tr>)}</tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">{users.map((user) => <article key={user.id} className="motion-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-start gap-3"><AdminUserAvatar name={user.full_name} url={user.avatar_url} /><div className="min-w-0 flex-1"><h2 className="break-words font-bold text-slate-950">{user.full_name}</h2><p className="mt-1 flex items-start gap-1.5 break-all text-sm text-slate-500"><Mail size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{user.email}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><AdminUserRoleBadge role={user.role} /><AdminUserStatusBadge isActive={user.is_active} /></div><div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs text-slate-500">Cập nhật {formatJobTimestamp(user.updated_at)}</span><Link to={`/admin/users/${user.id}`} state={{ returnTo }} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white">Chi tiết<ArrowRight size={14} aria-hidden="true" /></Link></div></article>)}</div>
    </section>
  )
}
