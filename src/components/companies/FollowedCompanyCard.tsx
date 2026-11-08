import { ArrowRight, Building2, CalendarDays, Loader2, MapPin, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FollowedCompanyListItem } from '../../types/company'
import { safeImageUrl } from '../../utils/publicUrl'

function formatFollowedAt(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'Chưa rõ thời gian' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(parsed)
}

export function CompanyLogo({ item }: { item: FollowedCompanyListItem }) {
  const logoUrl = safeImageUrl(item.company.logo_url)
  const [failed, setFailed] = useState(false)
  const initial = item.company.name.trim().charAt(0).toUpperCase() || 'G'
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {logoUrl && !failed ? (
        <img src={logoUrl} alt={`Logo ${item.company.name}`} className="h-full w-full object-contain p-1.5" onError={() => setFailed(true)} />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-teal-50 text-xl font-black text-[#31999b]" aria-label={`Logo mặc định ${item.company.name}`}>{initial}</span>
      )}
    </div>
  )
}

export default function FollowedCompanyCard({
  item,
  removing,
  disabled,
  onUnfollow,
}: {
  item: FollowedCompanyListItem
  removing: boolean
  disabled: boolean
  onUnfollow: (companyId: string) => void
}) {
  const { company } = item
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-premium-hover">
      <div className="flex items-start gap-4">
        <Link to={`/companies/${company.id}`} aria-label={`Xem trang công ty ${company.name}`}>
          <CompanyLogo item={item} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/companies/${company.id}`} className="line-clamp-2 text-lg font-bold leading-6 text-slate-950 transition-colors hover:text-[#31999b]">
            {company.name}
          </Link>
          <p className="mt-1 truncate text-sm text-slate-600">{company.industry || 'Chưa cập nhật ngành nghề'}</p>
        </div>
      </div>
      <dl className="mt-5 grid gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2">
          <UsersRound size={16} className="shrink-0 text-[#49BBBD]" />
          <dt className="sr-only">Người theo dõi</dt>
          <dd><strong className="text-slate-800">{item.follower_count.toLocaleString('vi-VN')}</strong> người theo dõi</dd>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Building2 size={16} className="shrink-0 text-[#49BBBD]" />
          <dt className="sr-only">Tin đang tuyển</dt>
          <dd><strong className="text-slate-800">{item.active_job_count.toLocaleString('vi-VN')}</strong> tin đang tuyển</dd>
        </div>
        {company.size !== null && (
          <div className="flex min-w-0 items-center gap-2">
            <UsersRound size={16} className="shrink-0 text-slate-400" />
            <dt className="sr-only">Quy mô</dt>
            <dd className="truncate">{company.size.toLocaleString('vi-VN')} nhân sự</dd>
          </div>
        )}
        {company.address && (
          <div className="flex min-w-0 items-center gap-2">
            <MapPin size={16} className="shrink-0 text-slate-400" />
            <dt className="sr-only">Địa chỉ</dt>
            <dd className="truncate">{company.address}</dd>
          </div>
        )}
      </dl>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500">
        <CalendarDays size={14} />
        Theo dõi từ {formatFollowedAt(item.followed_at)}
      </p>
      <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
        <Link
          to={`/companies/${company.id}`}
          className="btn-press inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:border-[#49BBBD] hover:text-[#31999b]"
        >
          Xem trang công ty <ArrowRight size={15} />
        </Link>
        <button
          type="button"
          onClick={() => onUnfollow(company.id)}
          disabled={disabled}
          className="btn-press inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-55"
        >
          {removing && <Loader2 size={15} className="animate-spin" />}
          {removing ? 'Đang bỏ theo dõi' : 'Bỏ theo dõi'}
        </button>
      </div>
    </article>
  )
}
