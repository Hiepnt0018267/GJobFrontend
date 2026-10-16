import { BookmarkMinus, BriefcaseBusiness, CalendarClock, MapPin, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { SavedJobListItem } from '../../types/savedJob'
import { employmentLabel, formatJobTimestamp, formatSalary, workModeLabel } from '../../utils/jobDisplay'
import { safeImageUrl } from '../../utils/publicUrl'

type Props = {
  item: SavedJobListItem
  returnTo: string
  removing: boolean
  disabled: boolean
  onRemove: (jobId: string) => void
}

export default function SavedJobCard({ item, returnTo, removing, disabled, onRemove }: Props) {
  const [logoFailed, setLogoFailed] = useState(false)
  const { job } = item
  const logoUrl = safeImageUrl(job.company_logo_url)
  const canOpen = job.status === 'APPROVED' || job.status === 'CLOSED'
  const statusPresentation = {
    APPROVED: { label: 'Đang tuyển', className: 'bg-teal-50 text-[#49BBBD]' },
    CLOSED: { label: 'Đã đóng', className: 'bg-slate-100 text-slate-600' },
    PENDING: { label: 'Tạm ẩn', className: 'bg-amber-50 text-amber-800' },
    REJECTED: { label: 'Không còn hiển thị', className: 'bg-red-50 text-red-700' },
  }[job.status]

  return (
    <article className="motion-card rounded-2xl bg-white p-5 shadow-premium border border-slate-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/80 hover:shadow-premium-hover sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs ring-1 ring-slate-900/5">
          {logoUrl && !logoFailed ? (
            <img src={logoUrl} alt={`Logo ${job.company_name}`} className="h-full w-full object-contain p-1.5" onError={() => setLogoFailed(true)} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500 to-[#49BBBD] text-base font-bold text-white">
              {(job.company_name || 'G').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold leading-6 text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">
                {canOpen ? <Link to={`/jobs/${job.id}`} state={{ returnTo }} className="transition-colors hover:text-[#49BBBD]">{job.title}</Link> : job.title}
              </h2>
              <p className="mt-1 break-words text-sm font-semibold text-[#49BBBD]">{job.company_name}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusPresentation.className}`}>
              {statusPresentation.label}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <span className="flex items-center gap-2"><MapPin size={15} className="shrink-0 text-slate-400" aria-hidden="true" />{job.location || 'Chưa cập nhật địa điểm'}</span>
            <span className="inline-flex items-center gap-1.5 font-bold tabular-nums text-[#49BBBD]"><Wallet size={15} className="shrink-0 text-[#49BBBD]" aria-hidden="true" />{formatSalary(job)}</span>
            <span className="flex items-center gap-2"><BriefcaseBusiness size={15} className="shrink-0 text-slate-400" aria-hidden="true" />{employmentLabel(job.employment_type)}</span>
            <span className="text-slate-500">{workModeLabel(job.work_mode)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarClock size={14} aria-hidden="true" />Đã lưu {formatJobTimestamp(item.saved_at)}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onRemove(job.id)} disabled={disabled} className="btn-press inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60 sm:flex-none">
            <BookmarkMinus size={16} aria-hidden="true" />{removing ? 'Đang bỏ lưu…' : 'Bỏ lưu'}
          </button>
          {canOpen ? (
            <Link to={`/jobs/${job.id}`} state={{ returnTo }} className="btn-press inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-[#49BBBD] transition-colors hover:bg-teal-100 sm:flex-none">Xem chi tiết</Link>
          ) : (
            <span className="inline-flex min-h-11 flex-1 cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500 sm:flex-none">Không thể xem</span>
          )}
        </div>
      </div>
    </article>
  )
}
