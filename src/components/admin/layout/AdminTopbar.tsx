import { Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAdminPageMeta } from '../../../config/adminNavigation'
import { useAuth } from '../../../hooks/useAuth'
import AdminAccountMenu from './AdminAccountMenu'

type Props = { drawerOpen: boolean; accountOpen: boolean; onToggleDrawer: () => void; onToggleAccount: () => void; onCloseAccount: () => void }

export default function AdminTopbar({ drawerOpen, accountOpen, onToggleDrawer, onToggleAccount, onCloseAccount }: Props) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const meta = getAdminPageMeta(pathname)
  const handleLogout = () => { logout(); onCloseAccount(); navigate('/') }

  return <header className="sticky top-0 z-30 h-[68px] border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex h-full min-w-0 items-center gap-3 px-4 sm:px-6 lg:px-8"><button type="button" onClick={onToggleDrawer} aria-expanded={drawerOpen} aria-controls="admin-mobile-drawer" className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden">{drawerOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}<span className="sr-only">{drawerOpen ? 'Đóng điều hướng quản trị' : 'Mở điều hướng quản trị'}</span></button><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-500">{meta.context}</p><p className="truncate text-base font-bold text-slate-950 sm:text-lg">{meta.title}</p></div><div className="ml-auto">{user && <AdminAccountMenu name={user.full_name} email={user.email} open={accountOpen} onOpen={() => { if (!accountOpen) onToggleAccount() }} onToggle={onToggleAccount} onClose={onCloseAccount} onLogout={handleLogout} />}</div></div></header>
}
