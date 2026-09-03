import { AlertCircle, ArrowLeft, CalendarClock, RefreshCw, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminCVPreviewReadOnly from '../../components/admin/audit/AdminCVPreviewReadOnly'
import AdminUserAvatar from '../../components/admin/users/AdminUserAvatar'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { adminAuditService } from '../../services/adminAuditService'
import type { AdminAuditCVDetail } from '../../types/adminAudit'
import { adminAuditErrorMessage, getApiErrorStatus } from '../../utils/apiError'
import { formatJobTimestamp } from '../../utils/jobDisplay'

function getReturnTo(state: unknown) {
  return state && typeof state === 'object' && 'returnTo' in state && typeof state.returnTo === 'string' ? state.returnTo : '/admin/cvs'
}

function DetailSkeleton() {
  return <div className="space-y-6" aria-busy="true" aria-label="Đang tải chi tiết CV"><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /><div className="h-32 animate-pulse rounded-2xl bg-slate-200" /><div className="h-[620px] animate-pulse rounded-2xl bg-slate-200" /></div>
}

export default function AdminCandidateCVDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const refreshVersion = useDataRefreshVersion()
  const [cv, setCV] = useState<AdminAuditCVDetail | null>(null)
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
      if (!id) throw new Error('missing-cv-id')
      return adminAuditService.getCandidateCV(id)
    }).then((response) => { if (active && response) setCV(response) }).catch((requestError: unknown) => {
      if (!active) return
      setIsNotFound(requestError instanceof Error && requestError.message === 'missing-cv-id' || getApiErrorStatus(requestError) === 404)
      setError(requestError instanceof Error && requestError.message === 'missing-cv-id' ? 'CV ứng viên không còn tồn tại.' : adminAuditErrorMessage(requestError, 'detail', 'cv'))
    }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [id, refreshVersion, requestVersion])

  const reload = (preserveData = false) => {
    keepVisible.current = preserveData
    setRequestVersion((version) => version + 1)
  }

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><Link to={returnTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Quay lại danh sách</Link>{isLoading && !cv && <div className="mt-6"><DetailSkeleton /></div>}{!isLoading && error && !cv && <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={34} aria-hidden="true" /><h1 className="mt-4 text-xl font-bold text-slate-950">{isNotFound ? 'CV ứng viên không còn tồn tại.' : 'Không thể tải chi tiết CV.'}</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{error}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to={returnTo} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại danh sách</Link>{!isNotFound && <button type="button" onClick={() => reload()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} aria-hidden="true" />Thử lại</button>}</div></section>}{cv && <div className="mt-6 space-y-6"><header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-3"><h1 className="break-words text-2xl font-bold tracking-tight text-slate-950">{cv.title}</h1>{cv.is_default && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-200"><Star size={13} aria-hidden="true" />CV mặc định</span>}</div><p className="mt-2 text-sm leading-6 text-slate-600">Bản xem chỉ đọc. Không có thao tác thay đổi CV, thông tin ứng viên hoặc mẫu CV từ màn này.</p></div><span className="inline-flex items-center gap-1.5 text-sm text-slate-500"><CalendarClock size={16} aria-hidden="true" />Cập nhật {formatJobTimestamp(cv.updated_at)}</span></div></header><section className="grid gap-5 md:grid-cols-2" aria-label="Thông tin CV"><article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Chủ sở hữu</p><div className="mt-4 flex items-center gap-3"><AdminUserAvatar name={cv.candidate.full_name} url={cv.candidate.avatar_url} size="lg" /><div className="min-w-0"><Link to={`/admin/users/${cv.candidate_id}`} className="block break-words font-bold text-slate-950 hover:text-blue-700">{cv.candidate.full_name}</Link><p className="mt-1 break-all text-sm text-slate-500">{cv.candidate.email}</p></div></div><Link to={`/admin/users/${cv.candidate_id}`} className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">Mở hồ sơ ứng viên</Link></article><article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-500">Mẫu CV đang tham chiếu</p><p className="mt-4 break-words text-lg font-bold text-slate-950">{cv.template.name}</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{cv.template.layout_key}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cv.template.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{cv.template.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></div><p className="mt-5 text-sm leading-6 text-slate-500">Thông tin mẫu được giữ để xem CV lịch sử. Mẫu có thể không còn trang quản lý riêng nếu đã được lưu trữ.</p></article></section><section aria-labelledby="cv-audit-preview"><div className="mb-4"><h2 id="cv-audit-preview" className="text-xl font-bold text-slate-950">Nội dung CV</h2><p className="mt-1 text-sm text-slate-500">Hiển thị theo layout và theme của mẫu được API trả về.</p></div><AdminCVPreviewReadOnly cv={cv} /></section></div>}</main></div>
}
