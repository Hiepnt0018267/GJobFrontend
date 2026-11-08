import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, LogOut, Menu, Sparkles, X } from 'lucide-react'
import {
  candidateAccountItems,
  candidateCVActionItems,
  candidateCVPositionItems,
  candidateCVStyleItems,
  candidateNavigationGroups,
  candidateToolsGroup,
} from '../../config/candidateNavigation'
import { useAuth } from '../../hooks/useAuth'
import { jobTaxonomyService } from '../../services/jobTaxonomyService'
import type { UserRole } from '../../types/auth'
import type { JobTaxonomyResponse } from '../../types/jobTaxonomy'
import NotificationBell from '../notification/NotificationBell'
import GJobLogo from '../brand/GJobLogo'

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
      className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full bg-[#49BBBD] text-xs font-bold text-white shadow-xs ring-2 ring-white/80"
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
  if (role === 'CANDIDATE') return 'bg-[#49BBBD]/10 text-[#49BBBD] ring-1 ring-[#49BBBD]/25'
  if (role === 'RECRUITER') return 'bg-teal-50 text-teal-800 ring-1 ring-teal-600/20'
  return 'bg-slate-100 text-slate-800 ring-1 ring-slate-300'
}

function useDropdownAnchor() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [anchorX, setAnchorX] = useState(0)
  const [panelLeft, setPanelLeft] = useState(16)
  const [widePanelLeft, setWidePanelLeft] = useState(16)
  const updateAnchor = () => {
    const bounds = triggerRef.current?.getBoundingClientRect()
    if (bounds) setAnchorX(bounds.left + bounds.width / 2)

    const primaryTrigger = document.querySelector<HTMLElement>('[data-candidate-menu-origin="true"]')
    const preferredLeft = primaryTrigger?.getBoundingClientRect().left ?? 16
    const panelWidth = Math.min(760, window.innerWidth - 32)
    const maximumLeft = window.innerWidth - panelWidth - 16
    setPanelLeft(Math.max(16, Math.min(preferredLeft, maximumLeft)))

    const widePanelWidth = Math.min(1000, window.innerWidth - 32)
    const wideMaximumLeft = window.innerWidth - widePanelWidth - 16
    setWidePanelLeft(Math.max(16, Math.min(preferredLeft, wideMaximumLeft)))
  }
  return { triggerRef, anchorX, panelLeft, widePanelLeft, updateAnchor }
}

