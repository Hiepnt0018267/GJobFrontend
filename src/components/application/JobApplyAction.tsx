import { BriefcaseBusiness, CheckCircle2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { Job } from '../../types/job'
import JobApplicationDialog from './JobApplicationDialog'

type Props = { job: Pick<Job, 'id' | 'title' | 'company_name' | 'status'> }

export default function JobApplyAction({ job }: Props) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationNotice, setApplicationNotice] = useState<string | null>(null)

  const isCandidate = user?.role === 'CANDIDATE'
  const isApplyable = job.status === 'APPROVED'
  const openApplyFlow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (isCandidate && isApplyable && !hasApplied) setIsApplicationDialogOpen(true)
  }
  const handleCreateCV = () => {
    setIsApplicationDialogOpen(false)
    navigate('/candidate/cvs/templates')
  }
  const handleSuccess = (message: string) => {
    setIsApplicationDialogOpen(false)
    setHasApplied(true)
    setApplicationNotice(message)
  }

  if (loading) return <aside className="h-fit rounded-2xl bg-slate-100 p-6"><div className="h-24 animate-pulse rounded-xl bg-slate-200" /></aside>
  if (isAuthenticated && !isCandidate) return <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold text-slate-900">Thông tin vị trí</h2><p className="mt-2 text-sm leading-6 text-slate-600">Bạn đang xem vị trí tuyển dụng công khai.</p></aside>

  return <><aside className="h-fit rounded-2xl bg-blue-50 p-6 ring-1 ring-blue-100"><h2 className="font-semibold text-slate-900">Quan tâm đến vị trí này?</h2>{!isApplyable ? <p className="mt-2 text-sm leading-6 text-slate-600">Tin tuyển dụng này hiện không còn nhận ứng tuyển.</p> : hasApplied ? <><div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} />Đã ứng tuyển</div><p className="mt-2 text-sm leading-6 text-slate-600">{applicationNotice || 'Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.'}</p></> : <><p className="mt-2 text-sm leading-6 text-slate-600">Chọn CV phù hợp và gửi đơn ứng tuyển trực tiếp đến nhà tuyển dụng.</p><button type="button" onClick={openApplyFlow} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><BriefcaseBusiness size={17} />Ứng tuyển ngay</button>{!isAuthenticated && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><LogIn size={14} />Bạn sẽ được đưa đến trang đăng nhập.</p>}</>}</aside>{isApplicationDialogOpen && <JobApplicationDialog jobId={job.id} jobTitle={job.title} companyName={job.company_name} onClose={() => setIsApplicationDialogOpen(false)} onSuccess={handleSuccess} onCreateCV={handleCreateCV} />}</>
}
