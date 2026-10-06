import { AlertCircle, Loader2, ScanSearch } from 'lucide-react'
import { useCallback } from 'react'
import { useMatchRequest } from '../../hooks/useMatchRequest'
import { matchingService } from '../../services/matchingService'
import { matchErrorMessage } from '../../utils/matchingError'
import MatchResultPanel from './MatchResultPanel'

type Props = { applicationId: string; candidateName: string; jobTitle: string }

export default function RecruiterApplicationMatchPanel({ applicationId, candidateName, jobTitle }: Props) {
  const request = useCallback((signal: AbortSignal) => matchingService.matchRecruiterApplication(applicationId, signal), [applicationId])
  const { result, error, isFetching, run } = useMatchRequest(applicationId, request)
  const normalizedError = error ? matchErrorMessage(error, 'recruiter') : null

  return <section aria-labelledby="recruiter-match-title" aria-busy={isFetching} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><ScanSearch size={20} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h2 id="recruiter-match-title" className="text-lg font-bold text-slate-950">Đối chiếu CV và công việc</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">So khớp CV của <span className="font-semibold text-slate-800">{candidateName}</span> với vị trí <span className="font-semibold text-slate-800">{jobTitle}</span>. Các chỉ số không thay thế đánh giá tuyển dụng.</p>
        </div>
      </div>
      <button type="button" onClick={() => void run()} disabled={isFetching} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-blue-700 disabled:cursor-wait disabled:bg-slate-300 sm:w-auto">
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
