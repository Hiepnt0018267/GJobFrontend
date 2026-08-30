import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Menu, X, Zap, LogOut, ChevronDown, UserCircle2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/auth'

// ─── Auth skeleton (declared outside component to satisfy ESLint static-components) ─
function AuthSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
      <div className="w-16 h-8 bg-slate-100 rounded-lg animate-pulse" />
    </div>
  )
}

const NAV_LINKS = [
  { to: '/',         label: 'Trang chủ',      end: true },
  { to: '/jobs',     label: 'Tìm việc làm',   end: false },
  { to: '/companies',label: 'Nhà tuyển dụng', end: false },
  { to: '/about',    label: 'Về chúng tôi',   end: false },
]

function roleBadgeText(role: UserRole): string {
  switch (role) {
    case 'CANDIDATE': return 'Ứng viên'
    case 'RECRUITER': return 'Nhà tuyển dụng'
    case 'ADMIN':     return 'Quản trị viên'
  }
}

function roleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'CANDIDATE': return 'bg-blue-50 text-blue-600'
    case 'RECRUITER': return 'bg-violet-50 text-violet-600'
    case 'ADMIN':     return 'bg-red-50 text-red-600'
  }
}

function dashboardFor(role: UserRole): string {
  switch (role) {
    case 'CANDIDATE': return '/candidate'
    case 'RECRUITER': return '/recruiter'
    case 'ADMIN':     return '/admin'
  }
}

// ─── User avatar / initial ───────────────────────────────────────────────────
function UserAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initial = name.charAt(0).toUpperCase()
  const cls = size === 'sm'
    ? 'w-7 h-7 text-xs'
    : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${cls} rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 select-none`}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}

export default function Header() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()

  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-200 hover:text-blue-600 ${
      isActive ? 'text-blue-600' : 'text-slate-600'
    }`

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-600'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="GJob - Trang chủ"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900">
              G<span className="text-blue-600">Job</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <AuthSkeleton />
            ) : isAuthenticated && user ? (
              /* ── Authenticated: user menu ── */
              <div className="relative" ref={menuRef}>
                <button
                  id="user-menu-button"
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <UserAvatar name={user.full_name} size="sm" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                      {user.full_name}
                    </p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleBadgeColor(user.role)}`}>
                      {roleBadgeText(user.role)}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 overflow-hidden py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    {/* User info row */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Dashboard link */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { navigate(dashboardFor(user.role)); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserCircle2 size={15} className="text-slate-400" />
                      Dashboard của tôi
                    </button>

                    {/* Profile link */}
                    {(user.role === 'CANDIDATE' || user.role === 'RECRUITER') && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { navigate(user.role === 'RECRUITER' ? '/recruiter/profile' : '/candidate/profile'); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserCircle2 size={15} className="text-slate-400" />
                        {user.role === 'RECRUITER' ? 'Hồ sơ nhà tuyển dụng' : 'Hồ sơ cá nhân'}
                      </button>
                    )}

                    {/* Logout */}
                    <button
                      id="logout-button"
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} className="text-red-400" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Unauthenticated: login / register buttons ── */
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={mobileNavLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="max-w-7xl mx-auto px-4 pb-4">
            {loading ? (
              <div className="flex gap-2 py-2">
                <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : isAuthenticated && user ? (
              /* ── Mobile authenticated ── */
              <div className="space-y-2">
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  <UserAvatar name={user.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.full_name}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleBadgeColor(user.role)}`}>
                      {roleBadgeText(user.role)}
                    </span>
                  </div>
                </div>
                {/* Dashboard */}
                <button
                  type="button"
                  onClick={() => { navigate(dashboardFor(user.role)); setMobileOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <UserCircle2 size={16} />
                  Dashboard của tôi
                </button>
                {/* Profile link */}
                {(user.role === 'CANDIDATE' || user.role === 'RECRUITER') && (
                  <button
                    type="button"
                    onClick={() => { navigate(user.role === 'RECRUITER' ? '/recruiter/profile' : '/candidate/profile'); setMobileOpen(false) }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <UserCircle2 size={16} />
                    {user.role === 'RECRUITER' ? 'Hồ sơ nhà tuyển dụng' : 'Hồ sơ cá nhân'}
                  </button>
                )}
                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            ) : (
              /* ── Mobile unauthenticated ── */
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
