import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { CV, CVCreateRequest } from '../../types/cv'
import CandidateHeader from '../../components/candidate/CandidateHeader'
import CVInlineEditor from '../../components/cv/CVInlineEditor'
import { cvService } from '../../services/cvService'
import { useAuth } from '../../hooks/useAuth'

const editable = (cv: CV): CVCreateRequest => ({ title: cv.title, personal_info: cv.personal_info, career_objective: cv.career_objective, educations: cv.educations, experiences: cv.experiences, skills: cv.skills, projects: cv.projects, certificates: cv.certificates, languages: cv.languages })
export default function CandidateCVEditPage() { const { id = '' } = useParams(); const navigate = useNavigate(); const { user } = useAuth(); const [cv, setCV] = useState<CV | null>(null); const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false)
  useEffect(() => { let cancelled = false; cvService.getCV(id).then((data) => !cancelled && setCV(data)).catch(() => !cancelled && setError('Không thể tải CV này.')); return () => { cancelled = true } }, [id])
  return <div className="min-h-screen bg-slate-50"><CandidateHeader/>{error && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{!cv && !error && <div className="mx-auto mt-7 h-96 max-w-4xl animate-pulse rounded-xl bg-slate-200"/>}{cv && <CVInlineEditor initial={editable(cv)} template="modern" profileAvatarUrl={user?.avatar_url} submitLabel="Lưu thay đổi" submitting={submitting} onCancel={() => navigate(`/candidate/cvs/${id}`)} onSave={async (data) => { setSubmitting(true); setError(null); try { await cvService.updateCV(id, data); navigate(`/candidate/cvs/${id}`) } catch { setError('Không thể lưu CV. Nội dung bạn đang chỉnh sửa vẫn được giữ.') } finally { setSubmitting(false) } }} />}</div> }
