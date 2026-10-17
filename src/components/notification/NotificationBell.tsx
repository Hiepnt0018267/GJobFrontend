import { useEffect, useId, useRef } from 'react'
import { Bell, BellOff, CheckCheck, LoaderCircle, RefreshCw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { useToast } from '../../hooks/useToast'
import {
  getNotificationTargetPath,
  notificationBadgeText,
  notificationBellLabel,
  notificationCenterPath,
} from '../../utils/notification'
import type { NotificationItem as NotificationItemType } from '../../types/notification'
import NotificationItem from './NotificationItem'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export default function NotificationBell({ open, onOpenChange }: Props) {
  const { user } = useAuth()
  const notifications = useNotifications()
  const { identityId, refreshPreview } = notifications
  const toast = useToast()
  const navigate = useNavigate()
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const previousIdentityRef = useRef(identityId)
  const badge = notificationBadgeText(notifications.unreadCount)

  useEffect(() => {
    if (previousIdentityRef.current !== identityId) {
      previousIdentityRef.current = identityId
      onOpenChange(false)
    }
  }, [identityId, onOpenChange])

  useEffect(() => {
    if (!open) return
    void refreshPreview()
  }, [open, refreshPreview])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onOpenChange(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onOpenChange(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onOpenChange, open])

  if (!user) return null
  const centerPath = notificationCenterPath(user.role)

  const handleSelect = async (item: NotificationItemType) => {
    const requestIdentity = identityId
    const targetPath = getNotificationTargetPath({ role: user.role, targetType: item.target_type, targetId: item.target_id })
    if (!item.is_read) {
      try {
        await notifications.markOne(item)
      } catch (error) {
        if (!isAbortError(error)) toast.error('Chưa thể đánh dấu thông báo đã đọc. Vui lòng thử lại.')
        return
      }
    }
    if (previousIdentityRef.current !== requestIdentity) return
    onOpenChange(false)
    if (targetPath) navigate(targetPath)
  }

  const handleMarkAll = async () => {
    try {
      await notifications.markAll()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc.')
    } catch (error) {
      if (!isAbortError(error)) toast.error('Chưa thể cập nhật thông báo. Vui lòng thử lại.')
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={notificationBellLabel(notifications.unreadCount)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        className={`btn-press relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] focus-visible:ring-offset-2 ${open ? 'border-[#49BBBD]/20 bg-[#49BBBD]/8 text-[#49BBBD]' : 'border-slate-200/80 bg-white/75 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950'}`}
      >
        <Bell size={19} strokeWidth={2} aria-hidden="true" />
        {badge && (
          <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-extrabold leading-4 text-white shadow-sm ring-2 ring-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-label="Thông báo gần đây"
          className="motion-dropdown fixed inset-x-3 top-[4.5rem] z-[70] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/98 shadow-premium ring-1 ring-slate-900/5 backdrop-blur-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[25rem]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
            <div>
              <h2 className="text-sm font-extrabold text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">Thông báo</h2>
              <p className="mt-0.5 text-xs text-slate-500">Cập nhật mới nhất dành cho bạn</p>
            </div>
            <button
              type="button"
              disabled={notifications.markAllPending || notifications.unreadCount === 0}
              onClick={() => void handleMarkAll()}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-[#49BBBD] transition-colors hover:bg-[#49BBBD]/8 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {notifications.markAllPending ? <LoaderCircle size={14} className="animate-spin text-[#49BBBD]" aria-hidden="true" /> : <CheckCheck size={14} aria-hidden="true" />}
              Đánh dấu tất cả đã đọc
            </button>
          </header>

          <div className="max-h-[min(26rem,calc(100vh-10rem))] divide-y divide-slate-100 overflow-y-auto overscroll-contain">
            {notifications.previewLoading && notifications.previewItems.length === 0 ? (
              <div className="space-y-3 p-4" aria-label="Đang tải thông báo">
                {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : notifications.previewError && notifications.previewItems.length === 0 ? (
              <div className="px-5 py-9 text-center" role="alert">
                <BellOff size={25} className="mx-auto text-slate-400" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-slate-800">Không thể tải thông báo</p>
                <button type="button" onClick={() => void notifications.refreshPreview()} className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[#49BBBD] hover:bg-[#49BBBD]/8">
                  <RefreshCw size={13} aria-hidden="true" /> Thử lại
                </button>
              </div>
            ) : notifications.previewItems.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell size={25} className="mx-auto text-slate-300" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-slate-800">Không còn thông báo chưa đọc</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Thông báo đã đọc vẫn được lưu trong trung tâm thông báo.</p>
              </div>
            ) : notifications.previewItems.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                compact
                actionable={Boolean(getNotificationTargetPath({ role: user.role, targetType: item.target_type, targetId: item.target_id }))}
                pending={notifications.pendingIds.has(item.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <footer className="border-t border-slate-100 bg-slate-50/70 p-2">
            <Link to={centerPath} onClick={() => onOpenChange(false)} className="flex min-h-10 items-center justify-center rounded-xl text-sm font-bold text-[#49BBBD] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]">
              Xem tất cả thông báo
            </Link>
          </footer>
        </section>
      )}
    </div>
  )
}
