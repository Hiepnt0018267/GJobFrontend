import { AlertCircle, FilePlus2, FileText, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { useMatchRequest } from '../../hooks/useMatchRequest'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { cvService } from '../../services/cvService'
import { matchingService } from '../../services/matchingService'
import { cvFileTypeLabel, cvSourceLabel, isBuilderCV, type CVListItem, type CVListResponse } from '../../types/cv'
import { matchErrorMessage } from '../../utils/matchingError'
import MatchResultPanel from './MatchResultPanel'

type Props = { jobId: string; jobStatus: string }

function cvDescription(cv: CVListItem): string {
  return isBuilderCV(cv)
    ? `${cvSourceLabel(cv)} · ${cv.template.name}`
    : `${cvSourceLabel(cv)} · ${cvFileTypeLabel(cv.mime_type)}`
}

function cvReadinessLabel(cv: CVListItem): string {
  if (cv.is_matchable !== false) {
    return cv.is_verified ? 'Đã được bạn xác nhận' : 'Sẵn sàng'
  }
  if (cv.extraction_status === 'PROCESSING') return 'Đang xử lý'
  if (cv.extraction_status === 'FAILED') return 'Xử lý thất bại'
  return 'Chưa xử lý'
}

function CandidateMatchContent({ jobId }: { jobId: string }) {
  const refreshVersion = useDataRefreshVersion()
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  const cvFetcher = useCallback((signal: AbortSignal) => cvService.getCVs(signal), [])
  const { data, error: cvError, isInitialLoading, isFetching: isRefreshingCVs, refetch: refetchCVs } = usePaginatedQuery<CVListResponse>({
    queryKey: 'candidate-match-cvs',
    refreshKey: refreshVersion,
    fetcher: cvFetcher,
  })
  const cvs = useMemo(() => data?.items ?? [], [data])
  const matchableCVs = useMemo(() => cvs.filter((cv) => cv.is_matchable !== false), [cvs])
  const selectedCV = matchableCVs.find((cv) => cv.id === selectedCvId) ?? matchableCVs.find((cv) => cv.is_default) ?? matchableCVs[0] ?? null
  const activeCvId = selectedCV?.id ?? ''
  const contextKey = activeCvId ? `${jobId}:${activeCvId}` : ''
  const request = useCallback(
    (signal: AbortSignal) => activeCvId
      ? matchingService.matchCandidateJob(jobId, activeCvId, signal)
      : Promise.reject(new Error('missing-cv')),
    [activeCvId, jobId],
  )
  const { result, error, isFetching, run } = useMatchRequest(contextKey, request)
  const normalizedError = error ? matchErrorMessage(error, 'candidate') : null

  return <section aria-labelledby="candidate-match-title" aria-busy={isFetching} className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 sm:p-6">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Sparkles size={19} aria-hidden="true" /></span>
      <div>
        <h2 id="candidate-match-title" className="text-lg font-bold text-slate-950">Phân tích CV với công việc</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Đối chiếu kỹ năng và nội dung CV với tin tuyển dụng. Các chỉ số chỉ là tín hiệu tham khảo, không phải xác suất được tuyển.</p>
      </div>
    </div>

    {isInitialLoading ? <div role="status" aria-live="polite" aria-busy="true" className="mt-5 h-24 animate-pulse rounded-xl bg-slate-200"><span className="sr-only">Đang tải danh sách CV của bạn.</span></div> : !data ? <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
      <p>Không thể tải danh sách CV của bạn.</p>
      <button type="button" onClick={refetchCVs} className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-semibold underline underline-offset-4"><RefreshCw size={15} aria-hidden="true" />Thử lại</button>
    </div> : cvs.length === 0 ? <div className="mt-5 rounded-xl bg-white p-5 text-center ring-1 ring-slate-200">
      <FilePlus2 className="mx-auto text-blue-600" size={28} aria-hidden="true" />
      <h3 className="mt-3 font-bold text-slate-900">Bạn cần có CV trước khi phân tích</h3>
      <p className="mt-1 text-sm text-slate-600">Tạo CV trên GJob hoặc tải lên CV có sẵn, sau đó quay lại công việc này.</p>
      <Link to="/candidate/cvs/templates" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Tạo CV</Link>
    </div> : <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <label className="block min-w-0 text-sm font-semibold text-slate-800">
        CV dùng để phân tích
        <select value={selectedCV?.id ?? ''} onChange={(event) => setSelectedCvId(event.target.value)} className="input mt-2 min-h-11">
          {!selectedCV && <option value="" disabled>Chưa có CV sẵn sàng để so khớp</option>}
          {cvs.map((cv) => <option key={cv.id} value={cv.id} disabled={cv.is_matchable === false}>{cv.title}{cv.is_default ? ' · Mặc định' : ''} · {cvDescription(cv)} · {cvReadinessLabel(cv)}</option>)}
        </select>
        {!selectedCV && <span className="mt-2 block text-xs font-normal leading-5 text-amber-700">CV tải lên vẫn có thể dùng để ứng tuyển. Hãy đợi xử lý hoàn tất hoặc mở CV để thử lại.</span>}
      </label>
      <button type="button" onClick={() => void run()} disabled={isFetching || !selectedCV} className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-blue-700 disabled:cursor-wait disabled:bg-slate-300 sm:w-auto">
        {isFetching ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <FileText size={17} aria-hidden="true" />}
        {isFetching ? 'Đang phân tích…' : result ? 'Phân tích lại' : 'Phân tích CV'}
      </button>
    </div>}

    {data && isRefreshingCVs && <p role="status" className="mt-3 text-xs font-medium text-slate-500">Đang cập nhật danh sách CV…</p>}
    {data && Boolean(cvError) && <p role="status" className="mt-3 text-xs text-amber-800">Chưa thể cập nhật danh sách CV mới nhất.</p>}

    {normalizedError && <div role="alert" className="motion-error mt-5 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700 ring-1 ring-red-100">
      <div className="flex items-start gap-2"><AlertCircle size={17} className="mt-1 shrink-0" aria-hidden="true" /><p>{normalizedError.message}</p></div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => void run()} disabled={isFetching} className="inline-flex min-h-11 items-center rounded-lg px-2 font-semibold underline underline-offset-4 disabled:opacity-60">Thử lại</button>
        {normalizedError.kind === 'cv-processing' && selectedCV && <Link to={`/candidate/cvs/${selectedCV.id}`} className="inline-flex min-h-11 items-center rounded-lg px-2 font-semibold text-blue-700 underline underline-offset-4">Kiểm tra trạng thái CV</Link>}
      </div>
    </div>}

    {result && !isFetching && <p role="status" className="sr-only">Phân tích CV và công việc đã hoàn tất.</p>}
    {result && <MatchResultPanel baseline={result.baseline} semantic={result.semantic} computedAt={result.computed_at} isFetching={isFetching} onRetry={() => void run()} />}
  </section>
}

export default function CandidateJobMatchPanel({ jobId, jobStatus }: Props) {
  const { user, loading } = useAuth()
  if (loading || user?.role !== 'CANDIDATE' || jobStatus !== 'APPROVED') return null
  return <CandidateMatchContent jobId={jobId} />
}
