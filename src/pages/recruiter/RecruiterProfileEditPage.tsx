import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RecruiterProfileForm from '../../components/recruiter/RecruiterProfileForm'
import { useAuth } from '../../hooks/useAuth'
import { recruiterService } from '../../services/recruiterService'
import type { RecruiterProfile } from '../../types/recruiter'
import { recruiterErrorMessage } from '../../utils/apiError'
import RecruiterHeader from '../../components/recruiter/RecruiterHeader'

function Skeleton() { return <div className="animate-pulse space-y-5"><div className="h-12 rounded-xl bg-slate-200" /><div className="h-12 rounded-xl bg-slate-200" /><div className="h-44 rounded-xl bg-slate-200" /></div> }

export default function RecruiterProfileEditPage() {
  const navigate = useNavigate(); const { updateAuthenticatedUser } = useAuth()
  const [profile, setProfile] = useState<RecruiterProfile | null>(null); const [error, setError] = useState<string | null>(null)
  useEffect(() => { let active = true; recruiterService.getMyRecruiterProfile().then((data) => { if (active) setProfile(data) }).catch((requestError) => { if (active) setError(recruiterErrorMessage(requestError)) }); return () => { active = false } }, [])
  return <div className="min-h-screen bg-slate-50"><RecruiterHeader /><main className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><Link to="/recruiter/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600"><ArrowLeft size={16} />Quay lại hồ sơ</Link><section className="mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><h1 className="text-2xl font-bold text-slate-900">Cập nhật hồ sơ nhà tuyển dụng</h1><p className="mt-2 text-sm text-slate-500">Hoàn thiện thông tin để doanh nghiệp của bạn được nhận diện rõ ràng hơn.</p><div className="mt-8">{!profile && !error && <Skeleton />}{error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mr-2 inline" size={16} />{error}</div>}{profile && <RecruiterProfileForm profile={profile} onCancel={() => navigate('/recruiter/profile')} onSaved={(updated) => { updateAuthenticatedUser({ full_name: updated.full_name, phone: updated.phone ?? undefined }); navigate('/recruiter/profile') }} />}</div></section></main></div>
}
