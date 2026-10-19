import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ArrowLeft, ArrowRight, Bell, CheckCheck, LoaderCircle, RefreshCw } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import NotificationItem from '../../components/notification/NotificationItem'
import { useAuth } from '../../hooks/useAuth'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { useNotifications } from '../../hooks/useNotifications'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { useToast } from '../../hooks/useToast'
import { notificationService } from '../../services/notificationService'
import type { NotificationItem as NotificationItemType, NotificationListResponse } from '../../types/notification'
import {
  createReadNotificationPage,
  createNotificationListParams,
  getNotificationTargetPath,
  notificationPageFromSearch,
  notificationRequestKey,
  updateNotificationSearch,
} from '../../utils/notification'

const PAGE_SIZE = 20
const READ_SOURCE_PAGE_SIZE = 100

type IdentityBoundResponse = {
  identityId: string
  result: NotificationListResponse
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response
    if (response?.status === 401 || response?.status === 403) return 'Phiên truy cập không còn hợp lệ. Vui lòng đăng nhập lại.'
  }
  return 'Không thể tải danh sách thông báo. Vui lòng thử lại.'
}

async function fetchReadNotifications(page: number, signal: AbortSignal): Promise<NotificationListResponse> {
  const sourceItems: NotificationItemType[] = []
  let sourcePage = 1
  let sourceTotalPages = 1

  while (sourcePage <= sourceTotalPages) {
    if (signal.aborted) throw new DOMException('Notification request was cancelled', 'AbortError')
    const response = await notificationService.getNotifications(
      createNotificationListParams({ page: sourcePage, pageSize: READ_SOURCE_PAGE_SIZE, unreadOnly: false }),
      signal,
    )
    sourceItems.push(...response.items)
    sourceTotalPages = response.total_pages
    sourcePage += 1
  }

  return createReadNotificationPage(sourceItems, page, PAGE_SIZE)
}

