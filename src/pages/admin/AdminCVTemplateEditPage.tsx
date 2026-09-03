import { AlertCircle, ArrowLeft, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminCVTemplateForm from '../../components/admin/cv-templates/AdminCVTemplateForm'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { adminCVTemplateService } from '../../services/adminCVTemplateService'
import type { AdminCVTemplate, AdminCVTemplateCreateRequest, AdminCVTemplateUpdateRequest } from '../../types/adminCVTemplate'
import { adminCVTemplateErrorMessage } from '../../utils/apiError'

export default function AdminCVTemplateEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const refreshVersion = useDataRefreshVersion()
  const [template, setTemplate] = useState<AdminCVTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [retry, setRetry] = useState(0)
  const requestId = useRef(0)

  useEffect(() => {
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
  }, [id, refreshVersion, retry])

  const handleSubmit = async (payload: AdminCVTemplateCreateRequest | AdminCVTemplateUpdateRequest) => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      await adminCVTemplateService.updateAdminCVTemplate(id, payload)
      navigate(`/admin/cv-templates/${id}`, { replace: true })
    } catch (requestError) {
      setError(adminCVTemplateErrorMessage(requestError, 'form'))
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><Link to={id ? `/admin/cv-templates/${id}` : '/admin/cv-templates'} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />Chi tiết mẫu CV</Link>{loading && <div className="flex min-h-80 items-center justify-center"><LoaderCircle className="animate-spin text-blue-700" /></div>}{!loading && error && <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" /><h1 className="mt-4 text-xl font-bold text-slate-950">Không thể mở mẫu CV</h1><p className="mt-2 text-sm text-slate-600">{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Thử lại</button></section>}{!loading && template && <><header className="mt-5 border-b border-slate-200 pb-6"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Chỉnh sửa mẫu CV</h1><p className="mt-2 text-sm leading-6 text-slate-600">Cập nhật thông tin hiển thị của “{template.name}”.</p></header><div className="mt-6"><AdminCVTemplateForm key={`${template.id}-${template.updated_at}`} mode="edit" template={template} submitting={submitting} error={error} onSubmit={handleSubmit} /></div></>}</main></div>
}
