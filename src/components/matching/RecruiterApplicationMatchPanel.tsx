import { AlertCircle, Loader2, ScanSearch } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMatchRequest } from '../../hooks/useMatchRequest'
import { matchingService } from '../../services/matchingService'
import { matchErrorMessage } from '../../utils/matchingError'
import { isFeatureNotIncludedError } from '../../utils/apiError'
import MatchResultPanel from './MatchResultPanel'

type Props = { applicationId: string; candidateName: string; jobTitle: string; entitled: boolean; entitlementLoading: boolean; onEntitlementDenied: () => void }

export default function RecruiterApplicationMatchPanel({ applicationId, candidateName, jobTitle, entitled, entitlementLoading, onEntitlementDenied }: Props) {
  const request = useCallback((signal: AbortSignal) => matchingService.matchRecruiterApplication(applicationId, signal), [applicationId])
  const { result, error, isFetching, run } = useMatchRequest(applicationId, request)
  const normalizedError = error ? matchErrorMessage(error, 'recruiter') : null
  const staleEntitlement = isFeatureNotIncludedError(error, 'DETAILED_CV_JD_MATCH')

  useEffect(() => {
    if (staleEntitlement) onEntitlementDenied()
  }, [onEntitlementDenied, staleEntitlement])

  if (entitlementLoading) return <section aria-busy="true" className="h-40 animate-pulse rounded-2xl bg-slate-200" aria-label="Đang kiểm tra quyền đối chiếu CV" />

  if (!entitled || staleEntitlement) return <section aria-labelledby="recruiter-match-title" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
    <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><ScanSearch size={20} aria-hidden="true" /></span><div><h2 id="recruiter-match-title" className="text-lg font-bold text-slate-950">Đối chiếu CV và công việc</h2><p className="mt-1 text-sm leading-6 text-slate-600">Phân tích chi tiết CV–JD không có trong gói hiện tại của bạn.</p><Link to="/recruiter/plans" className="mt-3 inline-flex text-sm font-semibold text-slate-950 underline underline-offset-4">Xem các gói dịch vụ</Link></div></div>
  </section>

  return <section aria-labelledby="recruiter-match-title" aria-busy={isFetching} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#1C1C1C]"><ScanSearch size={20} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h2 id="recruiter-match-title" className="text-lg font-bold text-slate-950">Đối chiếu CV và công việc</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">So khớp CV của <span className="font-semibold text-slate-800">{candidateName}</span> với vị trí <span className="font-semibold text-slate-800">{jobTitle}</span>. Các chỉ số không thay thế đánh giá tuyển dụng.</p>
        </div>
      </div>
      <button type="button" onClick={() => void run()} disabled={isFetching} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1C1C1C] px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-black disabled:cursor-wait disabled:bg-slate-300 sm:w-auto">
        {isFetching ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <ScanSearch size={17} aria-hidden="true" />}
        {isFetching ? 'Đang so khớp…' : result ? 'So khớp lại' : 'So khớp CV'}
      </button>
    </div>

    {normalizedError && <div role="alert" className="motion-error mt-5 flex flex-col gap-3 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700 ring-1 ring-red-100 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-start gap-2"><AlertCircle size={17} className="mt-1 shrink-0" aria-hidden="true" />{normalizedError.message}</span>
      <button type="button" onClick={() => void run()} disabled={isFetching} className="inline-flex min-h-11 shrink-0 items-center self-start rounded-lg px-2 font-semibold underline underline-offset-4 disabled:opacity-60 sm:self-auto">Thử lại</button>
    </div>}

    {result && !isFetching && <p role="status" className="sr-only">So khớp CV ứng viên và công việc đã hoàn tất.</p>}
    {result && <MatchResultPanel baseline={result.baseline} semantic={result.semantic} computedAt={result.computed_at} isFetching={isFetching} onRetry={() => void run()} />}
  </section>
}
