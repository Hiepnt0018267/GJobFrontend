import { AlertCircle, ArrowLeft, BriefcaseBusiness, CalendarClock, Mail, MapPin, Phone, RefreshCw, UserRound } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import RecruiterApplicationActionDialog from '../../components/recruiter/RecruiterApplicationActionDialog'
import RecruiterApplicationAvatar from '../../components/recruiter/RecruiterApplicationAvatar'
import RecruiterApplicationStatusBadge from '../../components/recruiter/RecruiterApplicationStatusBadge'
import RecruiterCVPreviewReadOnly from '../../components/recruiter/RecruiterCVPreviewReadOnly'
import JobStatusBadge from '../../components/recruiter/JobStatusBadge'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { recruiterApplicationService } from '../../services/recruiterApplicationService'
import type { RecruiterApplicationDetail } from '../../types/recruiterApplication'
import { getApiErrorStatus, recruiterApplicationErrorMessage } from '../../utils/apiError'
import { notifyDataRefresh } from '../../utils/dataRefresh'
import { availableRecruiterApplicationActions, type RecruiterApplicationAction } from '../../utils/recruiterApplicationDisplay'
import { formatJobTimestamp, workModeLabel } from '../../utils/jobDisplay'

type Notice = { tone: 'success' | 'warning' | 'error'; message: string }

function DetailSkeleton() {
  return <div className="mt-6 space-y-6" aria-busy="true" aria-label="Đang tải chi tiết ứng viên">
    <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="h-[580px] animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  </div>
}

function getReturnTo(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('returnTo' in state)) return '/recruiter/applications'
  const value = state.returnTo
  return typeof value === 'string' && (value.startsWith('/recruiter/applications') || /^\/recruiter\/jobs\/[^/]+\/applications(?:\?|$)/.test(value))
    ? value
    : '/recruiter/applications'
}

function terminalMessage(status: RecruiterApplicationDetail['status']): string | null {
  if (status === 'HIRED') return 'Ứng viên đã được tuyển. Đơn ứng tuyển này chỉ còn ở chế độ xem.'
  if (status === 'REJECTED') return 'Ứng viên đã bị từ chối. Đơn ứng tuyển này chỉ còn ở chế độ xem.'
  if (status === 'WITHDRAWN') return 'Ứng viên đã rút đơn và không thể tiếp tục xử lý.'
  return null
}

