import { AlertCircle, ArrowLeft, CalendarClock, FileText, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminApplicationStatusBadge from '../../components/admin/audit/AdminApplicationStatusBadge'
import AdminCVPreviewReadOnly from '../../components/admin/audit/AdminCVPreviewReadOnly'
import AdminUserAvatar from '../../components/admin/users/AdminUserAvatar'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { adminAuditService } from '../../services/adminAuditService'
import type { AdminAuditApplicationDetail } from '../../types/adminAudit'
import { adminAuditErrorMessage, getApiErrorStatus } from '../../utils/apiError'
import { formatJobTimestamp } from '../../utils/jobDisplay'

function getReturnTo(state: unknown) {
  return state && typeof state === 'object' && 'returnTo' in state && typeof state.returnTo === 'string' ? state.returnTo : '/admin/applications'
}

function DetailSkeleton() {
  return <div className="space-y-6" aria-busy="true" aria-label="Đang tải chi tiết đơn ứng tuyển"><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /><div className="h-80 animate-pulse rounded-2xl bg-slate-200" /><div className="h-[580px] animate-pulse rounded-2xl bg-slate-200" /></div>
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const refreshVersion = useDataRefreshVersion()
  const [application, setApplication] = useState<AdminAuditApplicationDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [requestVersion, setRequestVersion] = useState(0)
  const keepVisible = useRef(false)
  const returnTo = getReturnTo(location.state)

  useEffect(() => {
    let active = true
    const preserveData = keepVisible.current
    keepVisible.current = false
    Promise.resolve().then(() => {
      if (!preserveData) setIsLoading(true)
      setError(null)
      setIsNotFound(false)
      if (!id) throw new Error('missing-application-id')
      return adminAuditService.getApplication(id)
    }).then((response) => { if (active && response) setApplication(response) }).catch((requestError: unknown) => {
      if (!active) return
      setIsNotFound(requestError instanceof Error && requestError.message === 'missing-application-id' || getApiErrorStatus(requestError) === 404)
      setError(requestError instanceof Error && requestError.message === 'missing-application-id' ? 'Đơn ứng tuyển không còn tồn tại.' : adminAuditErrorMessage(requestError, 'detail', 'application'))
    }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [id, refreshVersion, requestVersion])

  const reload = (preserveData = false) => {
    keepVisible.current = preserveData
    setRequestVersion((version) => version + 1)
  }

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><Link to={returnTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Quay lại danh sách</Link>{isLoading && !application && <div className="mt-6"><DetailSkeleton /></div>}{!isLoading && error && !application && <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={34} aria-hidden="true" /><h1 className="mt-4 text-xl font-bold text-slate-950">{isNotFound ? 'Đơn ứng tuyển không còn tồn tại.' : 'Không thể tải chi tiết đơn ứng tuyển.'}</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{error}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to={returnTo} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại danh sách</Link>{!isNotFound && <button type="button" onClick={() => reload()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} aria-hidden="true" />Thử lại</button>}</div></section>}{application && <div className="mt-6 space-y-6"><header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-slate-950">Đơn ứng tuyển</h1><AdminApplicationStatusBadge status={application.status} /></div><p className="mt-2 text-sm leading-6 text-slate-600">Dữ liệu candidate, công việc và CV bên dưới là dữ liệu hiện hành, không phải bản snapshot tại thời điểm nộp đơn.</p></div><span className="inline-flex items-center gap-1.5 text-sm text-slate-500"><CalendarClock size={16} aria-hidden="true" />Nộp {formatJobTimestamp(application.created_at)}</span></div></header><section className="grid gap-5 lg:grid-cols-3" aria-label="Thông tin liên quan"><article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Ứng viên</p><div className="mt-4 flex items-center gap-3"><AdminUserAvatar name={application.candidate.full_name} url={application.candidate.avatar_url} size="lg" /><div className="min-w-0"><Link to={`/admin/users/${application.candidate_id}`} className="block break-words font-bold text-slate-950 hover:text-blue-700">{application.candidate.full_name}</Link><p className="mt-1 break-all text-sm text-slate-500">{application.candidate.email}</p></div></div><Link to={`/admin/users/${application.candidate_id}`} className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">Mở hồ sơ ứng viên</Link></article><article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Công việc</p><Link to={`/admin/jobs/${application.job_id}`} className="mt-4 block break-words text-lg font-bold text-slate-950 hover:text-blue-700">{application.job.title}</Link><p className="mt-1 break-words text-sm text-slate-600">{application.job.company_name}</p><Link to={`/admin/jobs/${application.job_id}`} className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">Mở tin tuyển dụng</Link></article><article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">CV đã chọn</p><Link to={`/admin/cvs/${application.cv_id}`} className="mt-4 inline-flex items-start gap-2 break-words text-lg font-bold text-slate-950 hover:text-blue-700"><FileText size={20} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />{application.cv.title}</Link><p className="mt-2 text-sm text-slate-600">Mẫu: {application.cv.template.name}</p><Link to={`/admin/cvs/${application.cv_id}`} className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">Mở CV ứng viên</Link></article></section><section aria-labelledby="application-cv-preview"><div className="mb-4 flex items-center justify-between gap-4"><div><h2 id="application-cv-preview" className="text-xl font-bold text-slate-950">Xem CV</h2><p className="mt-1 text-sm text-slate-500">Bản xem chỉ đọc theo mẫu đang được tham chiếu.</p></div><span className="text-sm text-slate-500">Cập nhật {formatJobTimestamp(application.updated_at)}</span></div><AdminCVPreviewReadOnly cv={application.cv} /></section></div>}</main></div>
}
