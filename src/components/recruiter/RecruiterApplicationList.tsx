import { ArrowRight, CalendarClock, Eye, FileText, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RecruiterApplicationListItem } from '../../types/recruiterApplication'
import { cvFileTypeLabel, formatFileSize } from '../../types/cv'
import { formatJobTimestamp } from '../../utils/jobDisplay'
import RecruiterApplicationAvatar from './RecruiterApplicationAvatar'
import RecruiterApplicationStatusBadge from './RecruiterApplicationStatusBadge'

type Props = { applications: RecruiterApplicationListItem[]; returnTo: string }
const cvMeta = (application: RecruiterApplicationListItem) => application.cv.source_type === 'UPLOADED' || !application.cv.template ? `CV tải lên · ${cvFileTypeLabel(application.cv.mime_type)} · ${formatFileSize(application.cv.file_size)}` : application.cv.template.name

export default function RecruiterApplicationList({ applications, returnTo }: Props) {
  return (
    <section className="mt-6" aria-label="Danh sách ứng viên">
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-premium border border-slate-200/80 lg:block">
        <table className="w-full table-fixed text-left">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 font-[Plus_Jakarta_Sans,sans-serif]">
            <tr>
              <th className="w-[25%] px-5 py-4">Ứng viên</th>
              <th className="w-[24%] px-4 py-4">Công việc</th>
              <th className="w-[18%] px-4 py-4">CV</th>
              <th className="w-[16%] px-4 py-4">Trạng thái</th>
              <th className="w-[17%] px-5 py-4 text-right">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((application) => (
              <tr key={application.id} className="transition-colors hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <RecruiterApplicationAvatar name={application.candidate.full_name} url={application.candidate.avatar_url} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">{application.candidate.full_name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{application.candidate.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="truncate font-semibold text-slate-900">{application.job.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{application.job.company_name}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-blue-700">
                    <FileText size={15} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{application.cv.title}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500" title={cvMeta(application)}>
                    {cvMeta(application)}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <RecruiterApplicationStatusBadge status={application.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-start gap-1 text-right text-xs leading-5 text-slate-400">
                      <CalendarClock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                      {formatJobTimestamp(application.updated_at)}
                    </span>
                    <Link
                      to={`/recruiter/applications/${application.id}`}
                      state={{ returnTo }}
                      className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-blue-200/80 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700 transition-all hover:bg-blue-600 hover:text-white"
                    >
                      Chi tiết <Eye size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {applications.map((application) => (
          <article key={application.id} className="motion-card rounded-2xl bg-white p-5 shadow-premium border border-slate-200/80">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-base font-bold text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">{application.job.title}</p>
                <p className="mt-1 break-words text-sm text-slate-600">{application.job.company_name}</p>
              </div>
              <RecruiterApplicationStatusBadge status={application.status} />
            </div>
            <div className="mt-4 flex items-center gap-3 border-y border-slate-100 py-3">
              <RecruiterApplicationAvatar name={application.candidate.full_name} url={application.candidate.avatar_url} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{application.candidate.full_name}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                  <Mail size={13} aria-hidden="true" />
                  {application.candidate.email}
                </p>
              </div>
            </div>
            <p className="mt-4 truncate text-sm text-slate-600">
              <FileText size={15} className="mr-1 inline text-slate-400" aria-hidden="true" />
              {application.cv.title} · {cvMeta(application)}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="truncate text-xs text-slate-400">{formatJobTimestamp(application.updated_at)}</span>
              <Link
                to={`/recruiter/applications/${application.id}`}
                state={{ returnTo }}
                className="btn-press inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-blue-200/80 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700 transition-all hover:bg-blue-600 hover:text-white"
              >
                Chi tiết <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