export default function RecruiterApplicationDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const refreshVersion = useDataRefreshVersion()
  const [dialogAction, setDialogAction] = useState<Extract<RecruiterApplicationAction, 'reject' | 'hire'> | null>(null)
  const [busyAction, setBusyAction] = useState<RecruiterApplicationAction | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const returnTo = useMemo(() => getReturnTo(location.state), [location.state])
  const fetcher = useCallback((signal: AbortSignal) => id ? recruiterApplicationService.getApplicationById(id, signal) : Promise.reject(new Error('missing-application-id')), [id])
  const { data: application, error, isFetching, isInitialLoading, refetch, replaceData } = usePaginatedQuery<RecruiterApplicationDetail>({ queryKey: id, refreshKey: refreshVersion, fetcher })
  const errorMessage = error ? recruiterApplicationErrorMessage(error, 'detail') : null
  const isNotFound = getApiErrorStatus(error) === 404 || error instanceof Error && error.message === 'missing-application-id'

  const transition = async (action: RecruiterApplicationAction, reportInDialog = false) => {
    if (!application) return
    setBusyAction(action)
    setNotice(null)
    try {
      const nextApplication = action === 'review'
        ? await recruiterApplicationService.reviewApplication(application.id)
        : action === 'shortlist'
          ? await recruiterApplicationService.shortlistApplication(application.id)
          : action === 'reject'
            ? await recruiterApplicationService.rejectApplication(application.id)
            : await recruiterApplicationService.hireApplication(application.id)
      replaceData(nextApplication)
      notifyDataRefresh({ local: false })
      setNotice({
        tone: 'success',
        message: action === 'review'
          ? 'Đơn ứng tuyển đã chuyển sang Đang xem xét.'
          : action === 'shortlist'
            ? 'Ứng viên đã được đưa vào danh sách ngắn.'
            : action === 'reject'
              ? 'Ứng viên đã bị từ chối.'
              : 'Ứng viên đã được tuyển.',
      })
    } catch (requestError: unknown) {
      if (getApiErrorStatus(requestError) === 409) {
        setNotice({ tone: 'warning', message: 'Trạng thái đơn ứng tuyển đã thay đổi. Đang tải lại dữ liệu mới nhất.' })
        refetch()
        return
      }
      if (reportInDialog) throw requestError
      setNotice({ tone: 'error', message: recruiterApplicationErrorMessage(requestError, 'action') })
    } finally {
      setBusyAction(null)
    }
  }

  const actions = application ? availableRecruiterApplicationActions(application.status) : []
  const terminal = application ? terminalMessage(application.status) : null
  const noticeClass = notice?.tone === 'success'
    ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
    : notice?.tone === 'warning'
      ? 'bg-amber-50 text-amber-900 ring-amber-200'
      : 'bg-red-50 text-red-700 ring-red-100'

  return <div className="min-h-screen bg-slate-50">
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to={returnTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Quay lại danh sách ứng viên</Link>

      {isInitialLoading ? <DetailSkeleton /> : !application && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200">
        <AlertCircle className="mx-auto text-red-600" size={34} aria-hidden="true" />
        <h1 className="mt-4 text-xl font-bold text-slate-950">{isNotFound ? 'Không tìm thấy đơn ứng tuyển hoặc bạn không có quyền truy cập.' : 'Không thể tải chi tiết ứng viên.'}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={returnTo} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại danh sách</Link>
          {!isNotFound && <button type="button" onClick={refetch} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} aria-hidden="true" />Thử lại</button>}
        </div>
      </section> : application ? <div className="mt-6 space-y-6">
        <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex min-w-0 gap-4">
              <RecruiterApplicationAvatar name={application.candidate.full_name} url={application.candidate.avatar_url} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3"><h1 className="break-words text-2xl font-bold tracking-tight text-slate-950">{application.candidate.full_name}</h1><RecruiterApplicationStatusBadge status={application.status} /></div>
                <p className="mt-2 break-words text-sm font-semibold text-blue-700">{application.job.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Hồ sơ ứng tuyển và CV hiện tại được liên kết với đơn này.</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-slate-500"><CalendarClock size={16} aria-hidden="true" />Nộp {formatJobTimestamp(application.created_at)}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500"><span>Cập nhật {formatJobTimestamp(application.updated_at)}</span><span>CV có thể thay đổi nếu ứng viên cập nhật hồ sơ.</span></div>
        </header>

        {notice && <p role="status" className={`motion-error rounded-xl px-4 py-3 text-sm font-medium ring-1 ${noticeClass}`}>{notice.message}</p>}
        <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />

        <section aria-label="CV và thông tin ứng viên">
          <div className="mb-4"><h2 className="text-xl font-bold text-slate-950">CV ứng viên</h2><p className="mt-1 text-sm text-slate-500">Bản xem chỉ đọc của CV được nộp cùng đơn ứng tuyển.</p></div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <article className="min-w-0"><RecruiterCVPreviewReadOnly cv={application.cv} /></article>

          <aside className="order-first space-y-5 lg:order-last">
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><UserRound size={16} aria-hidden="true" />Ứng viên</div>
              <div className="mt-4 space-y-3 text-sm">
                <p className="font-bold text-slate-950">{application.candidate.full_name}</p>
                <a href={`mailto:${application.candidate.email}`} className="flex break-all text-slate-600 hover:text-blue-700"><Mail size={16} className="mr-2 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />{application.candidate.email}</a>
                {application.candidate.phone && <a href={`tel:${application.candidate.phone}`} className="flex text-slate-600 hover:text-blue-700"><Phone size={16} className="mr-2 shrink-0 text-slate-400" aria-hidden="true" />{application.candidate.phone}</a>}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><BriefcaseBusiness size={16} aria-hidden="true" />Công việc</div>
              <Link to={`/recruiter/jobs/${application.job_id}`} className="mt-4 block break-words text-lg font-bold text-slate-950 hover:text-blue-700">{application.job.title}</Link>
              <p className="mt-1 break-words text-sm text-slate-600">{application.job.company_name}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600"><JobStatusBadge status={application.job.status} /><p className="flex items-center gap-1.5"><MapPin size={15} className="text-slate-400" aria-hidden="true" />{application.job.location || 'Chưa cập nhật địa điểm'}</p><p>{workModeLabel(application.job.work_mode)}</p></div>
              <Link to={`/recruiter/jobs/${application.job_id}`} className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">Xem tin tuyển dụng</Link>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-base font-bold text-slate-950">Thao tác tuyển dụng</h2>
              {terminal ? <p className="mt-3 text-sm leading-6 text-slate-600">{terminal}</p> : <div className="mt-4 space-y-3">
                {actions.includes('review') && <button type="button" disabled={busyAction === 'review'} onClick={() => void transition('review')} className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{busyAction === 'review' ? 'Đang cập nhật…' : 'Bắt đầu xem xét'}</button>}
                {actions.includes('shortlist') && <button type="button" disabled={busyAction === 'shortlist'} onClick={() => void transition('shortlist')} className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60">{busyAction === 'shortlist' ? 'Đang cập nhật…' : 'Đưa vào danh sách ngắn'}</button>}
                {actions.includes('hire') && <button type="button" disabled={busyAction === 'hire'} onClick={() => setDialogAction('hire')} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">Tuyển ứng viên</button>}
                {actions.includes('reject') && <button type="button" disabled={busyAction === 'reject'} onClick={() => setDialogAction('reject')} className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60">Từ chối</button>}
              </div>}
            </article>
            </aside>
          </div>
        </section>

        {dialogAction && <RecruiterApplicationActionDialog action={dialogAction} candidateName={application.candidate.full_name} onClose={() => setDialogAction(null)} onConfirm={() => transition(dialogAction, true)} />}
      </div> : null}
    </main>
  </div>
}
