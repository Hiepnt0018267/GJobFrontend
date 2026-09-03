import { AlertCircle, ArrowLeft, BriefcaseBusiness, CalendarClock, FileText, MapPin, RefreshCw, Undo2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import CandidateApplicationStatusBadge from '../../components/candidate/CandidateApplicationStatusBadge'
import CandidateWithdrawDialog from '../../components/candidate/CandidateWithdrawDialog'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { applicationService } from '../../services/applicationService'
import type { CandidateApplicationDetail } from '../../types/application'
import { candidateApplicationErrorMessage } from '../../utils/apiError'
import { canWithdrawApplication } from '../../utils/applicationDisplay'
import { formatJobTimestamp, workModeLabel } from '../../utils/jobDisplay'

function DetailSkeleton() {
  return <div className="mt-6 space-y-6" aria-busy="true" aria-label="Đang tải chi tiết đơn ứng tuyển"><div className="h-36 animate-pulse rounded-2xl bg-slate-200" /><div className="grid gap-5 lg:grid-cols-2"><div className="h-52 animate-pulse rounded-2xl bg-slate-200" /><div className="h-52 animate-pulse rounded-2xl bg-slate-200" /></div></div>
}

function getReturnPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('returnTo' in state)) return '/candidate/applications'
  const value = state.returnTo
  return typeof value === 'string' && value.startsWith('/candidate/applications') ? value : '/candidate/applications'
}

export default function CandidateApplicationDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const refreshVersion = useDataRefreshVersion()
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const returnTo = useMemo(() => getReturnPath(location.state), [location.state])
  const fetcher = useCallback((signal: AbortSignal) => id ? applicationService.getApplicationById(id, signal) : Promise.reject(new Error('Missing application id')), [id])
  const { data: application, error, isFetching, isInitialLoading, refetch, replaceData } = usePaginatedQuery<CandidateApplicationDetail>({ queryKey: id, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? candidateApplicationErrorMessage(error, 'detail') : null

  const withdraw = async () => {
    if (!application) return
    const updatedApplication = await applicationService.withdrawApplication(application.id)
    replaceData(updatedApplication)
    setNotice('Đơn ứng tuyển của bạn đã được rút. Bạn không thể ứng tuyển lại công việc này trong phiên bản hiện tại.')
  }

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><Link to={returnTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Đơn ứng tuyển của tôi</Link>{isInitialLoading ? <DetailSkeleton /> : !application && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={34} aria-hidden="true" /><h1 className="mt-4 text-xl font-bold text-slate-950">Không thể tải chi tiết đơn ứng tuyển.</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to={returnTo} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại danh sách</Link><button type="button" onClick={refetch} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} aria-hidden="true" />Thử lại</button></div></section> : application ? <div className="mt-6 space-y-6"><header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-slate-950">Đơn ứng tuyển</h1><CandidateApplicationStatusBadge status={application.status} /></div><p className="mt-2 text-sm leading-6 text-slate-600">Theo dõi thông tin công việc và CV đang được liên kết với đơn này.</p></div>{canWithdrawApplication(application.status) && <button type="button" onClick={() => setIsWithdrawDialogOpen(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"><Undo2 size={16} aria-hidden="true" />Rút đơn ứng tuyển</button>}</div><div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarClock size={16} aria-hidden="true" />Nộp {formatJobTimestamp(application.created_at)}</span><span className="inline-flex items-center gap-1.5"><RefreshCw size={16} aria-hidden="true" />Cập nhật {formatJobTimestamp(application.updated_at)}</span></div></header>{notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">{notice}</p>}<QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} /><section className="grid gap-5 lg:grid-cols-2" aria-label="Thông tin công việc và CV"><article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><BriefcaseBusiness size={21} aria-hidden="true" /></span><h2 className="mt-5 text-lg font-bold text-slate-950">Công việc</h2><h3 className="mt-3 break-words text-xl font-bold text-slate-950">{application.job.title}</h3><p className="mt-1 break-words text-sm font-semibold text-blue-700">{application.job.company_name}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><MapPin size={15} className="text-slate-400" aria-hidden="true" />{application.job.location || 'Chưa cập nhật địa điểm'}</span><span>{workModeLabel(application.job.work_mode)}</span></div><Link to={`/jobs/${application.job_id}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900">Xem công việc <ArrowLeft size={15} className="rotate-180" aria-hidden="true" /></Link></article><article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><FileText size={21} aria-hidden="true" /></span><h2 className="mt-5 text-lg font-bold text-slate-950">CV đã sử dụng</h2><h3 className="mt-3 break-words text-xl font-bold text-slate-950">{application.cv.title}</h3><p className="mt-1 text-sm text-slate-600">Mẫu: {application.cv.template.name}</p><p className="mt-4 text-sm leading-6 text-slate-500">CV hiển thị là phiên bản hiện tại trong hồ sơ của bạn.</p><Link to={`/candidate/cvs/${application.cv_id}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900">Xem CV <ArrowLeft size={15} className="rotate-180" aria-hidden="true" /></Link></article></section>{isWithdrawDialogOpen && <CandidateWithdrawDialog jobTitle={application.job.title} onClose={() => setIsWithdrawDialogOpen(false)} onConfirm={withdraw} />}</div> : null}</main>
}
