import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RecruiterJobForm from '../../components/recruiter/RecruiterJobForm'
import { recruiterJobService } from '../../services/recruiterJobService'
import type { JobCreateRequest } from '../../types/job'
import { recruiterJobErrorMessage } from '../../utils/apiError'

export default function RecruiterJobCreatePage() {
  const navigate = useNavigate(); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState<string | null>(null)
  const submit = async (payload: JobCreateRequest) => { setSubmitting(true); setError(null); try { await recruiterJobService.createJob(payload); navigate('/recruiter/jobs', { state: { message: 'Tin tuyển dụng đã được tạo và đang chờ duyệt.' } }) } catch (requestError) { setError(recruiterJobErrorMessage(requestError)) } finally { setSubmitting(false) } }
  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft size={16} />Quản lý tin tuyển dụng</Link><h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Đăng tin tuyển dụng</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Cung cấp thông tin rõ ràng để ứng viên nhanh chóng đánh giá mức độ phù hợp. Tin mới sẽ được gửi duyệt trước khi hiển thị công khai.</p><div className="mt-7"><RecruiterJobForm submitting={submitting} serverError={error} submitLabel="Đăng tin tuyển dụng" onSubmit={submit} onCancel={() => navigate('/recruiter/jobs')} /></div></main></div>
}
