import { ArrowRight, Bookmark, BookmarkCheck, BriefcaseBusiness, CalendarDays, MapPin, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { savedJobService } from '../../services/savedJobService'
import type { Job } from '../../types/job'
import { experienceRequirementLabel, formatSalary, industryLabel, levelLabel, postedDate, workModeLabel } from '../../utils/jobDisplay'
import { safeImageUrl } from '../../utils/publicUrl'

export default function JobCard({ job }: { job: Job }) {
  const { user, isAuthenticated } = useAuth()
  const { success, info, error: toastError } = useToast()
  const navigate = useNavigate()
  const [logoFailed, setLogoFailed] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const logoUrl = safeImageUrl(job.company_logo_url)
  const companyInitial = job.company_name ? job.company_name.trim().charAt(0).toUpperCase() : 'G'

  const tags = [
    job.work_mode ? workModeLabel(job.work_mode) : null,
    job.level ? levelLabel(job.level) : null,
    job.experience_requirement ? experienceRequirementLabel(job.experience_requirement) : null,
  ].filter(Boolean)

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated || !user) {
      info('Vui lòng đăng nhập với tài khoản Ứng viên để lưu việc làm.')
      navigate('/login')
      return
    }

    if (user.role !== 'CANDIDATE') {
      info('Chỉ tài khoản Ứng viên mới có thể lưu việc làm.')
      return
    }

    if (saving) return
    setSaving(true)

    try {
      if (isSaved) {
        await savedJobService.unsave(job.id)
        setIsSaved(false)
        info('Đã bỏ lưu việc làm.')
      } else {
        await savedJobService.save(job.id)
        setIsSaved(true)
        success('Đã lưu việc làm vào danh sách quan tâm.')
      }
    } catch {
      toastError('Không thể cập nhật trạng thái lưu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="group relative flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-premium">
      <div>
        {/* Header: Company Avatar + Info + Bookmark */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/80 transition-transform group-hover:scale-105">
            {logoUrl && !logoFailed ? (
              <img
                src={logoUrl}
                alt={`Logo ${job.company_name}`}
                className="h-full w-full object-contain p-1"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                {companyInitial}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pr-9">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
              <Link to={`/jobs/${job.id}`} className="focus:outline-none focus:underline">
                {job.title}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
              {job.company_name}
            </p>
          </div>

          {/* Quick Bookmark Button with enlarged 40x40px touch area for ergonomics */}
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={saving}
            className={`btn-press absolute right-3.5 top-3.5 flex h-10 w-10 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isSaved
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
            aria-label={isSaved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
            title={isSaved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
          >
            {isSaved ? <BookmarkCheck size={18} className="fill-blue-600" /> : <Bookmark size={18} />}
          </button>
        </div>

        {/* Salary Highlight Badge */}
        <div className="mt-3.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
            <Wallet size={13} aria-hidden="true" />
            {formatSalary(job)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <MapPin size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate max-w-[130px]">{job.location ?? 'Linh hoạt'}</span>
          </span>
        </div>

        {/* Work mode, level & industry */}
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
          <BriefcaseBusiness size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{industryLabel(job.industry)}</span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-blue-50/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-700/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="self-center text-[10px] font-semibold text-slate-400">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Date + View Details */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <CalendarDays size={13} aria-hidden="true" />
          {postedDate(job.created_at)}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 font-bold text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:underline"
        >
          Xem chi tiết
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
