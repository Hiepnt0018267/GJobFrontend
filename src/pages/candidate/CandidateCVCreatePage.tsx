import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import CandidateHeader from '../../components/candidate/CandidateHeader'
import CVInlineEditor from '../../components/cv/CVInlineEditor'
import { emptyCV, type CVTemplate } from '../../types/cv'
import { cvService } from '../../services/cvService'
import { useAuth } from '../../hooks/useAuth'

export default function CandidateCVCreatePage() { const navigate = useNavigate(); const [params] = useSearchParams(); const { user } = useAuth(); const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false); const chosen = params.get('template'); const template: CVTemplate = chosen === 'classic' || chosen === 'minimal' ? chosen : 'modern'; const initial = emptyCV({ full_name: user?.full_name ?? null, email: user?.email ?? null, phone: user?.phone ?? null, address: user?.address ?? null, avatar_url: user?.avatar_url ?? null })
  return <><CandidateHeader/>{error && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<CVInlineEditor initial={initial} template={template} profileAvatarUrl={user?.avatar_url} submitLabel="Lưu CV" submitting={submitting} onCancel={() => navigate('/candidate/cvs')} onSave={async (data) => { setSubmitting(true); setError(null); try { const cv = await cvService.createCV(data); navigate(`/candidate/cvs/${cv.id}`) } catch { setError('Không thể lưu CV. Nội dung bạn đang chỉnh sửa vẫn được giữ.') } finally { setSubmitting(false) } }} /></> }
