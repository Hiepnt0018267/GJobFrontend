import axios from 'axios'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  Globe2,
  LoaderCircle,
  MapPin,
  RefreshCw,
  UsersRound,
  Wallet,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { companyService } from '../../services/companyService'
import type { CompanyFollowStatus, PublicCompany, PublicCompanyJobsResponse } from '../../types/company'
import type { Job } from '../../types/job'
import {
  employmentLabel,
  formatJobTimestamp,
  formatSalary,
  levelLabel,
  workModeLabel,
} from '../../utils/jobDisplay'
import { externalUrlLabel, safeExternalUrl, safeImageUrl } from '../../utils/publicUrl'

const JOBS_PAGE_SIZE = 6

type CompanyTab = 'overview' | 'jobs'
type PageError = { kind: 'not-found' | 'network'; message: string }

function pageError(error: unknown): PageError {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return { kind: 'not-found', message: 'Công ty này không tồn tại hoặc không còn khả dụng.' }
  }
  if (!axios.isAxiosError(error) || !error.response) {
    return { kind: 'network', message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.' }
  }
  return { kind: 'network', message: 'Không thể tải thông tin công ty. Vui lòng thử lại.' }
}

function CompanyPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-label="Đang tải trang công ty">
      <div className="animate-pulse rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
        <div className="flex items-center gap-5">
          <div className="h-24 w-24 rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-3"><div className="h-7 w-64 rounded bg-slate-200" /><div className="h-4 w-44 rounded bg-slate-200" /></div>
        </div>
        <div className="mt-8 h-12 rounded-xl bg-slate-100" />
      </div>
      <div className="mt-7 grid animate-pulse gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-80 rounded-3xl bg-white ring-1 ring-slate-200" />
        <div className="h-64 rounded-3xl bg-white ring-1 ring-slate-200" />
      </div>
    </main>
  )
}

function CompanyLogo({ company }: { company: PublicCompany }) {
  const logoUrl = safeImageUrl(company.logo_url)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const initial = company.name.trim().charAt(0).toUpperCase() || 'G'

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-28 sm:w-28">
      {logoUrl && failedUrl !== logoUrl ? (
        <img src={logoUrl} alt={`Logo ${company.name}`} className="h-full w-full object-contain p-2" onError={() => setFailedUrl(logoUrl)} />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-teal-50 text-3xl font-black text-[#31999b]" aria-label={`Logo mặc định ${company.name}`}>{initial}</span>
      )}
    </div>
  )
}