function useDropdownInteraction(
  onOpen: () => void,
  onToggle: () => void,
  onClose: () => void,
  updateAnchor: () => void,
) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPendingClose = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  useEffect(() => () => cancelPendingClose(), [])

  const openOnHover = () => {
    cancelPendingClose()
    updateAnchor()
    onOpen()
  }

  const toggleOnClick = () => {
    cancelPendingClose()
    updateAnchor()
    onToggle()
  }

  const closeWithGrace = () => {
    cancelPendingClose()
    closeTimerRef.current = setTimeout(onClose, 220)
  }

  return { openOnHover, toggleOnClick, closeWithGrace }
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
  const { triggerRef, anchorX, panelLeft, updateAnchor } = useDropdownAnchor()
  const { openOnHover, toggleOnClick, closeWithGrace } = useDropdownInteraction(
    onOpen,
    onToggle,
    onClose,
    updateAnchor,
  )

  return (
    <div className="relative" onMouseEnter={openOnHover} onMouseLeave={closeWithGrace}>
      <button
        ref={triggerRef}
        data-candidate-menu-origin={group.label === 'Việc làm' ? 'true' : undefined}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={toggleOnClick}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] ${
          isOpen ? 'bg-slate-100/80 text-[#49BBBD]' : 'text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
        }`}
      >
        {group.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#49BBBD]' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          style={{ left: panelLeft }}
          className="fixed top-16 w-[min(32rem,calc(100vw-2rem))] pt-1"
        >
          <span
            aria-hidden="true"
            style={{ left: anchorX }}
            className="fixed top-[4.25rem] z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white"
          />
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
                className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#49BBBD]/10 text-[#49BBBD] transition-colors group-hover:bg-[#49BBBD] group-hover:text-white">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#49BBBD]">
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

function CandidateJobsDropdown({
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
  const [taxonomy, setTaxonomy] = useState<JobTaxonomyResponse | null>(null)
  const [taxonomyLoading, setTaxonomyLoading] = useState(true)
  const [taxonomyError, setTaxonomyError] = useState(false)
  const { triggerRef, anchorX, widePanelLeft, updateAnchor } = useDropdownAnchor()
  const { openOnHover, toggleOnClick, closeWithGrace } = useDropdownInteraction(
    onOpen,
    onToggle,
    onClose,
    updateAnchor,
  )

  useEffect(() => {
    const controller = new AbortController()
    jobTaxonomyService
      .getActive(controller.signal)
      .then(setTaxonomy)
      .catch(() => {
        if (!controller.signal.aborted) setTaxonomyError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setTaxonomyLoading(false)
      })

    return () => controller.abort()
  }, [])

  const mainItems = [
    ...candidateNavigationGroups[0].items,
    {
      ...candidateToolsGroup.items[0],
      label: 'Việc làm phù hợp',
      description: 'Gợi ý dựa trên CV của bạn',
    },
  ]
  const industries = (taxonomy?.industries ?? []).slice(0, 5)
  const positions = (taxonomy?.industries ?? [])
    .flatMap((industry) => industry.positions)
    .filter((position, index, all) => all.findIndex((item) => item.code === position.code) === index)
    .slice(0, 6)

  return (
    <div className="relative" onMouseEnter={openOnHover} onMouseLeave={closeWithGrace}>
      <button
        ref={triggerRef}
        data-candidate-menu-origin="true"
        type="button"
        aria-expanded={isOpen}
        aria-controls="candidate-jobs-mega-menu"
        onClick={toggleOnClick}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] ${
          isOpen ? 'bg-teal-50 text-[#15999B]' : 'text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
        }`}
      >
        Việc làm
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#15999B]' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          style={{ left: widePanelLeft }}
          className="fixed top-16 w-[min(1000px,calc(100vw-2rem))] pt-1"
        >
          <span
            aria-hidden="true"
            style={{ left: anchorX }}
            className="fixed top-[4.25rem] z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white"
          />
          <div
            id="candidate-jobs-mega-menu"
            role="menu"
            aria-label="Khám phá việc làm"
            className="motion-dropdown grid overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium ring-1 ring-slate-900/5 md:grid-cols-[220px_1fr_0.85fr]"
          >
            <section className="border-b border-slate-100 p-4 md:border-b-0 md:border-r" aria-labelledby="candidate-jobs-main-title">
              <h2 id="candidate-jobs-main-title" className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Việc làm
              </h2>
              <div className="mt-2 space-y-1">
                {mainItems.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={`${to}-${label}`}
                    to={to}
                    role="menuitem"
                    onClick={onClose}
                    className="group flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-[#15999B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
                  >
                    <Icon size={16} className="shrink-0 text-slate-500 transition-colors group-hover:text-[#15999B]" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{label}</span>
                    <ArrowRight
                      data-menu-hover-arrow
                      size={15}
                      className="shrink-0 -translate-x-1 text-[#15999B] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </section>

            <section className="border-b border-slate-100 p-4 md:border-b-0 md:border-r" aria-labelledby="candidate-jobs-position-title">
              <Link
                id="candidate-jobs-position-title"
                to="/jobs"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[#15999B] hover:text-[#117D7F]"
              >
                Việc làm theo vị trí <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <div className="mt-2 grid gap-x-3 gap-y-0.5 lg:grid-cols-2">
                {positions.map((position) => (
                  <Link
                    key={position.id}
                    to={`/jobs?job_position=${encodeURIComponent(position.code)}`}
                    role="menuitem"
                    onClick={onClose}
                    className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium leading-snug text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#15999B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
                  >
                    <span className="min-w-0">{position.display_name}</span>
                    <ArrowRight
                      data-menu-hover-arrow
                      size={15}
                      className="shrink-0 -translate-x-1 text-[#15999B] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </section>

            <section className="p-4" aria-labelledby="candidate-jobs-industry-title">
              <Link
                id="candidate-jobs-industry-title"
                to="/jobs"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[#15999B] hover:text-[#117D7F]"
              >
                Việc làm theo ngành nghề <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <div className="mt-2 space-y-0.5">
                {industries.map((industry) => (
                  <Link
                    key={industry.id}
                    to={`/jobs?industry_group=${encodeURIComponent(industry.code)}`}
                    role="menuitem"
                    onClick={onClose}
                    className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium leading-snug text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#15999B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
                  >
                    <span className="min-w-0">{industry.display_name}</span>
                    <ArrowRight
                      data-menu-hover-arrow
                      size={15}
                      className="shrink-0 -translate-x-1 text-[#15999B] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </section>

            {(taxonomyLoading || taxonomyError) && (
              <div className="col-span-full border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                {taxonomyLoading
                  ? 'Đang tải vị trí và ngành nghề...'
                  : 'Chưa thể tải danh mục. Bạn vẫn có thể mở trang Tìm việc làm để tìm kiếm.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CandidateCVDropdown({
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
  const { triggerRef, anchorX, panelLeft, updateAnchor } = useDropdownAnchor()
  const { openOnHover, toggleOnClick, closeWithGrace } = useDropdownInteraction(
    onOpen,
    onToggle,
    onClose,
    updateAnchor,
  )
  const renderLink = ({ to, label, icon: Icon }: (typeof candidateCVStyleItems)[number]) => (
    <Link
      key={to}
      to={to}
      role="menuitem"
      onClick={onClose}
      className="group flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-[#15999B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
    >
      <Icon size={16} className="shrink-0 text-slate-500 transition-colors group-hover:text-[#15999B]" aria-hidden="true" />
      <span className="min-w-0 flex-1">{label}</span>
      <ArrowRight
        data-menu-hover-arrow
        size={15}
        className="shrink-0 -translate-x-1 text-[#15999B] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
    </Link>
  )

  return (
    <div className="relative" onMouseEnter={openOnHover} onMouseLeave={closeWithGrace}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="candidate-cv-mega-menu"
        onClick={toggleOnClick}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] ${
          isOpen ? 'bg-teal-50 text-[#15999B]' : 'text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
        }`}
      >
        Tạo CV
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#15999B]' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          style={{ left: panelLeft }}
          className="fixed top-16 w-[min(680px,calc(100vw-2rem))] pt-1"
        >
          <span
            aria-hidden="true"
            style={{ left: anchorX }}
            className="fixed top-[4.25rem] z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white"
          />
          <div
            id="candidate-cv-mega-menu"
            role="menu"
            aria-label="Tạo và quản lý CV"
            className="motion-dropdown grid overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-premium ring-1 ring-slate-900/5 md:grid-cols-[1.15fr_1fr]"
          >
            <div className="space-y-4 p-4">
              <section aria-labelledby="candidate-cv-style-title">
                <Link
                  id="candidate-cv-style-title"
                  to="/candidate/cvs/templates/styles"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-[#15999B] hover:text-[#117D7F]"
                >
                  Mẫu CV theo phong cách <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <div className="mt-2 space-y-1">{candidateCVStyleItems.map(renderLink)}</div>
              </section>
              <section aria-labelledby="candidate-cv-position-title">
                <Link
                  id="candidate-cv-position-title"
                  to="/candidate/cvs/templates/positions"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-[#15999B] hover:text-[#117D7F]"
                >
                  Mẫu CV theo vị trí ứng tuyển <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <div className="mt-2 space-y-1">{candidateCVPositionItems.map(renderLink)}</div>
              </section>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/55 p-4 md:border-l md:border-t-0">
              <p className="px-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">CV của bạn</p>
              <div className="mt-2 space-y-1">{candidateCVActionItems.map(renderLink)}</div>
            </div>
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
  const { triggerRef, anchorX, updateAnchor } = useDropdownAnchor()
  const { openOnHover, toggleOnClick, closeWithGrace } = useDropdownInteraction(
    onOpen,
    onToggle,
    onClose,
    updateAnchor,
  )

  return (
    <div className="relative" onMouseEnter={openOnHover} onMouseLeave={closeWithGrace}>
      <button
        ref={triggerRef}
        id="user-menu-button"
        type="button"
        aria-expanded={isOpen}
        aria-controls="candidate-account-menu"
        onClick={toggleOnClick}
        className="btn-press flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/60 px-3 py-1.5 shadow-xs transition-colors hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
      >
        <UserAvatar name={name} />
        <div className="text-left">
          <p className="max-w-[120px] truncate text-sm font-semibold leading-tight text-slate-900">{name}</p>
          <span className="text-[10px] font-medium text-[#49BBBD]">Ứng viên</span>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#49BBBD]' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full w-72 pt-2">
          <span
            aria-hidden="true"
            style={{ left: anchorX }}
            className="fixed top-[4.25rem] z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white"
          />
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
                  className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#49BBBD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#49BBBD]"
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
  const { triggerRef, anchorX, panelLeft, updateAnchor } = useDropdownAnchor()
  const { openOnHover, toggleOnClick, closeWithGrace } = useDropdownInteraction(
    onOpen,
    onToggle,
    onClose,
    updateAnchor,
  )
  return (
    <div className="relative" onMouseEnter={openOnHover} onMouseLeave={closeWithGrace}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="candidate-tools-menu"
        onClick={toggleOnClick}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] ${
          isOpen ? 'bg-slate-100/80 text-[#49BBBD]' : 'text-slate-700 hover:bg-slate-100/60 hover:text-slate-900'
        }`}
      >
        <Sparkles size={14} className="text-amber-500" aria-hidden="true" />
        Công cụ
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#49BBBD]' : 'text-slate-400'}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          style={{ left: panelLeft }}
          className="fixed top-16 w-[min(28rem,calc(100vw-2rem))] pt-1"
        >
          <span
            aria-hidden="true"
            style={{ left: anchorX }}
            className="fixed top-[4.25rem] z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-slate-200/80 bg-white"
          />
          <div
            id="candidate-tools-menu"
            role="menu"
            className="motion-dropdown overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-premium backdrop-blur-md ring-1 ring-slate-900/5"
          >
            {candidateToolsGroup.items.map(({ to, label, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={onClose}
                className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#49BBBD]/10 text-[#49BBBD] transition-colors group-hover:bg-[#49BBBD] group-hover:text-white">
                  <Icon size={15} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-[#49BBBD]">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
                </span>
                <ArrowRight
                  data-menu-hover-arrow
                  size={15}
                  className="mt-2 shrink-0 -translate-x-1 text-[#15999B] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MobileCandidateNavigation({ onNavigate }: { onNavigate: () => void }) {
  const [openSection, setOpenSection] = useState<number | null>(null)
  const mobileGroups = [...candidateNavigationGroups, candidateToolsGroup]

  return (
    <div className="space-y-1">
      {mobileGroups.map((group, index) => {
        const isOpen = openSection === index
        const panelId = `mobile-candidate-navigation-${index}`
        return (
          <div key={group.label} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/80">
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex min-h-[44px] w-full items-center justify-between px-4 py-2.5 text-left text-sm font-bold text-slate-800"
            >
              <span>{group.label}</span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#49BBBD]' : ''}`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div id={panelId} className="border-t border-slate-200/60 bg-white px-2 py-1.5">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={onNavigate}
                    className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#49BBBD]"
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
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRootRef = useRef<HTMLElement>(null)
  const isCandidatePlatform = !user || user.role === 'CANDIDATE'
  const workspaceNavigation =
    user?.role === 'RECRUITER' ? recruiterNavigation : user?.role === 'ADMIN' ? adminNavigation : []
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOpenMenu(null)
      setMobileOpen(false)
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

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
      ? 'rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600'
      : 'rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100/60 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600'

  return (
    <header
      ref={menuRootRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-slate-200/80 bg-white/95 shadow-md shadow-slate-900/5 backdrop-blur-2xl py-0.5'
          : 'border-b border-slate-200/60 bg-white/85 shadow-xs backdrop-blur-xl'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex h-16 items-center">
          {/* LEFT: GJob brand */}
          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="GJob - Trang chủ">
            <GJobLogo className="h-9 w-auto transition-transform duration-200 group-hover:scale-[1.03]" />
          </Link>

          {/* CENTER: Desktop Navigation */}
          <div className="hidden min-w-0 flex-1 items-center md:ml-6 md:flex lg:ml-8">
            {loading ? (
              <div className="h-5 w-72 animate-pulse rounded-lg bg-slate-100" aria-label="Đang tải điều hướng" />
            ) : isCandidatePlatform ? (
              <nav className="flex items-center gap-1.5" aria-label="Điều hướng ứng viên">
                {candidateNavigationGroups.map((group, index) => (
                  group.label === 'Việc làm' ? (
                    <CandidateJobsDropdown
                      key={group.label}
                      isOpen={openMenu === 'candidate-jobs'}
                      onOpen={() => setOpenMenu('candidate-jobs')}
                      onToggle={() => setOpenMenu((current) => (current === 'candidate-jobs' ? null : 'candidate-jobs'))}
                      onClose={() => setOpenMenu((current) => (current === 'candidate-jobs' ? null : current))}
                    />
                  ) : group.label === 'Tạo CV' ? (
                    <CandidateCVDropdown
                      key={group.label}
                      isOpen={openMenu === 'candidate-cv'}
                      onOpen={() => setOpenMenu('candidate-cv')}
                      onToggle={() => setOpenMenu((current) => (current === 'candidate-cv' ? null : 'candidate-cv'))}
                      onClose={() => setOpenMenu((current) => (current === 'candidate-cv' ? null : current))}
                    />
                  ) : (
                    <CandidateDropdown
                      key={group.label}
                      groupIndex={index}
                      isOpen={openMenu === `candidate-${index}`}
                      onOpen={() => setOpenMenu(`candidate-${index}`)}
                      onToggle={() =>
                        setOpenMenu((current) => (current === `candidate-${index}` ? null : `candidate-${index}`))
                      }
                      onClose={() =>
                        setOpenMenu((current) => (current === `candidate-${index}` ? null : current))
                      }
                    />
                  )
                ))}
                <ToolsDropdown
                  isOpen={openMenu === 'tools'}
                  onOpen={() => setOpenMenu('tools')}
                  onToggle={() => setOpenMenu((current) => (current === 'tools' ? null : 'tools'))}
                  onClose={() => setOpenMenu((current) => (current === 'tools' ? null : current))}
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

          {/* RIGHT: Notification Bell + Auth Actions / User Menu */}
          <div className="ml-auto hidden shrink-0 items-center gap-3 md:flex">
            {loading ? (
              <AuthSkeleton />
            ) : isAuthenticated && user ? (
              user.role === 'CANDIDATE' ? (
                <>
                  <NotificationBell
                    open={openMenu === 'notifications'}
                    onOpenChange={(open) => {
                      setOpenMenu((current) =>
                        open ? 'notifications' : current === 'notifications' ? null : current,
                      )
                      if (open) setMobileOpen(false)
                    }}
                  />
                  <CandidateAccountMenu
                    name={user.full_name}
                    email={user.email}
                    isOpen={openMenu === 'account'}
                    onOpen={() => setOpenMenu('account')}
                    onToggle={() => setOpenMenu((current) => (current === 'account' ? null : 'account'))}
                    onClose={() => setOpenMenu((current) => (current === 'account' ? null : current))}
                    onLogout={handleLogout}
                  />
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${roleBadgeColor(user.role)}`}>
                    {roleBadgeText(user.role)}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-press inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Đăng xuất
                  </button>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-press rounded-full px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn-press inline-flex items-center justify-center rounded-full bg-[#49BBBD] px-5 py-2 text-sm font-bold text-white shadow-sm shadow-[#49BBBD]/25 transition-all hover:bg-[#49BBBD]/90 active:bg-[#49BBBD]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] focus-visible:ring-offset-2"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="btn-press ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 md:hidden"
            onClick={() => { setOpenMenu(null); setMobileOpen((open) => !open) }}
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
                        ? 'block rounded-xl bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700'
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
                    className="btn-press flex min-h-[44px] items-center justify-center rounded-xl bg-[#49BBBD] px-4 py-2 text-center text-sm font-bold text-white shadow-sm hover:bg-[#49BBBD]/90 active:bg-[#49BBBD]/80"
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
