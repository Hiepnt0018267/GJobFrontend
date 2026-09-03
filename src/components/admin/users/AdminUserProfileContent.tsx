import { CalendarClock, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import type { AdminUserDetail } from '../../../types/adminUser'
import { formatJobTimestamp } from '../../../utils/jobDisplay'
import AdminUserAvatar from './AdminUserAvatar'
import { AdminUserRoleBadge, AdminUserStatusBadge } from './AdminUserBadges'
import AdminUserStatusActions from './AdminUserStatusActions'

type AdminUserProfileContentProps = {
  user: AdminUserDetail
  isCurrentUser: boolean
  onUpdated: (user: AdminUserDetail, action: 'activate' | 'deactivate') => void
  onConflict: () => void
}

function DetailField({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string | null }) {
  return <div><dt className="flex items-center gap-1.5 text-slate-500"><Icon size={15} aria-hidden="true" />{label}</dt><dd className="mt-1 break-words font-semibold text-slate-900">{value || 'Chưa cập nhật'}</dd></div>
}

export default function AdminUserProfileContent({ user, isCurrentUser, onUpdated, onConflict }: AdminUserProfileContentProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <AdminUserAvatar name={user.full_name} url={user.avatar_url} size="lg" />
          <div className="min-w-0"><h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">{user.full_name}</h1><p className="mt-2 flex items-start gap-2 break-all text-sm text-slate-300"><Mail size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{user.email}</p><div className="mt-4 flex flex-wrap gap-2"><AdminUserRoleBadge role={user.role} /><AdminUserStatusBadge isActive={user.is_active} /></div></div>
        </div>
        <div className="mt-7 grid gap-3 border-t border-slate-700 pt-6 text-sm text-slate-200 sm:grid-cols-2"><span className="flex items-center gap-2"><CalendarClock size={16} aria-hidden="true" />Tạo {formatJobTimestamp(user.created_at)}</span><span className="flex items-center gap-2"><CalendarClock size={16} aria-hidden="true" />Cập nhật {formatJobTimestamp(user.updated_at)}</span></div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><h2 className="text-lg font-bold text-slate-950">Thông tin hồ sơ</h2><dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2"><DetailField icon={Phone} label="Số điện thoại" value={user.phone} /><DetailField icon={MapPin} label="Địa chỉ" value={user.address} /><DetailField icon={UserRound} label="Tiểu sử" value={user.bio} /></dl></article>
        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Trạng thái tài khoản</h2><div className="mt-4"><AdminUserStatusActions user={user} isCurrentUser={isCurrentUser} onUpdated={onUpdated} onConflict={onConflict} /></div></aside>
      </section>
    </div>
  )
}