function CompanyJobCard({ job }: { job: Job }) {
  return (
    <article className="motion-card flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#49BBBD]/60 hover:shadow-premium-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/jobs/${job.id}`} className="line-clamp-2 text-lg font-bold leading-7 text-slate-950 transition-colors hover:text-[#31999b]">{job.title}</Link>
          <p className="mt-1 truncate text-sm font-medium text-slate-500">{job.company_name}</p>
        </div>
        <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-[#31999b]">{employmentLabel(job.employment_type)}</span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2"><MapPin size={16} className="shrink-0 text-slate-400" /><dt className="sr-only">Địa điểm</dt><dd className="truncate">{job.location || 'Linh hoạt'}</dd></div>
        <div className="flex min-w-0 items-center gap-2"><Wallet size={16} className="shrink-0 text-slate-400" /><dt className="sr-only">Mức lương</dt><dd className="truncate font-semibold text-[#31999b]">{formatSalary(job)}</dd></div>
        <div className="flex min-w-0 items-center gap-2"><BriefcaseBusiness size={16} className="shrink-0 text-slate-400" /><dt className="sr-only">Cấp bậc</dt><dd className="truncate">{levelLabel(job.level)}</dd></div>
        <div className="flex min-w-0 items-center gap-2"><Building2 size={16} className="shrink-0 text-slate-400" /><dt className="sr-only">Hình thức làm việc</dt><dd className="truncate">{workModeLabel(job.work_mode)}</dd></div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={14} />{formatJobTimestamp(job.created_at)}</span>
        <Link to={`/jobs/${job.id}`} className="btn-press inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#49BBBD] px-4 text-sm font-bold text-white hover:bg-[#3CA8AA]">Xem chi tiết<ArrowRight size={15} /></Link>
      </div>
    </article>
  )
}

export default function PublicCompanyPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const toast = useToast()
  const [companyRecord, setCompanyRecord] = useState<PublicCompany | null>(null)
  const [errorRecord, setErrorRecord] = useState<(PageError & { companyId: string }) | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [tab, setTab] = useState<CompanyTab>('overview')
  const [page, setPage] = useState(1)
  const [jobs, setJobs] = useState<PublicCompanyJobsResponse | null>(null)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [jobsReloadKey, setJobsReloadKey] = useState(0)
  const [followRecord, setFollowRecord] = useState<CompanyFollowStatus | null>(null)
  const [followLoading, setFollowLoading] = useState(false)
  const [followError, setFollowError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    const controller = new AbortController()
    companyService.getCompany(companyId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setCompanyRecord(data)
        setErrorRecord(null)
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setErrorRecord({ ...pageError(requestError), companyId })
      })
    return () => controller.abort()
  }, [companyId, reloadKey])

  useEffect(() => {
    if (!companyId || authLoading || user?.role !== 'CANDIDATE') {
      return
    }
    const controller = new AbortController()
    companyService.getFollowStatus(companyId, controller.signal)
      .then((status) => {
        if (controller.signal.aborted) return
        setFollowRecord(status)
        setCompanyRecord((current) => current?.id === companyId ? { ...current, follower_count: status.follower_count } : current)
      })
      .catch(() => { if (!controller.signal.aborted) setFollowError('Chưa thể tải trạng thái theo dõi.') })
      .finally(() => { if (!controller.signal.aborted) setFollowLoading(false) })
    return () => controller.abort()
  }, [authLoading, companyId, user?.role, reloadKey])

  useEffect(() => {
    if (!companyId || tab !== 'jobs') return
    const controller = new AbortController()
    companyService.getCompanyJobs(companyId, { page, page_size: JOBS_PAGE_SIZE, sort: 'newest' }, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setJobs(data) })
      .catch(() => { if (!controller.signal.aborted) setJobsError('Không thể tải danh sách việc làm. Vui lòng thử lại.') })
      .finally(() => { if (!controller.signal.aborted) setJobsLoading(false) })
    return () => controller.abort()
  }, [companyId, jobsReloadKey, page, tab])

  const company = companyRecord?.id === companyId ? companyRecord : null
  const error = errorRecord?.companyId === companyId ? errorRecord : null
  const followStatus = followRecord?.company_id === companyId && user?.role === 'CANDIDATE' ? followRecord : null
  const website = safeExternalUrl(company?.website)
  const mapsUrl = company?.address
    ? safeExternalUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`)
    : null
  const canFollow = !authLoading && (!isAuthenticated || user?.role === 'CANDIDATE')
  const isFollowing = followStatus?.is_following ?? false
  const followBusy = followLoading || (user?.role === 'CANDIDATE' && !followStatus && !followError)

  const changeTab = (nextTab: CompanyTab) => {
    setTab(nextTab)
    if (nextTab === 'jobs') {
      setPage(1)
      setJobs(null)
      setJobsError(null)
      setJobsLoading(true)
    }
  }

  const toggleFollow = async () => {
    if (!company || followLoading) return
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (user.role !== 'CANDIDATE') return

    const previousStatus = followStatus
    const previousCount = company.follower_count
    const nextFollowing = !isFollowing
    const nextCount = Math.max(0, previousCount + (nextFollowing ? 1 : -1))
    setFollowLoading(true)
    setFollowError(null)
    setFollowRecord({ company_id: company.id, is_following: nextFollowing, follower_count: nextCount })
    setCompanyRecord({ ...company, follower_count: nextCount })

    try {
      const status = nextFollowing ? await companyService.follow(company.id) : await companyService.unfollow(company.id)
      setFollowRecord(status)
      setCompanyRecord((current) => current?.id === company.id ? { ...current, follower_count: status.follower_count } : current)
      toast.success(nextFollowing ? 'Đã theo dõi công ty.' : 'Đã bỏ theo dõi công ty.')
    } catch {
      setFollowRecord(previousStatus)
      setCompanyRecord((current) => current?.id === company.id ? { ...current, follower_count: previousCount } : current)
      setFollowError('Không thể cập nhật trạng thái theo dõi. Vui lòng thử lại.')
      toast.error('Không thể cập nhật trạng thái theo dõi. Thay đổi đã được hoàn tác.')
    } finally {
      setFollowLoading(false)
    }
  }

  if (!companyId) return null
  if (!company && !error) return <div className="min-h-screen bg-slate-50/70"><CompanyPageSkeleton /></div>
  if (!company) {
    return (
      <main className="min-h-[70vh] bg-slate-50/70 px-4 py-20 text-center">
        <AlertCircle size={42} className="mx-auto text-rose-500" />
        <h1 className="mt-5 text-2xl font-black text-slate-950">{error?.kind === 'not-found' ? 'Không tìm thấy công ty' : 'Không thể hiển thị công ty'}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{error?.message}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/jobs" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"><ArrowLeft size={16} />Xem việc làm</Link>
          {error?.kind !== 'not-found' && <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="btn-press inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#49BBBD] px-4 text-sm font-bold text-white"><RefreshCw size={16} />Thử lại</button>}
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#31999b]">Trang chủ</Link><span>/</span><span aria-current="page" className="truncate font-semibold text-slate-800">{company.name}</span>
        </nav>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" aria-labelledby="company-page-title">
          <div className="h-2 bg-gradient-to-r from-[#49BBBD] via-[#77d3d5] to-teal-100" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <CompanyLogo company={company} />
              <div className="min-w-0 flex-1">
                <h1 id="company-page-title" className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{company.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2"><UsersRound size={16} className="text-[#49BBBD]" /><strong className="tabular-nums text-slate-900">{company.follower_count.toLocaleString('vi-VN')}</strong> người theo dõi</span>
                  {website && <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 font-semibold text-[#31999b] hover:underline"><Globe2 size={16} /><span className="truncate">{externalUrlLabel(website)}</span><ExternalLink size={13} /><span className="sr-only">(mở trong tab mới)</span></a>}
                </div>
                {followError && <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{followError}</p>}
              </div>
              {canFollow && (
                <button type="button" onClick={toggleFollow} disabled={followBusy} aria-pressed={isFollowing} className={`btn-press inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-65 ${isFollowing ? 'border border-[#49BBBD] bg-teal-50 text-[#217f81]' : 'bg-[#49BBBD] text-white hover:bg-[#3CA8AA]'}`}>
                  {followBusy ? <LoaderCircle size={17} className="animate-spin" /> : <span className="text-lg leading-none">{isFollowing ? '✓' : '+'}</span>}
                  {followBusy ? 'Đang tải' : isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-7 border-t border-slate-100 px-6 sm:px-8" role="tablist" aria-label="Nội dung công ty">
            <button type="button" role="tab" aria-selected={tab === 'overview'} onClick={() => changeTab('overview')} className={`relative min-h-14 text-sm font-bold ${tab === 'overview' ? 'text-[#31999b]' : 'text-slate-500 hover:text-slate-800'}`}>Tổng quan{tab === 'overview' && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#49BBBD]" />}</button>
            <button type="button" role="tab" aria-selected={tab === 'jobs'} onClick={() => changeTab('jobs')} className={`relative min-h-14 text-sm font-bold ${tab === 'jobs' ? 'text-[#31999b]' : 'text-slate-500 hover:text-slate-800'}`}>Tin tuyển dụng <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-slate-600">{company.active_job_count}</span>{tab === 'jobs' && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#49BBBD]" />}</button>
          </div>
        </section>

        {tab === 'overview' ? (
          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" role="tabpanel">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8" aria-labelledby="company-introduction-title">
              <h2 id="company-introduction-title" className="text-xl font-black text-slate-950">Giới thiệu công ty</h2>
              {company.description ? <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">{company.description}</p> : <p className="mt-5 text-sm text-slate-500">Công ty chưa cập nhật phần giới thiệu.</p>}
            </section>
            <aside className="space-y-5">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200" aria-labelledby="company-general-title">
                <h2 id="company-general-title" className="text-lg font-black text-slate-950">Thông tin chung</h2>
                <dl className="mt-5 space-y-5 text-sm">
                  <div className="flex gap-3"><Building2 size={19} className="mt-0.5 shrink-0 text-[#49BBBD]" /><div><dt className="text-slate-500">Ngành nghề</dt><dd className="mt-0.5 font-bold text-slate-900">{company.industry || 'Chưa cập nhật'}</dd></div></div>
                  <div className="flex gap-3"><UsersRound size={19} className="mt-0.5 shrink-0 text-[#49BBBD]" /><div><dt className="text-slate-500">Quy mô</dt><dd className="mt-0.5 font-bold text-slate-900">{company.size ? `${company.size.toLocaleString('vi-VN')} nhân sự` : 'Chưa cập nhật'}</dd></div></div>
                  <div className="flex gap-3"><MapPin size={19} className="mt-0.5 shrink-0 text-[#49BBBD]" /><div><dt className="text-slate-500">Địa chỉ</dt><dd className="mt-0.5 break-words font-bold text-slate-900">{company.address || 'Chưa cập nhật'}</dd></div></div>
                </dl>
                {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-teal-200 px-3 text-sm font-bold text-[#31999b] hover:bg-teal-50">Mở trong Google Maps<ExternalLink size={14} /><span className="sr-only">(mở trong tab mới)</span></a>}
              </section>
            </aside>
          </div>
        ) : (
          <section className="mt-7" role="tabpanel" aria-labelledby="company-jobs-title">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#31999b]">Cơ hội nghề nghiệp</p><h2 id="company-jobs-title" className="mt-1 text-2xl font-black text-slate-950">Tin tuyển dụng đang mở</h2></div>
              {jobs && <span className="text-sm text-slate-500"><strong className="tabular-nums text-slate-900">{jobs.total}</strong> tin</span>}
            </div>

            {jobsLoading && !jobs ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" /><div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" /></div>
            ) : jobsError ? (
              <div role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200"><AlertCircle className="mx-auto text-rose-500" /><h3 className="mt-3 font-bold text-slate-950">Không thể tải tin tuyển dụng</h3><p className="mt-1 text-sm text-slate-500">{jobsError}</p><button type="button" onClick={() => { setJobsLoading(true); setJobsError(null); setJobsReloadKey((value) => value + 1) }} className="btn-press mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#49BBBD] px-4 text-sm font-bold text-white"><RefreshCw size={15} />Thử lại</button></div>
            ) : jobs?.items.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><BriefcaseBusiness size={38} className="mx-auto text-slate-300" /><h3 className="mt-4 text-lg font-bold text-slate-950">Chưa có tin tuyển dụng đang mở</h3><p className="mt-2 text-sm text-slate-500">Hãy quay lại sau để xem những cơ hội mới từ công ty.</p></div>
            ) : jobs ? (
              <>
                <div className={`mt-6 grid gap-5 md:grid-cols-2 ${jobsLoading ? 'opacity-60' : ''}`} aria-busy={jobsLoading}>{jobs.items.map((job) => <CompanyJobCard key={job.id} job={job} />)}</div>
                {jobs.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang việc làm của công ty"><button type="button" onClick={() => { setJobsLoading(true); setPage((value) => value - 1) }} disabled={page <= 1 || jobsLoading} className="btn-press inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 disabled:opacity-40"><ArrowLeft size={16} />Trước</button><span className="text-sm text-slate-500">Trang <strong className="tabular-nums text-slate-950">{jobs.page}</strong> / {jobs.total_pages}</span><button type="button" onClick={() => { setJobsLoading(true); setPage((value) => value + 1) }} disabled={page >= jobs.total_pages || jobsLoading} className="btn-press inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 disabled:opacity-40">Sau<ArrowRight size={16} /></button></nav>}
              </>
            ) : null}
          </section>
        )}
      </main>
    </div>
  )
}
