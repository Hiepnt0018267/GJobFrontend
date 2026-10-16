import { Menu, Star, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getRecruiterPageMeta } from '../../../config/recruiterNavigation'
import { useAuth } from '../../../hooks/useAuth'
import NotificationBell from '../../notification/NotificationBell'
import RecruiterAccountMenu from './RecruiterAccountMenu'

type Props = { drawerOpen: boolean; accountOpen: boolean; notificationOpen: boolean; onToggleDrawer: () => void; onToggleAccount: () => void; onCloseAccount: () => void; onNotificationOpenChange: (open: boolean) => void }

export default function RecruiterTopbar({ drawerOpen, accountOpen, notificationOpen, onToggleDrawer, onToggleAccount, onCloseAccount, onNotificationOpenChange }: Props) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const meta = getRecruiterPageMeta(pathname)

  const handleLogout = () => { logout(); onCloseAccount(); navigate('/') }

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

        {/* Right: Notifications & Account Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <NotificationBell open={notificationOpen} onOpenChange={onNotificationOpenChange} />

          {user && (
            <RecruiterAccountMenu
              name={user.full_name}
              email={user.email}
              open={accountOpen}
              onOpen={() => { if (!accountOpen) onToggleAccount() }}
              onToggle={onToggleAccount}
              onClose={onCloseAccount}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  )
}
