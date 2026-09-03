import { AlertCircle, BriefcaseBusiness, CheckCircle2, Loader2, LogIn } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { applicationService } from '../../services/applicationService'
import type { AppliedStatusResponse, JobApplication } from '../../types/application'
import type { Job } from '../../types/job'
import { applicationStatusLabels } from '../../utils/applicationDisplay'
import JobApplicationDialog from './JobApplicationDialog'

type Props = { job: Pick<Job, 'id' | 'title' | 'company_name' | 'status'> }

export default function JobApplyAction({ job }: Props) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const refreshVersion = useDataRefreshVersion()
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false)
  const [appliedStatus, setAppliedStatus] = useState<AppliedStatusResponse | null>(null)
  const [isCheckingAppliedStatus, setIsCheckingAppliedStatus] = useState(false)
  const [hasResolvedAppliedStatus, setHasResolvedAppliedStatus] = useState(false)
  const [appliedStatusError, setAppliedStatusError] = useState<string | null>(null)
  const [appliedStatusRetry, setAppliedStatusRetry] = useState(0)
  const [applicationNotice, setApplicationNotice] = useState<string | null>(null)

  const isCandidate = user?.role === 'CANDIDATE'
  const isApplyable = job.status === 'APPROVED'
  const loadAppliedStatus = useCallback(async (signal: AbortSignal) => {
    const response = await applicationService.getApplicationByJob(job.id, signal)
    return response
  }, [job.id])

  useEffect(() => {
    if (!isCandidate) return
    const controller = new AbortController()
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return null
      setIsCheckingAppliedStatus(true)
      setHasResolvedAppliedStatus(false)
      setAppliedStatusError(null)
      return loadAppliedStatus(controller.signal)
    })
      .then((response) => { if (!controller.signal.aborted && response) setAppliedStatus(response) })
      .catch(() => { if (!controller.signal.aborted) setAppliedStatusError('Không thể xác nhận trạng thái đơn ứng tuyển. Vui lòng thử lại.') })
      .finally(() => { if (!controller.signal.aborted) { setIsCheckingAppliedStatus(false); setHasResolvedAppliedStatus(true) } })
    return () => controller.abort()
  }, [appliedStatusRetry, isCandidate, loadAppliedStatus, refreshVersion])

  const openApplyFlow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location, resumeApplicationJobId: job.id } })
      return
    }
    if (isCandidate && isApplyable && !appliedStatus?.has_applied) setIsApplicationDialogOpen(true)
  }
  const resumeApplicationJobId = (location.state as { resumeApplicationJobId?: string } | null)?.resumeApplicationJobId
  const shouldResumeApplication = resumeApplicationJobId === job.id && isAuthenticated && isCandidate && isApplyable && hasResolvedAppliedStatus && !appliedStatusError && !appliedStatus?.has_applied
  const clearResumeApplication = () => {
    if (resumeApplicationJobId === job.id) navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: null })
  }
  const closeApplicationDialog = () => {
    setIsApplicationDialogOpen(false)
    clearResumeApplication()
  }
  const handleCreateCV = () => {
    closeApplicationDialog()
    navigate('/candidate/cvs/templates')
  }
  const handleSuccess = (application: JobApplication, message: string) => {
    closeApplicationDialog()
    setAppliedStatus({ has_applied: true, application })
    setAppliedStatusError(null)
    setApplicationNotice(message)
  }
  const reconcileAppliedStatus = () => {
    closeApplicationDialog()
    setAppliedStatus(null)
    setAppliedStatusError(null)
    setAppliedStatusRetry((value) => value + 1)
  }
  const currentApplicationStatus = appliedStatus?.application?.status

  if (loading) return <aside className="h-fit rounded-2xl bg-slate-100 p-6"><div className="h-24 animate-pulse rounded-xl bg-slate-200" /></aside>
  if (isAuthenticated && !isCandidate) return <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold text-slate-900">Thông tin vị trí</h2><p className="mt-2 text-sm leading-6 text-slate-600">Bạn đang xem vị trí tuyển dụng công khai.</p></aside>

  const applicationState = !isCandidate ? !isApplyable ? <p className="mt-2 text-sm leading-6 text-slate-600">Tin tuyển dụng này hiện không còn nhận ứng tuyển.</p> : <><p className="mt-2 text-sm leading-6 text-slate-600">Chọn CV phù hợp và gửi đơn ứng tuyển trực tiếp đến nhà tuyển dụng.</p><button type="button" onClick={openApplyFlow} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><BriefcaseBusiness size={17} />Ứng tuyển ngay</button></> : !appliedStatus && isCheckingAppliedStatus ? <><p className="mt-2 text-sm leading-6 text-slate-600">Đang kiểm tra trạng thái đơn ứng tuyển của bạn.</p><button type="button" disabled className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"><Loader2 size={17} className="animate-spin" aria-hidden="true" />Đang kiểm tra...</button></> : !appliedStatus && appliedStatusError ? <><div role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-900 ring-1 ring-amber-100"><AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />{appliedStatusError}</div><button type="button" onClick={() => setAppliedStatusRetry((value) => value + 1)} className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-900">Thử lại</button></> : appliedStatus?.has_applied && currentApplicationStatus ? <><div className={`mt-4 flex items-center gap-2 text-sm font-semibold ${currentApplicationStatus === 'WITHDRAWN' ? 'text-slate-700' : 'text-emerald-700'}`}><CheckCircle2 size={18} />{currentApplicationStatus === 'WITHDRAWN' ? applicationStatusLabels.WITHDRAWN : applicationStatusLabels.SUBMITTED}</div><p className="mt-2 text-sm leading-6 text-slate-600">{applicationNotice || (currentApplicationStatus === 'WITHDRAWN' ? 'Đơn ứng tuyển này đã được rút và không thể gửi lại.' : `Trạng thái hiện tại: ${applicationStatusLabels[currentApplicationStatus]}.`)}</p></> : !isApplyable ? <p className="mt-2 text-sm leading-6 text-slate-600">Tin tuyển dụng này hiện không còn nhận ứng tuyển.</p> : <><p className="mt-2 text-sm leading-6 text-slate-600">Chọn CV phù hợp và gửi đơn ứng tuyển trực tiếp đến nhà tuyển dụng.</p><button type="button" onClick={openApplyFlow} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><BriefcaseBusiness size={17} />Ứng tuyển ngay</button></>

  return <><aside className="h-fit rounded-2xl bg-blue-50 p-6 ring-1 ring-blue-100"><h2 className="font-semibold text-slate-900">Quan tâm đến vị trí này?</h2>{isAuthenticated && !isCandidate ? <p className="mt-2 text-sm leading-6 text-slate-600">Bạn đang xem vị trí tuyển dụng công khai.</p> : applicationState}{!isAuthenticated && isApplyable && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><LogIn size={14} />Bạn sẽ được đưa đến trang đăng nhập.</p>}</aside>{(isApplicationDialogOpen || shouldResumeApplication) && <JobApplicationDialog jobId={job.id} jobTitle={job.title} companyName={job.company_name} onClose={closeApplicationDialog} onSuccess={handleSuccess} onDuplicateApplication={reconcileAppliedStatus} onCreateCV={handleCreateCV} />}</>
}
