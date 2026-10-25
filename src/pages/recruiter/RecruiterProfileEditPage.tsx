import { AlertCircle, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import RecruiterProfileForm from '../../components/recruiter/RecruiterProfileForm'
import { useAuth } from '../../hooks/useAuth'
import { recruiterService } from '../../services/recruiterService'
import type { RecruiterProfile } from '../../types/recruiter'
import { recruiterErrorMessage } from '../../utils/apiError'
import { markRecruiterOnboardingSeen, recruiterProfileFieldLabels } from '../../utils/recruiterOnboarding'

function Skeleton() { return <div className="animate-pulse space-y-5"><div className="h-12 rounded-xl bg-slate-200" /><div className="h-12 rounded-xl bg-slate-200" /><div className="h-44 rounded-xl bg-slate-200" /></div> }

export default function RecruiterProfileEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, updateAuthenticatedUser } = useAuth()
  const onboarding = searchParams.get('onboarding') === '1'
  const [profile, setProfile] = useState<RecruiterProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (onboarding && user?.email) markRecruiterOnboardingSeen(user.email)
  }, [onboarding, user?.email])
  useEffect(() => { let active = true; recruiterService.getMyRecruiterProfile().then((data) => { if (active) setProfile(data) }).catch((requestError) => { if (active) setError(recruiterErrorMessage(requestError)) }); return () => { active = false } }, [])

  const finishOnboarding = (message: string) => {
    navigate('/recruiter', { replace: true, state: { message } })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {onboarding ? (
          <button
            type="button"
            onClick={() => finishOnboarding('Bạn có thể hoàn thiện hồ sơ công ty bất cứ lúc nào trước khi đăng tin.')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-[#1C1C1C]"
          >
            Hoàn thiện sau
          </button>
        ) : (
          <Link to="/recruiter/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#1C1C1C]">
            <ArrowLeft size={16} />Quay lại hồ sơ công ty
          </Link>
        )}

        <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          {onboarding && (
            <div className="mb-7 flex items-start gap-4 rounded-2xl bg-[#F4F6F8] p-5 ring-1 ring-black/[0.04]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1C1C1C] text-white">
                <Building2 size={21} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Bắt đầu với GJob</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950">Giới thiệu doanh nghiệp của bạn</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Bạn có thể khám phá hệ thống ngay và hoàn thiện sau. Hồ sơ đầy đủ chỉ bắt buộc khi bạn đăng tin tuyển dụng.
                </p>
              </div>
            </div>
          )}

          {!onboarding && <h1 className="text-2xl font-bold text-slate-900">Cập nhật hồ sơ công ty</h1>}
          {!onboarding && <p className="mt-2 text-sm text-slate-500">Hoàn thiện thông tin để doanh nghiệp của bạn được nhận diện rõ ràng hơn.</p>}

          <div className={onboarding ? '' : 'mt-8'}>
            {!profile && !error && <Skeleton />}
            {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mr-2 inline" size={16} />{error}</div>}
            {profile && !profile.profile_completed && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <AlertCircle size={17} aria-hidden="true" />
                  Còn {profile.missing_required_fields.length} thông tin cần bổ sung trước khi đăng tin
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.missing_required_fields.map((field) => (
                    <span key={field} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {recruiterProfileFieldLabels[field] ?? field}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile?.profile_completed && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
                <CheckCircle2 size={17} aria-hidden="true" />Hồ sơ đã đủ điều kiện đăng tin tuyển dụng.
              </div>
            )}
            {profile && (
              <RecruiterProfileForm
                profile={profile}
                onCancel={() => onboarding
                  ? finishOnboarding('Bạn có thể hoàn thiện hồ sơ công ty bất cứ lúc nào trước khi đăng tin.')
                  : navigate('/recruiter/profile')}
                onSaved={(updated) => {
                  updateAuthenticatedUser({ full_name: updated.full_name, phone: updated.phone ?? undefined })
                  if (onboarding) {
                    finishOnboarding(updated.profile_completed
                      ? 'Hồ sơ công ty đã hoàn tất. Bạn có thể đăng tin tuyển dụng.'
                      : 'Đã lưu hồ sơ. Hãy bổ sung các mục còn thiếu trước khi đăng tin.')
                    return
                  }
                  navigate('/recruiter/profile')
                }}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
