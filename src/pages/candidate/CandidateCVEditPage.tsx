import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CandidateHeader from '../../components/candidate/CandidateHeader'
import CVInlineEditor from '../../components/cv/CVInlineEditor'
import { isSupportedCVTemplateLayout } from '../../components/cv/cvTemplateRegistry'
import { cvService } from '../../services/cvService'
import { cvTemplateService } from '../../services/cvTemplateService'
import { useAuth } from '../../hooks/useAuth'
import { cvToEditableData, type CV, type CVTemplate } from '../../types/cv'

export default function CandidateCVEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cv, setCV] = useState<CV | null>(null)
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([cvService.getCV(id), cvTemplateService.getCVTemplates()])
      .then(([currentCV, catalog]) => { if (!cancelled) { setCV(currentCV); setTemplates(catalog.items) } })
      .catch(() => { if (!cancelled) setError('Không thể tải CV hoặc danh sách mẫu. Hãy thử lại.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="min-h-screen bg-slate-50"><CandidateHeader /><div className="mx-auto mt-7 h-96 max-w-4xl animate-pulse rounded-xl bg-slate-200" /></div>
  if (error || !cv) return <div className="min-h-screen bg-slate-50"><CandidateHeader /><p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg bg-red-50 p-3 text-sm text-red-700">{error || 'Không thể tải CV này.'}</p></div>
  if (!isSupportedCVTemplateLayout(cv.template.layout_key)) return <div className="min-h-screen bg-slate-50"><CandidateHeader /><p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Mẫu CV này chưa được phiên bản GJob hiện tại hỗ trợ chỉnh sửa.</p></div>

  return <><CandidateHeader />{error && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<CVInlineEditor initial={cvToEditableData(cv)} currentTemplate={cv.template} templates={templates} profileAvatarUrl={user?.avatar_url} submitLabel="Lưu thay đổi" submitting={submitting} onCancel={() => navigate(`/candidate/cvs/${id}`)} onSave={async (data) => { setSubmitting(true); setError(null); try { const { template_id, ...withoutTemplate } = data; await cvService.updateCV(id, template_id === cv.template_id ? withoutTemplate : data); navigate(`/candidate/cvs/${id}`) } catch { setError('Không thể lưu CV. Nội dung bạn đang chỉnh sửa vẫn được giữ.') } finally { setSubmitting(false) } }} /></>
}
