import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminCVTemplateForm from '../../components/admin/cv-templates/AdminCVTemplateForm'
import { adminCVTemplateService } from '../../services/adminCVTemplateService'
import type { AdminCVTemplateCreateRequest, AdminCVTemplateUpdateRequest } from '../../types/adminCVTemplate'
import { adminCVTemplateErrorMessage } from '../../utils/apiError'

export default function AdminCVTemplateCreatePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (payload: AdminCVTemplateCreateRequest | AdminCVTemplateUpdateRequest) => {
    setSubmitting(true)
    setError(null)
    try {
      const created = await adminCVTemplateService.createAdminCVTemplate(payload as AdminCVTemplateCreateRequest)
      navigate(`/admin/cv-templates/${created.id}`, { replace: true })
    } catch (requestError) {
      setError(adminCVTemplateErrorMessage(requestError, 'form'))
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><Link to="/admin/cv-templates" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />Quản lý mẫu CV</Link><header className="mt-5 border-b border-slate-200 pb-6"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Thêm mẫu CV</h1><p className="mt-2 text-sm leading-6 text-slate-600">Tạo một mẫu để ứng viên có thể chọn khi tạo CV mới.</p></header><div className="mt-6"><AdminCVTemplateForm mode="create" submitting={submitting} error={error} onSubmit={handleSubmit} /></div></main></div>
}
