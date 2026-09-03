import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminUserProfileContent from '../../components/admin/users/AdminUserProfileContent'
import { useAuth } from '../../hooks/useAuth'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { adminUserService } from '../../services/adminUserService'
import type { AdminUserDetail } from '../../types/adminUser'
import { adminUserErrorMessage, getApiErrorStatus } from '../../utils/apiError'

function DetailSkeleton() {
  return <div className="space-y-6" aria-label="Đang tải thông tin người dùng" aria-busy="true"><div className="h-52 animate-pulse rounded-2xl bg-slate-200" /><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="h-64 animate-pulse rounded-2xl bg-slate-200" /><div className="h-56 animate-pulse rounded-2xl bg-slate-200" /></div></div>
}

function returnLocation(state: unknown): string {
  if (state && typeof state === 'object' && 'returnTo' in state && typeof state.returnTo === 'string') return state.returnTo
  return '/admin/users'
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const refreshVersion = useDataRefreshVersion()
  const location = useLocation()
  const [user, setUser] = useState<AdminUserDetail | null>(null)
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
        if (!id) throw new Error('missing-user-id')
        return adminUserService.getAdminUser(id)
      })
      .then((nextUser) => { if (active && nextUser) setUser(nextUser) })
      .catch((requestError: unknown) => {
        if (!active) return
        if (requestError instanceof Error && requestError.message === 'missing-user-id') {
          setIsNotFound(true)
          setError('Người dùng không còn tồn tại.')
        } else {
          if (getApiErrorStatus(requestError) === 404) setIsNotFound(true)
          setError(adminUserErrorMessage(requestError, 'detail'))
        }
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [id, refreshVersion, requestVersion])

  const reload = (keepVisible = false) => {
    keepVisibleOnNextLoad.current = keepVisible
    setRequestVersion((version) => version + 1)
  }

  const handleUpdated = (updatedUser: AdminUserDetail, action: 'activate' | 'deactivate') => {
    setUser(updatedUser)
    setNotice(action === 'activate' ? 'Kích hoạt tài khoản thành công.' : 'Đã vô hiệu hóa tài khoản.')
  }

  const handleConflict = () => {
    reload(true)
  }

  return (
    <div className="min-h-screen bg-slate-50"><AdminHeader /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><Link to={returnTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700"><ArrowLeft size={16} aria-hidden="true" />Quay lại danh sách</Link>{isLoading && !user && <div className="mt-6"><DetailSkeleton /></div>}{!isLoading && error && !user && <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={34} aria-hidden="true" /><h1 className="mt-4 text-xl font-bold text-slate-950">{isNotFound ? 'Người dùng không còn tồn tại.' : 'Không thể tải thông tin người dùng.'}</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{error}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to={returnTo} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại danh sách</Link>{!isNotFound && <button type="button" onClick={() => reload()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} aria-hidden="true" />Thử lại</button>}</div></section>}{user && <div className="mt-6">{notice && <p role="status" className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">{notice}</p>}<AdminUserProfileContent user={user} isCurrentUser={currentUser?.id === user.id} onUpdated={handleUpdated} onConflict={handleConflict} /></div>}</main></div>
  )
}
