import { Banknote, BriefcaseBusiness, Building2, CalendarDays, MapPin, UsersRound } from 'lucide-react'
import AdminJobModerationActions from './AdminJobModerationActions'
import AdminJobStatusBadge from './AdminJobStatusBadge'
import type { AdminJob } from '../../../types/adminJob'
import { employmentLabel, formatJobTimestamp, formatSalary, industryLabel, levelLabel, workModeLabel } from '../../../utils/jobDisplay'

type AdminJobReviewContentProps = {
  job: AdminJob
  onUpdated: (job: AdminJob, action: 'approve' | 'reject') => void
  onConflict: () => void
}

export default function AdminJobReviewContent({ job, onUpdated, onConflict }: AdminJobReviewContentProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <AdminJobStatusBadge status={job.status} />
            <h1 className="mt-4 break-words text-2xl font-bold tracking-tight sm:text-3xl">{job.title}</h1>
            <p className="mt-3 flex items-center gap-2 break-words text-sm text-slate-300">
              <Building2 size={17} aria-hidden="true" />
              {job.company_name}
            </p>
          </div>
          <div className="w-full shrink-0 rounded-2xl bg-white p-5 text-slate-900 lg:max-w-sm">
            <h2 className="text-base font-bold">Quyết định kiểm duyệt</h2>
            <div className="mt-3">
              <AdminJobModerationActions job={job} onUpdated={onUpdated} onConflict={onConflict} />
            </div>
          </div>
        </div>
        <div className="mt-7 grid gap-3 border-t border-slate-700 pt-6 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <span className="flex items-center gap-2"><MapPin size={16} aria-hidden="true" />{job.location || 'Chưa cập nhật'}</span>
          <span className="flex items-center gap-2"><BriefcaseBusiness size={16} aria-hidden="true" />{employmentLabel(job.employment_type)}</span>
          <span className="flex items-center gap-2"><UsersRound size={16} aria-hidden="true" />{job.vacancies} vị trí</span>
          <span className="flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" />Tạo {formatJobTimestamp(job.created_at)}</span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="space-y-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <section>
            <h2 className="text-lg font-bold text-slate-950">Mô tả công việc</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{job.description}</p>
          </section>
          <section className="border-t border-slate-100 pt-7">
            <h2 className="text-lg font-bold text-slate-950">Yêu cầu ứng viên</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{job.requirements || 'Chưa cập nhật'}</p>
          </section>
          <section className="border-t border-slate-100 pt-7">
            <h2 className="text-lg font-bold text-slate-950">Quyền lợi</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{job.benefits || 'Chưa cập nhật'}</p>
          </section>
          {job.skills && job.skills.length > 0 && <section className="border-t border-slate-100 pt-7">
            <h2 className="text-lg font-bold text-slate-950">Kỹ năng</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => <span key={skill} className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-800">{skill}</span>)}
            </div>
          </section>}
        </article>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-950">Thông tin review</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-slate-500">Ngành nghề</dt><dd className="mt-1 font-semibold text-slate-900">{industryLabel(job.industry)}</dd></div>
            <div><dt className="text-slate-500">Cấp bậc</dt><dd className="mt-1 font-semibold text-slate-900">{levelLabel(job.level)}</dd></div>
            <div><dt className="text-slate-500">Cách thức làm việc</dt><dd className="mt-1 font-semibold text-slate-900">{workModeLabel(job.work_mode)}</dd></div>
            <div><dt className="flex items-center gap-1.5 text-slate-500"><Banknote size={15} aria-hidden="true" />Mức lương</dt><dd className="mt-1 font-semibold text-emerald-700">{formatSalary(job)}</dd></div>
            <div><dt className="text-slate-500">Cập nhật lần cuối</dt><dd className="mt-1 font-semibold text-slate-900">{formatJobTimestamp(job.updated_at)}</dd></div>
            <div><dt className="text-slate-500">Mã người đăng</dt><dd className="mt-1 break-all font-medium text-slate-700">{job.recruiter_id || 'Không có dữ liệu'}</dd></div>
          </dl>
        </aside>
      </section>
    </div>
  )
}
