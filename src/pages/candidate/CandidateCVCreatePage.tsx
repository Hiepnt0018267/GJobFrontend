import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CandidateHeader from '../../components/candidate/CandidateHeader'
import CVInlineEditor from '../../components/cv/CVInlineEditor'
import { isSupportedCVTemplateLayout } from '../../components/cv/cvTemplateRegistry'
import { cvService } from '../../services/cvService'
import { cvTemplateService } from '../../services/cvTemplateService'
import { useAuth } from '../../hooks/useAuth'
import { emptyCV, type CVTemplate } from '../../types/cv'

export default function CandidateCVCreatePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const templateId = params.get('templateId')

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setTemplates((await cvTemplateService.getCVTemplates()).items)
    } catch {
      setLoadError('Không thể tải mẫu CV. Hãy kiểm tra kết nối và thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    cvTemplateService.getCVTemplates()
      .then((response) => { if (!cancelled) setTemplates(response.items) })
      .catch(() => { if (!cancelled) setLoadError('Không thể tải mẫu CV. Hãy kiểm tra kết nối và thử lại.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === templateId) ?? null, [templateId, templates])
  const initial = useMemo(() => selectedTemplate ? emptyCV(selectedTemplate.id, { full_name: user?.full_name ?? null, email: user?.email ?? null, phone: user?.phone ?? null, address: user?.address ?? null, avatar_url: user?.avatar_url ?? null }) : null, [selectedTemplate, user])

  if (loading) return <div className="min-h-screen bg-slate-50"><CandidateHeader /><div className="mx-auto mt-8 h-[720px] max-w-4xl animate-pulse rounded-xl bg-slate-200" /></div>
  if (loadError) return <div className="min-h-screen bg-slate-50"><CandidateHeader /><main className="mx-auto max-w-2xl px-4 py-10"><ErrorPanel text={loadError} retry={loadTemplates} /></main></div>
  if (!selectedTemplate || !isSupportedCVTemplateLayout(selectedTemplate.layout_key)) return <div className="min-h-screen bg-slate-50"><CandidateHeader /><main className="mx-auto max-w-2xl px-4 py-10"><div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"><p className="font-semibold">Mẫu CV không khả dụng</p><p className="mt-1">Mẫu bạn chọn không còn hoạt động hoặc chưa được GJob hỗ trợ.</p><Link to="/candidate/cvs/templates" className="mt-4 inline-flex items-center gap-1 font-semibold underline underline-offset-2"><ArrowLeft size={15} />Quay lại chọn mẫu</Link></div></main></div>

  return <><CandidateHeader />{saveError && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}<CVInlineEditor key={selectedTemplate.id} initial={initial!} currentTemplate={selectedTemplate} templates={templates} profileAvatarUrl={user?.avatar_url} submitLabel="Lưu CV" submitting={submitting} onCancel={() => navigate('/candidate/cvs')} onSave={async (data) => { setSubmitting(true); setSaveError(null); try { const cv = await cvService.createCV(data); navigate(`/candidate/cvs/${cv.id}`) } catch { setSaveError('Không thể lưu CV. Nội dung bạn đang chỉnh sửa vẫn được giữ.') } finally { setSubmitting(false) } }} /></>
}

function ErrorPanel({ text, retry }: { text: string; retry: () => Promise<void> }) {
  return <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Chưa thể mở trình tạo CV</p><p className="mt-1">{text}</p><button type="button" onClick={() => void retry()} className="mt-3 font-semibold underline underline-offset-2">Thử lại</button></div></div>
}
