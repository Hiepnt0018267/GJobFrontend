import { AlertCircle, ArrowLeft, CalendarClock, FileText, LoaderCircle, Pencil, SlidersHorizontal, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminCVTemplateActions from '../../components/admin/cv-templates/AdminCVTemplateActions'
import { AdminCVTemplateFeaturedBadge, AdminCVTemplateLayoutBadge, AdminCVTemplateStatusBadge } from '../../components/admin/cv-templates/AdminCVTemplateBadges'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { adminCVTemplateService } from '../../services/adminCVTemplateService'
import type { AdminCVTemplate } from '../../types/adminCVTemplate'
import { adminCVTemplateErrorMessage } from '../../utils/apiError'

type LocationState = { returnTo?: string }
const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export default function AdminCVTemplateDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const refreshVersion = useDataRefreshVersion()
  const [template, setTemplate] = useState<AdminCVTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const requestId = useRef(0)
  const returnTo = (location.state as LocationState | null)?.returnTo || '/admin/cv-templates'

  const load = useCallback(() => {
    if (!id) return
    const currentRequest = ++requestId.current
    void adminCVTemplateService.getAdminCVTemplate(id).then((response) => {
      if (currentRequest !== requestId.current) return
      setTemplate(response)
      setError(null)
    }).catch((requestError) => {
      if (currentRequest === requestId.current) setError(adminCVTemplateErrorMessage(requestError, 'detail'))
    }).finally(() => {
      if (currentRequest === requestId.current) setLoading(false)
    })
  }, [id])

  useEffect(() => { load() }, [id, refreshVersion, retry, load])
  const changed = (updated: AdminCVTemplate, action: 'activate' | 'deactivate' | 'feature' | 'unfeature') => {
    setTemplate(updated)
    setNotice(action === 'deactivate' ? 'Đã ngừng hoạt động mẫu CV; các CV đã dùng mẫu này vẫn được giữ nguyên.' : action === 'activate' ? 'Mẫu CV đã được kích hoạt.' : action === 'feature' ? 'Đã đánh dấu mẫu CV nổi bật.' : 'Đã bỏ đánh dấu nổi bật.')
  }

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><Link to={returnTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />Quản lý mẫu CV</Link>{loading && <div className="flex min-h-96 items-center justify-center"><LoaderCircle className="animate-spin text-blue-700" /></div>}{!loading && error && <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" /><h1 className="mt-4 text-xl font-bold text-slate-950">Không thể mở mẫu CV</h1><p className="mt-2 text-sm text-slate-600">{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Thử lại</button></section>}{!loading && template && <><header className="mt-5 overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-8"><div className="grid gap-6 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center"><div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15"><FileText className="absolute text-slate-300" size={34} />{template.thumbnail_url && <img src={template.thumbnail_url} alt="" className="relative h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} />}</div><div><div className="flex flex-wrap gap-2"><AdminCVTemplateLayoutBadge layoutKey={template.layout_key} /><AdminCVTemplateStatusBadge active={template.is_active} /><AdminCVTemplateFeaturedBadge featured={template.is_featured} /></div><h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{template.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{template.description || 'Chưa có mô tả cho mẫu CV này.'}</p></div><Link to={`/admin/cv-templates/${template.id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"><Pencil size={16} />Chỉnh sửa</Link></div></header>{notice && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">{notice}</p>}<div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><h2 className="text-lg font-bold text-slate-950">Thông tin mẫu</h2><dl className="mt-5 divide-y divide-slate-100"><div className="flex items-center justify-between gap-4 py-4"><dt className="inline-flex items-center gap-2 text-sm text-slate-500"><SlidersHorizontal size={16} />Thứ tự hiển thị</dt><dd className="text-sm font-semibold text-slate-900">{template.sort_order}</dd></div><div className="flex items-center justify-between gap-4 py-4"><dt className="inline-flex items-center gap-2 text-sm text-slate-500"><UsersRound size={16} />Đang sử dụng</dt><dd className="text-sm font-semibold text-slate-900">{template.usage_count} CV</dd></div><div className="flex items-center justify-between gap-4 py-4"><dt className="inline-flex items-center gap-2 text-sm text-slate-500"><CalendarClock size={16} />Cập nhật lúc</dt><dd className="text-right text-sm font-semibold text-slate-900">{formatDate(template.updated_at)}</dd></div></dl></section><aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Thao tác</h2><p className="mt-2 text-sm leading-6 text-slate-600">Các thay đổi trạng thái có hiệu lực ngay sau khi xác nhận.</p><div className="mt-5"><AdminCVTemplateActions template={template} onUpdated={changed} onConflict={(message) => { setNotice(message); load() }} /></div></aside></div></>}</main></div>
}
