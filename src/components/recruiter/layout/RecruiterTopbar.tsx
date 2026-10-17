import { Menu, Star, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getRecruiterPageMeta } from '../../../config/recruiterNavigation'
import { useRecruiterSubscription } from '../../../hooks/useRecruiterSubscription'
import { planDisplayName } from '../../../utils/subscription'
import NotificationBell from '../../notification/NotificationBell'

type Props = { drawerOpen: boolean; notificationOpen: boolean; onToggleDrawer: () => void; onNotificationOpenChange: (open: boolean) => void }

export default function RecruiterTopbar({ drawerOpen, notificationOpen, onToggleDrawer, onNotificationOpenChange }: Props) {
  const { pathname } = useLocation()
  const meta = getRecruiterPageMeta(pathname)
  const subscriptionQuery = useRecruiterSubscription()

  return (
    <header className="sticky top-0 z-30 h-[68px] border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="flex h-full min-w-0 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle, Star & Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleDrawer}
            aria-expanded={drawerOpen}
            aria-controls="recruiter-mobile-drawer"
            className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] lg:hidden"
          >
            {drawerOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span className="sr-only">{drawerOpen ? 'Đóng điều hướng nhà tuyển dụng' : 'Mở điều hướng nhà tuyển dụng'}</span>
          </button>

          <span className="hidden sm:inline-flex text-slate-400 hover:text-slate-600 transition-colors cursor-default" title="Đánh dấu yêu thích">
            <Star size={16} strokeWidth={1.8} aria-hidden="true" />
          </span>

          <nav aria-label="Đường dẫn phân cấp" className="flex min-w-0 items-center gap-2 text-sm font-[Inter,sans-serif]">
            <Link
              to="/recruiter"
              className="truncate text-slate-400 transition-colors hover:text-slate-700"
            >
              {meta.context || 'Tuyển dụng'}
            </Link>
            <span className="text-slate-300 select-none" aria-hidden="true">/</span>
            <span className="truncate font-medium text-[#1C1C1C]">
              {meta.title}
            </span>
          </nav>
        </div>

        {/* Right: Notifications & current service plan */}
        <div className="flex items-center gap-3 shrink-0">
          <NotificationBell open={notificationOpen} onOpenChange={onNotificationOpenChange} />
          {subscriptionQuery.data ? (
            <Link
              to="/recruiter/plans"
              className="hidden max-w-44 items-center gap-1.5 rounded-full bg-[#F7F9FB] px-3 py-1.5 text-xs text-slate-500 ring-1 ring-black/[0.06] transition-colors hover:bg-slate-100 hover:text-slate-700 sm:inline-flex"
              aria-label={`Gói hiện tại: ${planDisplayName(subscriptionQuery.data.effective_plan)} — Nhấn để quản lý dịch vụ`}
            >
              <span className="md:hidden">Gói:</span>
              <span className="hidden md:inline">Gói hiện tại:</span>
              <strong className="truncate font-semibold text-[#1C1C1C]">{planDisplayName(subscriptionQuery.data.effective_plan)}</strong>
            </Link>
          ) : subscriptionQuery.isFetching ? (
            <span className="hidden h-7 w-24 animate-pulse rounded-full bg-slate-100 sm:block" aria-label="Đang tải gói hiện tại" />
          ) : null}
        </div>
      </div>
    </header>
  )
}
