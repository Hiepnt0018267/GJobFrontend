import { LogOut, Menu, X, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export type WorkspaceNavigationItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

type WorkspaceHeaderProps = {
  workspaceLabel: string
  workspaceHome: string
  navigationLabel: string
  links: WorkspaceNavigationItem[]
}

export default function WorkspaceHeader({ workspaceLabel, workspaceHome, navigationLabel, links }: WorkspaceHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const initial = (user?.full_name ?? '?').charAt(0).toUpperCase()
  const navClass = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
      return 'inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
    }

    return 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
  }

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Link to="/" className="flex items-center gap-2" aria-label="GJob - Trang chủ">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600"><Zap size={17} className="text-white" strokeWidth={2.5} /></span>
            <span className="text-lg font-bold text-slate-900">G<span className="text-blue-600">Job</span></span>
          </Link>
          <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />
          <Link to={workspaceHome} className="hidden text-xs font-semibold text-slate-500 transition-colors hover:text-blue-700 sm:block">{workspaceLabel}</Link>
        </div>

        <nav className="hidden items-center gap-1 xl:flex" aria-label={navigationLabel}>
          {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={navClass}><Icon size={16} />{label}</NavLink>)}
        </nav>

        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white" aria-label={user?.full_name}>{initial}</span>
          <button type="button" onClick={handleLogout} className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 hover:text-red-800 sm:inline-flex"><LogOut size={16} />Đăng xuất</button>
          <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 xl:hidden" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open}>{open ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>

      {open && <div className="motion-dropdown border-t border-slate-200 bg-white px-4 py-3 xl:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label={navigationLabel}>{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={navClass} onClick={() => setOpen(false)}><Icon size={16} />{label}</NavLink>)}<button type="button" onClick={handleLogout} className="mt-1 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 sm:hidden"><LogOut size={16} />Đăng xuất</button></nav></div>}
    </header>
  )
}
