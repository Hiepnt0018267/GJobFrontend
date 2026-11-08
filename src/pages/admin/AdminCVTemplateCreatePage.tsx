import { ArrowLeft, Sparkles } from 'lucide-react'
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

  const handleSubmit = async (
    payload: AdminCVTemplateCreateRequest | AdminCVTemplateUpdateRequest,
    thumbnail?: File
  ) => {
    setSubmitting(true)
    setError(null)
    try {
      const created = await adminCVTemplateService.createAdminCVTemplate(
        payload as AdminCVTemplateCreateRequest
      )
      if (thumbnail) await adminCVTemplateService.uploadAdminCVTemplateThumbnail(created.id, thumbnail)
      navigate(`/admin/cv-templates/${created.id}`, { replace: true })
    } catch (requestError) {
      setError(adminCVTemplateErrorMessage(requestError, 'form'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />
      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/admin/cv-templates"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 hover:text-black transition-colors"
          >
            <ArrowLeft size={15} />
            Quay lại Quản lý mẫu CV
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <Sparkles size={12} className="text-amber-500" />
            Studio Thiết kế Mẫu CV
          </span>
        </div>

        <header className="mt-4 border-b border-slate-200/80 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Thêm mẫu CV mới
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Định hình bố cục, giao diện màu sắc và phân loại để ứng viên lựa chọn khi khởi tạo CV.
          </p>
        </header>

        <div className="mt-6">
          <AdminCVTemplateForm
            mode="create"
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
          />
        </div>
      </main>
    </div>
  )
}
