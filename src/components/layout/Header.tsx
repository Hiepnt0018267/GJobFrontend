import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Sparkles, X, Zap } from 'lucide-react'
import { candidateAccountItems, candidateNavigationGroups } from '../../config/candidateNavigation'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/auth'

type PublicNavItem = { to: string; label: string; end: boolean }

const recruiterNavigation: PublicNavItem[] = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/jobs', label: 'Việc làm', end: false },
  { to: '/recruiter', label: 'Vào Recruiter Center', end: true },
]

const adminNavigation: PublicNavItem[] = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/jobs', label: 'Việc làm', end: false },
  { to: '/admin', label: 'Trang quản trị', end: true },
]

function AuthSkeleton() {
  return <div className="flex items-center gap-2" aria-label="Đang tải tài khoản"><div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" /><div className="h-8 w-16 animate-pulse rounded-lg bg-slate-100" /></div>
}

function UserAvatar({ name }: { name: string }) {
  return <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white" aria-hidden="true">{name.charAt(0).toUpperCase()}</div>
}

function roleBadgeText(role: UserRole) {
  if (role === 'CANDIDATE') return 'Ứng viên'
  if (role === 'RECRUITER') return 'Nhà tuyển dụng'
  return 'Quản trị viên'
}

function roleBadgeColor(role: UserRole) {
  if (role === 'CANDIDATE') return 'bg-blue-50 text-blue-700'
  if (role === 'RECRUITER') return 'bg-violet-50 text-violet-700'
  return 'bg-red-50 text-red-700'
}

function CandidateDropdown({ groupIndex, isOpen, onOpen, onToggle, onClose }: { groupIndex: number; isOpen: boolean; onOpen: () => void; onToggle: () => void; onClose: () => void }) {
  const group = candidateNavigationGroups[groupIndex]
  const menuId = `candidate-navigation-${groupIndex}`

  return <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
    <button type="button" aria-expanded={isOpen} aria-controls={menuId} onClick={onToggle} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4">
      {group.label}<ChevronDown size={15} className={isOpen ? 'rotate-180 text-blue-600 transition-transform' : 'text-slate-400 transition-transform'} aria-hidden="true" />
    </button>
    {isOpen && <div className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3"><div id={menuId} role="menu" className="motion-dropdown rounded-xl bg-white p-2 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200">
      {group.items.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to} role="menuitem" onClick={onClose} className="flex items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon size={16} aria-hidden="true" /></span>
        <span><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span></span>
      </Link>)}
    </div></div>}
  </div>
}

