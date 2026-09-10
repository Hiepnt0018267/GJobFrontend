import { AlertCircle, Bookmark, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { savedJobService } from '../../services/savedJobService'
import type { JobStatus } from '../../types/job'
import type { SavedJobStatus } from '../../types/savedJob'
import { savedJobErrorMessage } from '../../utils/apiError'

type Props = { jobId: string; jobStatus: JobStatus }
type StatusSnapshot = { key: string; value: SavedJobStatus }
type ErrorSnapshot = { key: string; message: string }

export default function SavedJobButton({ jobId, jobStatus }: Props) {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const refreshVersion = useDataRefreshVersion()
  const [statusSnapshot, setStatusSnapshot] = useState<StatusSnapshot | null>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [errorSnapshot, setErrorSnapshot] = useState<ErrorSnapshot | null>(null)
  const [retryVersion, setRetryVersion] = useState(0)
  const isCandidate = user?.role === 'CANDIDATE'
  const candidateKey = isCandidate && user ? `${user.id}:${jobId}` : null
  const status = statusSnapshot?.key === candidateKey ? statusSnapshot.value : null
  const error = errorSnapshot?.key === candidateKey ? errorSnapshot.message : null

  useEffect(() => {
    if (!candidateKey) return
    const controller = new AbortController()
    void Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return null
        setErrorSnapshot(null)
        return savedJobService.getStatus(jobId, controller.signal)
      })
      .then((response) => {
        if (!controller.signal.aborted && response) {
          setStatusSnapshot({ key: candidateKey, value: response })
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setErrorSnapshot({ key: candidateKey, message: savedJobErrorMessage(requestError, 'status') })
      })
    return () => controller.abort()
  }, [candidateKey, jobId, refreshVersion, retryVersion])

  if (authLoading) {
    return <div className="h-12 animate-pulse rounded-xl bg-slate-200" aria-label="Đang tải trạng thái lưu việc làm" />
  }
  if (isAuthenticated && !isCandidate) return null

  const saved = status?.saved ?? false
  const canSave = jobStatus === 'APPROVED'
  const isChecking = isCandidate && status === null && !error
  const pendingLabel = saved ? 'Đang bỏ lưu…' : 'Đang lưu…'
  const label = saved ? 'Đã lưu' : isChecking ? 'Đang kiểm tra…' : error && isCandidate ? 'Không thể kiểm tra' : canSave ? 'Lưu việc làm' : 'Tin đã đóng'

  const handleClick = async () => {
    if (!isAuthenticated && canSave) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (!candidateKey || !status || isMutating || (!saved && !canSave)) return

    setIsMutating(true)
    setErrorSnapshot(null)
    try {
      if (saved) {
        await savedJobService.unsave(jobId)
        setStatusSnapshot({ key: candidateKey, value: { saved: false, saved_at: null } })
      } else {
        setStatusSnapshot({ key: candidateKey, value: await savedJobService.save(jobId) })
      }
    } catch (requestError) {
      setErrorSnapshot({ key: candidateKey, message: savedJobErrorMessage(requestError, saved ? 'unsave' : 'save') })
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200" aria-label="Lưu việc làm">
      <button
        type="button"
        onClick={handleClick}
        disabled={isMutating || (!canSave && !saved) || (isCandidate && !status)}
        aria-pressed={isCandidate && status ? saved : undefined}
        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-65 ${saved ? 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'}`}
      >
        {isMutating || isChecking ? (
          <Loader2 size={17} className="animate-spin" aria-hidden="true" />
        ) : error && isCandidate && !status ? (
          <AlertCircle size={17} aria-hidden="true" />
        ) : (
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        )}
        {isMutating ? pendingLabel : label}
      </button>

      {error && (
        <div role="status" className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-800">
          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{error}</span>
          {!status && (
            <button type="button" onClick={() => setRetryVersion((value) => value + 1)} className="-my-3 inline-flex min-h-11 shrink-0 items-center gap-1 px-1 font-semibold underline underline-offset-2">
              <RefreshCw size={13} aria-hidden="true" />Thử lại
            </button>
          )}
        </div>
      )}
    </section>
  )
}
