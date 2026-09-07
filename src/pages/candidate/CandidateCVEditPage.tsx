import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CVInlineEditor from '../../components/cv/CVInlineEditor'
import { isSupportedCVTemplateLayout } from '../../components/cv/cvTemplateRegistry'
import { useAuth } from '../../hooks/useAuth'
import { cvService } from '../../services/cvService'
import { cvTemplateService } from '../../services/cvTemplateService'
import { cvToEditableData, isBuilderCV, type CV, type CVTemplate } from '../../types/cv'

export default function CandidateCVEditPage() {
  const { id = '' } = useParams(); const navigate = useNavigate(); const { user } = useAuth()
  const [cv, setCV] = useState<CV | null>(null); const [templates, setTemplates] = useState<CVTemplate[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false)
  useEffect(() => { let cancelled = false; Promise.all([cvService.getCV(id), cvTemplateService.getCVTemplates()]).then(([currentCV, catalog]) => { if (!cancelled) { setCV(currentCV); setTemplates(catalog.items) } }).catch(() => { if (!cancelled) setError('Không thể tải CV hoặc danh sách mẫu. Hãy thử lại.') }).finally(() => { if (!cancelled) setLoading(false) }); return () => { cancelled = true } }, [id])
  if (loading) return <div className="min-h-screen bg-slate-50"><div className="mx-auto mt-7 h-96 max-w-4xl animate-pulse rounded-xl bg-slate-200" /></div>
  if (error || !cv) return <div className="min-h-screen bg-slate-50"><p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg bg-red-50 p-3 text-sm text-red-700">{error || 'Không thể tải CV này.'}</p></div>
  if (!isBuilderCV(cv)) return <div className="min-h-screen bg-slate-50"><div className="mx-auto mt-6 max-w-4xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h1 className="text-xl font-bold text-slate-950">CV tải lên không chỉnh sửa trực tiếp được</h1><button type="button" onClick={() => navigate(`/candidate/cvs/${id}`)} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Quay lại CV</button></div></div>
  if (!isSupportedCVTemplateLayout(cv.template.layout_key)) return <p role="alert" className="m-8 text-amber-800">Mẫu CV này chưa được hỗ trợ chỉnh sửa.</p>
  return <CVInlineEditor initial={cvToEditableData(cv)} currentTemplate={cv.template} templates={templates} profileAvatarUrl={user?.avatar_url} cvId={cv.id} hasManagedPhoto={cv.has_managed_photo} photoVersion={cv.updated_at} onPhotoUpdated={setCV} submitLabel="Lưu thay đổi" submitting={submitting} onCancel={() => navigate(`/candidate/cvs/${id}`)} onSave={async (data) => { setSubmitting(true); setError(null); try { const { template_id, ...withoutTemplate } = data; setCV(await cvService.updateCV(id, template_id === cv.template_id ? withoutTemplate : data)) } catch { setError('Không thể lưu CV. Nội dung bạn đang chỉnh sửa vẫn được giữ.') } finally { setSubmitting(false) } }} />
}
