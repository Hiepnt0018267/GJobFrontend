import { AlertCircle, ArrowLeft, LoaderCircle, Sparkles } from 'lucide-react'
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
    void adminCVTemplateService
      .getAdminCVTemplate(id)
      .then((response) => {
        if (currentRequest !== requestId.current) return
        setTemplate(response)
        setError(null)
      })
      .catch((requestError) => {
        if (currentRequest === requestId.current)
          setError(adminCVTemplateErrorMessage(requestError, 'detail'))
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false)
      })
  }, [id, refreshVersion, retry])

  const handleSubmit = async (
    payload: AdminCVTemplateCreateRequest | AdminCVTemplateUpdateRequest,
    thumbnail?: File
  ) => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      await adminCVTemplateService.updateAdminCVTemplate(id, payload)
      if (thumbnail) await adminCVTemplateService.uploadAdminCVTemplateThumbnail(id, thumbnail)
      navigate(`/admin/cv-templates/${id}`, { replace: true })
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
            to={id ? `/admin/cv-templates/${id}` : '/admin/cv-templates'}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 hover:text-black transition-colors"
          >
            <ArrowLeft size={15} />
            Quay lại Chi tiết mẫu CV
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <Sparkles size={12} className="text-amber-500" />
            Chỉnh sửa cấu hình mẫu
          </span>
        </div>

        {loading && (
          <div className="flex min-h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#1C1C1C]" />
              <span className="text-xs font-medium text-slate-500">Đang tải dữ liệu mẫu CV...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <section
            role="alert"
            className="mt-6 rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200/90 shadow-xs sm:p-12"
          >
            <AlertCircle className="mx-auto text-red-600" size={36} />
            <h1 className="mt-4 text-xl font-bold text-slate-950">Không thể mở mẫu CV</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-5 rounded-xl bg-[#1C1C1C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              Thử lại
            </button>
          </section>
        )}

        {!loading && template && (
          <>
            <header className="mt-4 border-b border-slate-200/80 pb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Chỉnh sửa mẫu CV: {template.name}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Cập nhật thông tin hiển thị, bảng màu, bố cục và phân loại cho mẫu CV “{template.name}”.
              </p>
            </header>

            <div className="mt-6">
              <AdminCVTemplateForm
                key={`${template.id}-${template.updated_at}`}
                mode="edit"
                template={template}
                submitting={submitting}
                error={error}
                onSubmit={handleSubmit}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
