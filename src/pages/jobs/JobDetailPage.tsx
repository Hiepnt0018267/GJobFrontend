import axios from 'axios'
import { AlertCircle, ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin, RefreshCw, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import JobApplyAction from '../../components/application/JobApplyAction'
import CompanyInformationCard from '../../components/jobs/CompanyInformationCard'
import SavedJobButton from '../../components/jobs/SavedJobButton'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { jobService } from '../../services/jobService'
import type { JobDetail } from '../../types/job'
import { employmentLabel, experienceLabel, formatSalary, postedDate } from '../../utils/jobDisplay'

function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) return 'Không thể kết nối tới máy chủ.'
  if (error.response.status === 404) return 'Không tìm thấy việc làm.'
  if (error.response.status === 401) return 'Phiên đăng nhập không hợp lệ.'
  if (error.response.status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (error.response.status === 422) return 'Thông tin việc làm không hợp lệ.'
  if (error.response.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  return 'Không thể tải chi tiết việc làm. Vui lòng thử lại.'
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        <div className="space-y-5">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const refreshVersion = useDataRefreshVersion()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()

    jobService.getJobById(id, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setJob(response)
          setError(null)
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(requestError))
      })

    return () => controller.abort()
  }, [id, refreshVersion, reload])

  useEffect(() => {
    if (!job || location.hash !== '#apply') return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('job-apply')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [job, location.hash])

  const retry = () => {
    setError(null)
    setReload((value) => value + 1)
  }

  if (!id) return <div className="min-h-screen bg-slate-50" />
  const hasCurrentJob = job?.id === id
  if (!hasCurrentJob && !error) return <div className="min-h-screen bg-slate-50"><DetailSkeleton /></div>
  if (!hasCurrentJob) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <AlertCircle className="mx-auto text-red-500" size={36} />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Không thể hiển thị việc làm</h1>
          <p className="mt-2 text-sm text-slate-500">{error ?? 'Không tìm thấy việc làm.'}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/jobs" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <ArrowLeft size={16} />Danh sách việc làm
            </Link>
            <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg bg-[#49BBBD] px-4 py-2 text-sm font-semibold text-white hover:bg-[#49BBBD]/90">
              <RefreshCw size={16} />Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  const requestedReturnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const validReturnTo = requestedReturnTo?.startsWith('/candidate/saved-jobs') || requestedReturnTo?.startsWith('/candidate/job-recommendations')
  const backTo = validReturnTo && requestedReturnTo ? requestedReturnTo : '/jobs'
  const backLabel = backTo?.startsWith('/candidate/job-recommendations')
    ? 'Quay lại gợi ý việc làm'
    : backTo === '/jobs' ? 'Quay lại danh sách' : 'Quay lại việc làm đã lưu'

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Breadcrumb & Banner */}
      <div className="border-b border-slate-200/70 bg-white shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-[#49BBBD] transition-colors">Trang chủ</Link>
            <span className="text-slate-300">/</span>
            <Link to="/jobs" className="hover:text-[#49BBBD] transition-colors">Việc làm</Link>
            <span className="text-slate-300">/</span>
            <span className="truncate font-semibold text-slate-800" aria-current="page">{job.title}</span>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to={backTo} className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#49BBBD] hover:text-[#49BBBD] transition-colors mb-6">
          <ArrowLeft size={16} />{backLabel}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main JD Content Card (Figma Squircle Style) */}
          <article className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#49BBBD] bg-teal-50 px-3 py-1 rounded-full mb-3">
                  {job.company?.name || job.company_name}
                </span>
                <h1 className="break-words text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                  {job.title}
                </h1>
              </div>
              <span className="h-fit w-fit shrink-0 rounded-full bg-[#49BBBD] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
                {employmentLabel(job.employment_type)}
              </span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2 border border-slate-100">
              <p className="flex items-center gap-2.5 text-slate-600">
                <MapPin size={18} className="shrink-0 text-[#49BBBD]" />
                <span>{job.location ?? 'Linh hoạt'}</span>
              </p>
              <p className="flex items-center gap-2.5 text-slate-600">
                <Wallet size={18} className="shrink-0 text-[#49BBBD]" />
                <span className="tabular-nums font-bold text-[#49BBBD] text-base">{formatSalary(job)}</span>
              </p>
              <p className="flex items-center gap-2.5 text-slate-600">
                <BriefcaseBusiness size={18} className="shrink-0 text-[#49BBBD]" />
                <span>{experienceLabel(job.experience_level)}</span>
              </p>
              <p className="flex items-center gap-2.5 text-slate-600">
                <CalendarDays size={18} className="shrink-0 text-[#49BBBD]" />
                <span className="tabular-nums">Đăng ngày {postedDate(job.created_at)}</span>
              </p>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <section className="mt-8 pt-8 border-t border-slate-100">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
                  Kỹ năng chuyên môn
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 hover:bg-teal-50 hover:text-[#49BBBD] hover:border-teal-200 border border-transparent px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Job Description */}
            <section className="mt-8 pt-8 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                Mô tả công việc
              </h2>
              <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-600">{job.description}</p>
            </section>

            {/* Requirements */}
            {job.requirements && (
              <section className="mt-8 pt-8 border-t border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Yêu cầu ứng viên
                </h2>
                <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-600">{job.requirements}</p>
              </section>
            )}

            {/* Benefits */}
            {job.benefits && (
              <section className="mt-8 pt-8 border-t border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Quyền lợi & Đãi ngộ
                </h2>
                <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-600">{job.benefits}</p>
              </section>
            )}
          </article>

          {/* Sticky Apply Action & Company Column */}
          <aside id="job-apply" className="scroll-mt-24 space-y-6 self-start lg:sticky lg:top-24">
            <JobApplyAction job={job} />
            <SavedJobButton jobId={job.id} jobStatus={job.status} />
            <CompanyInformationCard company={job.company} fallbackName={job.company_name} />
          </aside>
        </div>
      </main>
    </div>
  )
}
