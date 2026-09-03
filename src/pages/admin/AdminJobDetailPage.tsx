import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import AdminJobReviewContent from '../../components/admin/jobs/AdminJobReviewContent'
import { adminJobService } from '../../services/adminJobService'
import type { AdminJob } from '../../types/adminJob'
import { adminJobErrorMessage, getApiErrorStatus } from '../../utils/apiError'

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải tin tuyển dụng" aria-busy="true">
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}

function returnLocation(state: unknown): string {
  if (state && typeof state === 'object' && 'returnTo' in state && typeof state.returnTo === 'string') return state.returnTo
  return '/admin/jobs?status=PENDING'
}

export default function AdminJobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const refreshVersion = useDataRefreshVersion()
  const location = useLocation()
  const [job, setJob] = useState<AdminJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const keepVisibleOnNextLoad = useRef(false)
  const returnTo = returnLocation(location.state)

  useEffect(() => {
    let active = true
    const keepVisible = keepVisibleOnNextLoad.current
    keepVisibleOnNextLoad.current = false

    Promise.resolve()
      .then(() => {
        if (!active) return null
        if (!keepVisible) setIsLoading(true)
        setError(null)
        setIsNotFound(false)
        if (!id) throw new Error('missing-job-id')
        return adminJobService.getAdminJob(id)
      })
      .then((nextJob) => { if (active && nextJob) setJob(nextJob) })
      .catch((requestError: unknown) => {
        if (!active) return
        if (requestError instanceof Error && requestError.message === 'missing-job-id') {
          setIsNotFound(true)
          setError('Tin tuyển dụng không còn tồn tại.')
        } else {
          if (getApiErrorStatus(requestError) === 404) setIsNotFound(true)
          setError(adminJobErrorMessage(requestError, 'detail'))
        }
      })
      .finally(() => { if (active) setIsLoading(false) })

    return () => { active = false }
  }, [id, refreshVersion, requestVersion])

  const reload = (keepVisible = false) => {
    keepVisibleOnNextLoad.current = keepVisible
    setRequestVersion((version) => version + 1)
  }

  const handleUpdated = (updatedJob: AdminJob, action: 'approve' | 'reject') => {
    setJob(updatedJob)
    setNotice(action === 'approve' ? 'Phê duyệt tin tuyển dụng thành công.' : 'Đã từ chối tin tuyển dụng.')
  }

  const handleConflict = () => {
    setNotice('Tin tuyển dụng đã được xử lý hoặc không còn ở trạng thái chờ duyệt. Dữ liệu mới đã được tải lại.')
    reload(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to={returnTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700">
          <ArrowLeft size={16} aria-hidden="true" />
          Quay lại danh sách
        </Link>

        {isLoading && !job && <div className="mt-6"><DetailSkeleton /></div>}

        {!isLoading && error && !job && (
          <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200">
            <AlertCircle className="mx-auto text-red-600" size={34} aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-slate-950">{isNotFound ? 'Tin tuyển dụng không còn tồn tại.' : 'Không thể tải tin tuyển dụng.'}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to={returnTo} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại danh sách</Link>
              {!isNotFound && <button type="button" onClick={() => reload()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} aria-hidden="true" />Thử lại</button>}
            </div>
          </section>
        )}

        {job && (
          <div className="mt-6">
            {notice && <p role="status" className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">{notice}</p>}
            <AdminJobReviewContent job={job} onUpdated={handleUpdated} onConflict={handleConflict} />
          </div>
        )}
      </main>
    </div>
  )
}