function CandidateAccountMenu({ name, email, isOpen, onOpen, onToggle, onClose, onLogout }: { name: string; email: string; isOpen: boolean; onOpen: () => void; onToggle: () => void; onClose: () => void; onLogout: () => void }) {
  return <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
    <button id="user-menu-button" type="button" aria-expanded={isOpen} aria-controls="candidate-account-menu" onClick={onToggle} className="flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-1.5 transition-colors hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <UserAvatar name={name} />
      <div className="text-left"><p className="max-w-[120px] truncate text-sm font-semibold leading-tight text-slate-800">{name}</p><span className="text-[10px] font-medium text-blue-700">Ứng viên</span></div>
      <ChevronDown size={15} className={isOpen ? 'rotate-180 text-blue-600 transition-transform' : 'text-slate-400 transition-transform'} aria-hidden="true" />
    </button>
    {isOpen && <div className="absolute right-0 top-full w-72 pt-3"><div id="candidate-account-menu" role="menu" aria-labelledby="user-menu-button" className="motion-dropdown overflow-hidden rounded-xl bg-white py-2 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200">
      <div className="border-b border-slate-100 px-4 py-3"><p className="truncate text-sm font-semibold text-slate-900">{name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{email}</p></div>
      {candidateAccountItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} role="menuitem" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"><Icon size={16} className="text-slate-400" aria-hidden="true" />{label}</Link>)}
      <div className="my-2 border-t border-slate-100" />
      <button id="logout-button" type="button" role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"><LogOut size={16} className="text-red-500" aria-hidden="true" />Đăng xuất</button>
    </div></div>}
  </div>
}

function ToolsDropdown({ isOpen, onOpen, onToggle, onClose }: { isOpen: boolean; onOpen: () => void; onToggle: () => void; onClose: () => void }) {
  return <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
    <button type="button" aria-expanded={isOpen} aria-controls="candidate-tools-menu" onClick={onToggle} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"><Sparkles size={15} aria-hidden="true" />Công cụ<ChevronDown size={15} className={isOpen ? 'rotate-180 text-blue-600 transition-transform' : 'text-slate-400 transition-transform'} aria-hidden="true" /></button>
    {isOpen && <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3"><div id="candidate-tools-menu" role="menu" className="motion-dropdown rounded-xl bg-white p-2 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200"><div className="flex items-start gap-3 rounded-lg px-3 py-3"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Sparkles size={16} aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-slate-800">Công cụ AI</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">Đang được phát triển và sẽ sớm ra mắt.</span></span></div></div></div>}
  </div>
}

function MobileCandidateNavigation({ onNavigate }: { onNavigate: () => void }) {
  return <div className="space-y-1">
    {candidateNavigationGroups.map((group) => <details key={group.label} className="group rounded-lg bg-slate-50">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 marker:content-none">{group.label}<ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
      <div className="border-t border-slate-100 px-2 py-1.5">{group.items.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={onNavigate} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-blue-700"><Icon size={16} className="text-slate-400" aria-hidden="true" />{label}</Link>)}</div>
    </details>)}
    <details className="group rounded-lg bg-slate-50"><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 marker:content-none"><span className="flex items-center gap-2"><Sparkles size={16} className="text-slate-400" aria-hidden="true" />Công cụ</span><ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" /></summary><p className="border-t border-slate-100 px-4 py-3 text-xs leading-5 text-slate-500">Các công cụ AI đang được phát triển.</p></details>
  </div>
}

export default function Header() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRootRef = useRef<HTMLElement>(null)
  const isCandidatePlatform = !user || user.role === 'CANDIDATE'
  const workspaceNavigation = user?.role === 'RECRUITER' ? recruiterNavigation : user?.role === 'ADMIN' ? adminNavigation : []

  useEffect(() => {
    const closeOnOutsidePointer = (event: MouseEvent) => { if (menuRootRef.current && !menuRootRef.current.contains(event.target as Node)) setOpenMenu(null) }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenMenu(null) }
    document.addEventListener('mousedown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('mousedown', closeOnOutsidePointer); document.removeEventListener('keydown', closeOnEscape) }
  }, [])

  const closeMenus = () => { setOpenMenu(null); setMobileOpen(false) }
  const handleLogout = () => { logout(); closeMenus(); navigate('/') }
  const topLinkClass = ({ isActive }: { isActive: boolean }) => `text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 ${isActive ? 'text-blue-700' : 'text-slate-700 hover:text-blue-700'}`

  return <header ref={menuRootRef} className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex h-16 items-center gap-5">
      <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="GJob - Trang chủ"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600"><Zap size={18} className="text-white" strokeWidth={2.5} aria-hidden="true" /></span><span className="text-xl font-bold text-slate-900">G<span className="text-blue-600">Job</span></span></Link>
      <div className="hidden min-w-0 items-center md:ml-6 md:flex lg:ml-10">
        {loading ? <div className="h-5 w-72 animate-pulse rounded bg-slate-100" aria-label="Đang tải điều hướng" /> : isCandidatePlatform ? <nav className="flex items-center gap-8" aria-label="Điều hướng ứng viên">{candidateNavigationGroups.map((group, index) => <CandidateDropdown key={group.label} groupIndex={index} isOpen={openMenu === `candidate-${index}`} onOpen={() => setOpenMenu(`candidate-${index}`)} onToggle={() => setOpenMenu((current) => current === `candidate-${index}` ? null : `candidate-${index}`)} onClose={() => setOpenMenu(null)} />)}<ToolsDropdown isOpen={openMenu === 'tools'} onOpen={() => setOpenMenu('tools')} onToggle={() => setOpenMenu((current) => current === 'tools' ? null : 'tools')} onClose={() => setOpenMenu(null)} /></nav> : <nav className="flex items-center gap-8" aria-label="Điều hướng chính">{workspaceNavigation.map((link) => <NavLink key={link.to} to={link.to} end={link.end} className={topLinkClass}>{link.label}</NavLink>)}</nav>}
      </div>
      <div className="ml-auto hidden shrink-0 items-center gap-3 md:flex">{loading ? <AuthSkeleton /> : isAuthenticated && user ? user.role === 'CANDIDATE' ? <CandidateAccountMenu name={user.full_name} email={user.email} isOpen={openMenu === 'account'} onOpen={() => setOpenMenu('account')} onToggle={() => setOpenMenu((current) => current === 'account' ? null : 'account')} onClose={() => setOpenMenu(null)} onLogout={handleLogout} /> : <div className="flex items-center gap-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${roleBadgeColor(user.role)}`}>{roleBadgeText(user.role)}</span><button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><LogOut size={16} aria-hidden="true" />Đăng xuất</button></div> : <><Link to="/login" className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Đăng nhập</Link><Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Đăng ký</Link></>}</div>
      <button type="button" className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}>{mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}</button>
    </div></div>
    {mobileOpen && <div className="border-t border-slate-200 bg-white md:hidden"><div className="mx-auto max-w-7xl space-y-3 px-4 py-3">
      {loading ? <div className="h-40 animate-pulse rounded-xl bg-slate-100" aria-label="Đang tải điều hướng" /> : isCandidatePlatform ? <MobileCandidateNavigation onNavigate={closeMenus} /> : <nav className="space-y-1" aria-label="Điều hướng chính">{workspaceNavigation.map((link) => <NavLink key={link.to} to={link.to} end={link.end} onClick={closeMenus} className={({ isActive }) => `block rounded-lg px-4 py-3 text-sm font-semibold ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>{link.label}</NavLink>)}</nav>}
      {!loading && isAuthenticated && user ? <div className="space-y-2 border-t border-slate-200 pt-3">{user.role === 'CANDIDATE' && <><div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"><UserAvatar name={user.full_name} /><div><p className="text-sm font-semibold text-slate-900">{user.full_name}</p><p className="text-xs text-slate-500">Ứng viên</p></div></div>{candidateAccountItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={closeMenus} className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Icon size={16} className="text-slate-400" aria-hidden="true" />{label}</Link>)}</>}<button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"><LogOut size={16} aria-hidden="true" />Đăng xuất</button></div> : !loading && <div className="flex flex-col gap-2 border-t border-slate-200 pt-3"><Link to="/login" onClick={closeMenus} className="rounded-lg border border-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-blue-700 hover:bg-blue-50">Đăng nhập</Link><Link to="/register" onClick={closeMenus} className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700">Đăng ký</Link></div>}
    </div></div>}
  </header>
}
