import { BookmarkMinus, BriefcaseBusiness, Building2, CalendarClock, MapPin, Wallet } from 'lucide-react'
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
    APPROVED: { label: 'Đang tuyển', className: 'bg-emerald-50 text-emerald-700' },
    CLOSED: { label: 'Đã đóng', className: 'bg-slate-100 text-slate-600' },
    PENDING: { label: 'Tạm ẩn', className: 'bg-amber-50 text-amber-800' },
    REJECTED: { label: 'Không còn hiển thị', className: 'bg-red-50 text-red-700' },
  }[job.status]

  return (
    <article className="motion-card rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition-[box-shadow,transform] hover:shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          {logoUrl && !logoFailed ? <img src={logoUrl} alt={`Logo ${job.company_name}`} className="h-full w-full object-contain" onError={() => setLogoFailed(true)} /> : <Building2 size={24} aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold leading-6 text-slate-950">
                {canOpen ? <Link to={`/jobs/${job.id}`} state={{ returnTo }} className="transition-colors hover:text-blue-700">{job.title}</Link> : job.title}
              </h2>
              <p className="mt-1 break-words text-sm font-semibold text-blue-700">{job.company_name}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusPresentation.className}`}>
              {statusPresentation.label}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <span className="flex items-center gap-2"><MapPin size={15} className="shrink-0 text-slate-400" aria-hidden="true" />{job.location || 'Chưa cập nhật địa điểm'}</span>
            <span className="flex items-center gap-2"><Wallet size={15} className="shrink-0 text-slate-400" aria-hidden="true" />{formatSalary(job)}</span>
            <span className="flex items-center gap-2"><BriefcaseBusiness size={15} className="shrink-0 text-slate-400" aria-hidden="true" />{employmentLabel(job.employment_type)}</span>
            <span className="text-slate-500">{workModeLabel(job.work_mode)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarClock size={14} aria-hidden="true" />Đã lưu {formatJobTimestamp(item.saved_at)}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onRemove(job.id)} disabled={disabled} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60 sm:flex-none">
            <BookmarkMinus size={16} aria-hidden="true" />{removing ? 'Đang bỏ lưu…' : 'Bỏ lưu'}
          </button>
          {canOpen ? (
            <Link to={`/jobs/${job.id}`} state={{ returnTo }} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 sm:flex-none">Xem chi tiết</Link>
          ) : (
            <span className="inline-flex min-h-11 flex-1 cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500 sm:flex-none">Không thể xem</span>
          )}
        </div>
      </div>
    </article>
  )
}
