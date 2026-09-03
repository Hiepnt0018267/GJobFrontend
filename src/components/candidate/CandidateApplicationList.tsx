import { ArrowRight, CalendarClock, FileText, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CandidateApplicationListItem } from '../../types/application'
import { formatJobTimestamp, workModeLabel } from '../../utils/jobDisplay'
import CandidateApplicationStatusBadge from './CandidateApplicationStatusBadge'

type Props = {
  applications: CandidateApplicationListItem[]
  returnTo: string
}

export default function CandidateApplicationList({ applications, returnTo }: Props) {
  return (
    <section className="mt-6 space-y-4" aria-label="Danh sách đơn ứng tuyển">
      {applications.map((application) => <Link key={application.id} to={`/candidate/applications/${application.id}`} state={{ returnTo }} className="motion-card group block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-blue-200 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3"><CandidateApplicationStatusBadge status={application.status} /><span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><CalendarClock size={14} aria-hidden="true" />Nộp {formatJobTimestamp(application.created_at)}</span></div>
            <h2 className="mt-3 break-words text-lg font-bold text-slate-950 transition-colors group-hover:text-blue-700 sm:text-xl">{application.job.title}</h2>
            <p className="mt-1 break-words text-sm font-semibold text-blue-700">{application.job.company_name}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><MapPin size={15} className="text-slate-400" aria-hidden="true" />{application.job.location || 'Chưa cập nhật địa điểm'}</span><span>{workModeLabel(application.job.work_mode)}</span><span className="inline-flex min-w-0 items-center gap-1.5"><FileText size={15} className="shrink-0 text-slate-400" aria-hidden="true" /><span className="truncate">CV: {application.cv.title}</span></span></div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:block lg:border-0 lg:pt-0 lg:text-right"><span className="text-xs text-slate-500">Cập nhật {formatJobTimestamp(application.updated_at)}</span><span className="mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 lg:mt-3">Xem chi tiết <ArrowRight size={16} aria-hidden="true" /></span></div>
        </div>
      </Link>)}
    </section>
  )
}
