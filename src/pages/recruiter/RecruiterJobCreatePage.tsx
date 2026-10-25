import { AlertCircle, ArrowLeft, Building2, CheckCircle2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RecruiterJobForm from '../../components/recruiter/RecruiterJobForm'
import { recruiterJobService } from '../../services/recruiterJobService'
import { recruiterService } from '../../services/recruiterService'
import type { JobCreateRequest } from '../../types/job'
import type { RecruiterProfile } from '../../types/recruiter'
import { recruiterErrorMessage, recruiterJobErrorMessage } from '../../utils/apiError'
import { recruiterProfileFieldLabels } from '../../utils/recruiterOnboarding'

export default function RecruiterJobCreatePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<RecruiterProfile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    recruiterService.getMyRecruiterProfile()
      .then((data) => { if (active) setProfile(data) })
      .catch((requestError) => { if (active) setProfileError(recruiterErrorMessage(requestError)) })
    return () => { active = false }
  }, [retry])

  const retryProfile = () => {
    setProfile(null)
    setProfileError(null)
    setRetry((value) => value + 1)
  }

  const submit = async (payload: JobCreateRequest) => { setSubmitting(true); setError(null); try { await recruiterJobService.createJob(payload); navigate('/recruiter/jobs', { state: { message: 'Tin tuyển dụng đã được tạo và đang chờ duyệt.' } }) } catch (requestError) { setError(recruiterJobErrorMessage(requestError)) } finally { setSubmitting(false) } }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#1C1C1C]"><ArrowLeft size={16} />Quản lý tin tuyển dụng</Link>

        {!profile && !profileError && (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-8 text-center" aria-busy="true">
            <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#1C1C1C]" />
            <p className="mt-4 text-sm font-medium text-slate-600">Đang kiểm tra hồ sơ công ty...</p>
          </section>
        )}

        {profileError && (
          <section role="alert" className="mt-7 rounded-2xl border border-red-100 bg-white p-8 text-center">
            <AlertCircle className="mx-auto text-red-500" size={34} />
            <h1 className="mt-4 text-xl font-bold text-slate-950">Không thể kiểm tra hồ sơ công ty</h1>
            <p className="mt-2 text-sm text-slate-600">{profileError}</p>
            <button type="button" onClick={retryProfile} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
              <RefreshCw size={15} />Thử lại
            </button>
          </section>
        )}

        {profile && !profile.profile_completed && (
          <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-[#1C1C1C] px-6 py-7 text-white sm:px-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Building2 size={22} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">Hoàn thiện hồ sơ trước khi đăng tin</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Thông tin doanh nghiệp đầy đủ giúp ứng viên nhận diện nhà tuyển dụng và đảm bảo mỗi tin đăng có nguồn rõ ràng.
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-sm font-semibold text-slate-900">Bạn còn thiếu {profile.missing_required_fields.length} mục:</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {profile.missing_required_fields.map((field) => (
                  <li key={field} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-700 ring-1 ring-slate-100">
                    <AlertCircle size={15} className="shrink-0 text-slate-400" />
                    {recruiterProfileFieldLabels[field] ?? field}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/recruiter/profile/edit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1C1C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black">
                  <CheckCircle2 size={16} />Hoàn thiện hồ sơ ngay
                </Link>
                <Link to="/recruiter" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                  Về trang tổng quan
                </Link>
              </div>
            </div>
          </section>
        )}

        {profile?.profile_completed && (
          <>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Đăng tin tuyển dụng</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Cung cấp thông tin rõ ràng để ứng viên nhanh chóng đánh giá mức độ phù hợp. Tin mới sẽ được gửi duyệt trước khi hiển thị công khai.</p>
            <div className="mt-7"><RecruiterJobForm submitting={submitting} serverError={error} submitLabel="Đăng tin tuyển dụng" onSubmit={submit} onCancel={() => navigate('/recruiter/jobs')} /></div>
          </>
        )}
      </main>
    </div>
  )
}
