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
  return (
    <div className="flex items-center gap-2" aria-label="Đang tải tài khoản">
      <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
      <div className="h-9 w-16 animate-pulse rounded-xl bg-slate-100" />
    </div>
  )
}

function UserAvatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs ring-2 ring-white/80"
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function roleBadgeText(role: UserRole) {
  if (role === 'CANDIDATE') return 'Ứng viên'
  if (role === 'RECRUITER') return 'Nhà tuyển dụng'
  return 'Quản trị viên'
}

function roleBadgeColor(role: UserRole) {
  if (role === 'CANDIDATE') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
  if (role === 'RECRUITER') return 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20'
  return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
}

function CandidateDropdown({
  groupIndex,
  isOpen,
  onOpen,
  onToggle,
  onClose,
}: {
  groupIndex: number
  isOpen: boolean
  onOpen: () => void
  onToggle: () => void
  onClose: () => void
}) {
  const group = candidateNavigationGroups[groupIndex]
  const menuId = `candidate-navigation-${groupIndex}`

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
          isOpen ? 'bg-slate-100/80 text-blue-700' : 'text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
        }`}
      >
        {group.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="absolute left-1/2 top-full w-84 -translate-x-1/2 pt-2">
          <div
            id={menuId}
            role="menu"
            className="motion-dropdown overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-premium backdrop-blur-md ring-1 ring-slate-900/5"
          >
            {group.items.map(({ to, label, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={onClose}
                className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50/80 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-600">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CandidateAccountMenu({
  name,
  email,
  isOpen,
  onOpen,
  onToggle,
  onClose,
  onLogout,
}: {
  name: string
  email: string
  isOpen: boolean
  onOpen: () => void
  onToggle: () => void
  onClose: () => void
  onLogout: () => void
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        id="user-menu-button"
        type="button"
        aria-expanded={isOpen}
        aria-controls="candidate-account-menu"
        onClick={onToggle}
        className="btn-press flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/60 px-3 py-1.5 shadow-xs transition-colors hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <UserAvatar name={name} />
        <div className="text-left">
          <p className="max-w-[120px] truncate text-sm font-semibold leading-tight text-slate-900">{name}</p>
          <span className="text-[10px] font-medium text-blue-600">Ứng viên</span>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full w-72 pt-2">
          <div
            id="candidate-account-menu"
            role="menu"
            aria-labelledby="user-menu-button"
            className="motion-dropdown overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 py-2 shadow-premium backdrop-blur-md ring-1 ring-slate-900/5"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-bold text-slate-900">{name}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{email}</p>
            </div>
            <div className="py-1">
              {candidateAccountItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  role="menuitem"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                >
                  <Icon size={16} className="text-slate-400" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="my-1 border-t border-slate-100" />
            <button
              id="logout-button"
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500"
            >
              <LogOut size={16} className="text-rose-500" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ToolsDropdown({
  isOpen,
  onOpen,
  onToggle,
  onClose,
}: {
  isOpen: boolean
  onOpen: () => void
  onToggle: () => void
  onClose: () => void
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="candidate-tools-menu"
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
          isOpen ? 'bg-slate-100/80 text-blue-700' : 'text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
        }`}
      >
        <Sparkles size={14} className="text-amber-500" aria-hidden="true" />
        Công cụ
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="absolute left-1/2 top-full w-76 -translate-x-1/2 pt-2">
          <div
            id="candidate-tools-menu"
            role="menu"
            className="motion-dropdown rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-premium backdrop-blur-md ring-1 ring-slate-900/5"
          >
            <div className="flex items-start gap-3 rounded-xl bg-slate-50/80 p-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Sparkles size={16} aria-hidden="true" />
              </span>
              <div>
                <span className="block text-sm font-bold text-slate-900">Công cụ AI Thông minh</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  Phân tích CV, so khớp năng lực và tối ưu hóa hồ sơ đang được tích cực phát triển.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileCandidateNavigation({ onNavigate }: { onNavigate: () => void }) {
  const [openSection, setOpenSection] = useState<number | null>(null)

  return (
    <div className="space-y-1">
      {candidateNavigationGroups.map((group, index) => {
        const isOpen = openSection === index
        return (
          <div key={group.label} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/80">
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? null : index)}
              className="flex min-h-[44px] w-full items-center justify-between px-4 py-2.5 text-left text-sm font-bold text-slate-800"
            >
              <span>{group.label}</span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="border-t border-slate-200/60 bg-white px-2 py-1.5">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={onNavigate}
                    className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
                  >
                    <Icon size={16} className="text-slate-400" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Header() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRootRef = useRef<HTMLElement>(null)
  const isCandidatePlatform = !user || user.role === 'CANDIDATE'
  const workspaceNavigation =
    user?.role === 'RECRUITER' ? recruiterNavigation : user?.role === 'ADMIN' ? adminNavigation : []

  useEffect(() => {
    const closeOnOutsidePointer = (event: MouseEvent) => {
      if (menuRootRef.current && !menuRootRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const closeMenus = () => {
    setOpenMenu(null)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeMenus()
    navigate('/')
  }

  const topLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600'
      : 'rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100/60 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600'

  return (
    <header
      ref={menuRootRef}
      className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 shadow-xs backdrop-blur-xl transition-all"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-5">
          {/* Logo with concentric icon container */}
          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="GJob - Trang chủ">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm shadow-blue-600/20 ring-1 ring-blue-500/30 transition-transform group-hover:scale-105">
              <Zap size={18} className="text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">
              G<span className="text-blue-600">Job</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 items-center md:ml-6 md:flex lg:ml-8">
            {loading ? (
              <div className="h-5 w-72 animate-pulse rounded-lg bg-slate-100" aria-label="Đang tải điều hướng" />
            ) : isCandidatePlatform ? (
              <nav className="flex items-center gap-1.5" aria-label="Điều hướng ứng viên">
                {candidateNavigationGroups.map((group, index) => (
                  <CandidateDropdown
                    key={group.label}
                    groupIndex={index}
                    isOpen={openMenu === `candidate-${index}`}
                    onOpen={() => setOpenMenu(`candidate-${index}`)}
                    onToggle={() =>
                      setOpenMenu((current) => (current === `candidate-${index}` ? null : `candidate-${index}`))
                    }
                    onClose={() => setOpenMenu(null)}
                  />
                ))}
                <ToolsDropdown
                  isOpen={openMenu === 'tools'}
                  onOpen={() => setOpenMenu('tools')}
                  onToggle={() => setOpenMenu((current) => (current === 'tools' ? null : 'tools'))}
                  onClose={() => setOpenMenu(null)}
                />
              </nav>
            ) : (
              <nav className="flex items-center gap-2" aria-label="Điều hướng chính">
                {workspaceNavigation.map((link) => (
                  <NavLink key={link.to} to={link.to} end={link.end} className={topLinkClass}>
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>

          {/* Auth Actions / User Menu */}
          <div className="ml-auto hidden shrink-0 items-center gap-3 md:flex">
            {loading ? (
              <AuthSkeleton />
            ) : isAuthenticated && user ? (
              user.role === 'CANDIDATE' ? (
                <CandidateAccountMenu
                  name={user.full_name}
                  email={user.email}
                  isOpen={openMenu === 'account'}
                  onOpen={() => setOpenMenu('account')}
                  onToggle={() => setOpenMenu((current) => (current === 'account' ? null : 'account'))}
                  onClose={() => setOpenMenu(null)}
                  onLogout={handleLogout}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${roleBadgeColor(user.role)}`}>
                    {roleBadgeText(user.role)}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-press inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Đăng xuất
                  </button>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="btn-press rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn-press inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="btn-press flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer panel */}
      {mobileOpen && (
        <div className="motion-drawer border-t border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-4 py-4">
            {loading ? (
              <div className="h-32 animate-pulse rounded-xl bg-slate-100" aria-label="Đang tải điều hướng" />
            ) : isCandidatePlatform ? (
              <MobileCandidateNavigation onNavigate={closeMenus} />
            ) : (
              <nav className="space-y-1" aria-label="Điều hướng chính">
                {workspaceNavigation.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={closeMenus}
                    className={({ isActive }) =>
                      isActive
                        ? 'block rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700'
                        : 'block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            )}

            {!loading && isAuthenticated && user ? (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                {user.role === 'CANDIDATE' && (
                  <>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">
                      <UserAvatar name={user.full_name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500">Ứng viên</p>
                      </div>
                    </div>
                    {candidateAccountItems.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={closeMenus}
                        className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Icon size={16} className="text-slate-400" aria-hidden="true" />
                        {label}
                      </Link>
                    ))}
                  </>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-press flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-100"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              !loading && (
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="btn-press flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-bold text-slate-800 hover:bg-slate-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="btn-press flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    Đăng ký tài khoản
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  )
}