export default function NotificationCenterPage() {
  const { user } = useAuth()
  const notifications = useNotifications()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const dataRefreshVersion = useDataRefreshVersion()
  const { page, filter } = notificationPageFromSearch(searchParams)
  const readOnly = filter === 'read'
  const identityId = user?.id ?? null
  const neutralTone = user?.role !== 'CANDIDATE'
  const focusRingClass = neutralTone ? 'focus-visible:ring-slate-950' : 'focus-visible:ring-[#49BBBD]'
  const actionButtonClass = neutralTone
    ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
    : 'border-[#49BBBD]/20 text-[#49BBBD] hover:bg-[#49BBBD]/6'
  const accentTextClass = neutralTone ? 'text-slate-950' : 'text-[#49BBBD]'
  const progressTrackClass = neutralTone ? 'bg-slate-200' : 'bg-[#49BBBD]/15'
  const progressBarClass = neutralTone ? 'bg-slate-950' : 'bg-[#49BBBD]'
  const retryButtonClass = neutralTone ? 'bg-slate-950 hover:bg-black' : 'bg-[#49BBBD] hover:bg-[#49BBBD]/90'
  const emptyIconClass = neutralTone ? 'bg-slate-100 text-slate-700' : 'bg-[#49BBBD]/10 text-[#49BBBD]'
  const activeIdentityRef = useRef(identityId)
  const queryKey = identityId
    ? notificationRequestKey({ userId: identityId, generation: notifications.identityGeneration, page, pageSize: PAGE_SIZE, filter })
    : 'anonymous'

  const fetcher = useCallback(async (signal: AbortSignal): Promise<IdentityBoundResponse> => {
    if (!identityId) throw new Error('Notification identity is unavailable')
    const result = readOnly
      ? await fetchReadNotifications(page, signal)
      : await notificationService.getNotifications(
        createNotificationListParams({ page, pageSize: PAGE_SIZE, unreadOnly: true }),
        signal,
      )
    return { identityId, result }
  }, [identityId, page, readOnly])

  const { data: boundData, error, isFetching, isInitialLoading, refetch, replaceData } = usePaginatedQuery({
    queryKey,
    refreshKey: dataRefreshVersion,
    fetcher,
  })
  const data = boundData?.identityId === identityId ? boundData.result : null

  useEffect(() => {
    activeIdentityRef.current = identityId
  }, [identityId])

  useEffect(() => {
    if (!data || isFetching || data.total_pages === 0 || page <= data.total_pages) return
    setSearchParams(updateNotificationSearch(searchParams, { page: data.total_pages }), { replace: true })
  }, [data, isFetching, page, searchParams, setSearchParams])

  const setFilter = (value: 'unread' | 'read') => {
    setSearchParams(updateNotificationSearch(searchParams, { filter: value }))
  }

  const setPage = (value: number) => {
    setSearchParams(updateNotificationSearch(searchParams, { page: value }))
  }

  const handleSelect = async (item: NotificationItemType) => {
    if (!user || !identityId) return
    const requestIdentity = identityId
    const targetPath = getNotificationTargetPath({ role: user.role, targetType: item.target_type, targetId: item.target_id })
    if (!item.is_read) {
      try {
        const updated = await notifications.markOne(item)
        if (activeIdentityRef.current !== requestIdentity || !data) return
        if (readOnly) {
          replaceData({ identityId: requestIdentity, result: { ...data, items: data.items.map((entry) => entry.id === updated.id ? updated : entry) } })
        } else {
          const nextTotal = Math.max(0, data.total - 1)
          replaceData({
            identityId: requestIdentity,
            result: {
              ...data,
              items: data.items.filter((entry) => entry.id !== updated.id),
              total: nextTotal,
              total_pages: nextTotal === 0 ? 0 : Math.ceil(nextTotal / data.page_size),
            },
          })
          refetch()
        }
      } catch (requestError) {
        if (!isAbortError(requestError)) toast.error('Chưa thể đánh dấu thông báo đã đọc. Vui lòng thử lại.')
      }
    }
    if (activeIdentityRef.current !== requestIdentity) return
    if (targetPath) navigate(targetPath)
  }

  const handleMarkAll = async () => {
    if (!identityId) return
    const requestIdentity = identityId
    try {
      await notifications.markAll()
      if (activeIdentityRef.current !== requestIdentity || !data) return
      replaceData({
        identityId: requestIdentity,
        result: readOnly
          ? data
          : { ...data, items: [], total: 0, total_pages: 0, page: 1 },
      })
      if (readOnly) refetch()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc.')
    } catch (requestError) {
      if (!isAbortError(requestError)) toast.error('Chưa thể cập nhật thông báo. Vui lòng thử lại.')
    }
  }

  const pageTitle = useMemo(() => user?.role === 'ADMIN' ? 'Thông báo quản trị' : 'Thông báo của bạn', [user?.role])

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 font-[Inter,sans-serif]">Trung tâm cập nhật</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1C1C1C] sm:text-3xl font-[Inter,sans-serif]">{pageTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Theo dõi những thay đổi liên quan đến hồ sơ, ứng tuyển và hoạt động trên GJob.</p>
        </div>
        <button
          type="button"
          disabled={notifications.markAllPending || notifications.unreadCount === 0}
          onClick={() => void handleMarkAll()}
          className={`btn-press inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border bg-white px-4 text-sm font-semibold shadow-2xs transition-all disabled:cursor-not-allowed disabled:opacity-45 sm:self-auto ${actionButtonClass}`}
        >
          {notifications.markAllPending ? <LoaderCircle size={17} className={`animate-spin ${accentTextClass}`} aria-hidden="true" /> : <CheckCheck size={17} aria-hidden="true" />}
          Đánh dấu tất cả đã đọc
        </button>
      </header>

      <section className="mt-6" aria-label="Bộ lọc thông báo">
        <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Trạng thái đọc">
          <button type="button" aria-pressed={!readOnly} onClick={() => setFilter('unread')} className={`min-h-10 rounded-lg px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${focusRingClass} ${!readOnly ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}>Chưa đọc</button>
          <button type="button" aria-pressed={readOnly} onClick={() => setFilter('read')} className={`min-h-10 rounded-lg px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${focusRingClass} ${readOnly ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}>Đã đọc</button>
        </div>
      </section>

      {isFetching && data && <div className={`mt-4 h-0.5 overflow-hidden rounded-full ${progressTrackClass}`} role="status" aria-label="Đang cập nhật thông báo"><div className={`h-full w-2/5 animate-pulse rounded-full ${progressBarClass}`} /></div>}

      {isInitialLoading || (!data && !error) ? (
        <section className="mt-6 space-y-3" aria-label="Đang tải danh sách thông báo">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)}
        </section>
      ) : !data && error ? (
        <section className="mt-6 rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200" role="alert">
          <Bell size={30} className="mx-auto text-slate-400" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải thông báo</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{errorMessage(error)}</p>
          <button type="button" onClick={refetch} className={`mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white ${retryButtonClass}`}><RefreshCw size={15} aria-hidden="true" /> Thử lại</button>
        </section>
      ) : data?.items.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
          <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${emptyIconClass}`}><Bell size={26} aria-hidden="true" /></span>
          <h2 className="mt-5 text-xl font-bold text-slate-950">{readOnly ? 'Chưa có thông báo đã đọc.' : 'Không còn thông báo chưa đọc.'}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{readOnly ? 'Thông báo bạn mở hoặc đánh dấu đã đọc sẽ xuất hiện tại đây.' : 'Thông báo mới chưa đọc sẽ xuất hiện tại đây.'}</p>
        </section>
      ) : data ? (
        <>
          <section className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" aria-label="Danh sách thông báo">
            {data.items.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                actionable={Boolean(user && getNotificationTargetPath({ role: user.role, targetType: item.target_type, targetId: item.target_id }))}
                pending={notifications.pendingIds.has(item.id)}
                onSelect={handleSelect}
                tone={neutralTone ? 'neutral' : 'teal'}
              />
            ))}
          </section>
          {data.total_pages > 1 && (
            <nav className="mt-7 flex items-center justify-between gap-4" aria-label="Phân trang thông báo">
              <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1 || isFetching} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} aria-hidden="true" />Trước</button>
              <span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span>
              <button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages || isFetching} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau<ArrowRight size={16} aria-hidden="true" /></button>
            </nav>
          )}
        </>
      ) : null}
    </main>
  )
}
