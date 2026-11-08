import { ArrowUp, Bookmark, Headset, MessageSquarePlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { companyService } from '../../services/companyService'
import { savedJobService } from '../../services/savedJobService'
import SupportPopover from '../support/SupportPopover'

export type QuickDockButtonProps = {
  icon: React.ReactNode
  label: string
  badge?: number | null
  onClick: () => void
  'aria-label': string
  id?: string
}

export function QuickDockBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span
      className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white shadow-xs animate-in fade-in zoom-in-75 duration-150"
      aria-hidden="true"
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function QuickDockButton({ icon, label, badge, onClick, 'aria-label': ariaLabel, id }: QuickDockButtonProps) {
  return (
    <div className="relative group flex items-center">
      <span
        role="tooltip"
        className="pointer-events-none absolute right-full mr-2.5 hidden sm:block rounded-xl bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-white whitespace-nowrap opacity-0 shadow-lg backdrop-blur-xs transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        onClick={onClick}
        className="btn-press relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-white/95 text-slate-700 shadow-premium backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400/80 hover:bg-white hover:text-[#15999B] hover:shadow-premium-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] focus-visible:ring-offset-2 active:scale-95"
      >
        {icon}
        {typeof badge === 'number' && <QuickDockBadge count={badge} />}
      </button>
    </div>
  )
}

export function ScrollToTopButton({ onClick }: { onClick: () => void }) {
  return (
    <QuickDockButton
      id="quick-dock-scroll-top"
      aria-label="Cuộn lên đầu trang"
      label="Lên đầu trang"
      icon={<ArrowUp size={19} className="transition-transform group-hover:-translate-y-0.5" />}
      onClick={onClick}
    />
  )
}

export type CandidateQuickDockProps = {
  onOpenFeedback?: () => void
  onOpenSupport?: () => void
}

export default function CandidateQuickDock({ onOpenFeedback, onOpenSupport }: CandidateQuickDockProps) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const refreshVersion = useDataRefreshVersion()

  const [showScrollTop, setShowScrollTop] = useState(false)
  const [totalSavedCount, setTotalSavedCount] = useState<number | null>(null)
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  const isCandidate = user?.role === 'CANDIDATE'

  // Scroll to top tracking (threshold: 300px)
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Fetch total count for Candidate: savedJobs + followedCompanies
  useEffect(() => {
    if (!isCandidate) {
      void Promise.resolve().then(() => setTotalSavedCount(null))
      return
    }

    const controller = new AbortController()

    Promise.all([
      savedJobService.getSavedJobs({ page: 1, page_size: 1 }, controller.signal).catch(() => null),
      companyService.getFollowedCompanies({ page: 1, page_size: 1 }, controller.signal).catch(() => null),
    ]).then(([savedJobs, followedCompanies]) => {
      if (controller.signal.aborted) return
      const jobsCount = savedJobs?.total ?? 0
      const companiesCount = followedCompanies?.total ?? 0
      setTotalSavedCount(jobsCount + companiesCount)
    })

    return () => {
      controller.abort()
    }
  }, [isCandidate, user?.id, refreshVersion])

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleBookmarkClick = useCallback(() => {
    if (isAuthenticated && isCandidate) {
      navigate('/candidate/saved?tab=jobs')
    } else {
      // Guest: redirect to login and preserve destination
      navigate('/login', {
        state: {
          from: { pathname: '/candidate/saved', search: '?tab=jobs' },
        },
      })
    }
  }, [isAuthenticated, isCandidate, navigate])

  const handleFeedbackClick = useCallback(() => {
    if (onOpenFeedback) {
      onOpenFeedback()
    } else {
      window.dispatchEvent(new CustomEvent('gjob:open-feedback'))
    }
  }, [onOpenFeedback])

  const handleSupportClick = useCallback(() => {
    setIsSupportOpen((prev) => !prev)
    if (onOpenSupport) {
      onOpenSupport()
    } else {
      window.dispatchEvent(new CustomEvent('gjob:open-support'))
    }
  }, [onOpenSupport])

  useEffect(() => {
    const handleCustomOpen = () => setIsSupportOpen(true)
    window.addEventListener('gjob:open-support', handleCustomOpen)
    return () => {
      window.removeEventListener('gjob:open-support', handleCustomOpen)
    }
  }, [])

  // Recruiter and Admin: do not show Candidate Quick Dock
  if (isAuthenticated && user?.role !== 'CANDIDATE') {
    return null
  }

  // Hide in CV editor if mounted outside layout check
  const isCVEditor = location.pathname === '/candidate/cvs/create' || /^\/candidate\/cvs\/[^/]+\/edit$/.test(location.pathname)
  if (isCVEditor) {
    return null
  }

  return (
    <aside
      aria-label="Thanh công cụ nhanh"
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 flex flex-col items-center gap-2.5 transition-all duration-300"
    >
      {/* 1. Bookmark: Saved Hub */}
      <QuickDockButton
        id="quick-dock-bookmark"
        aria-label={`Mục đã lưu${typeof totalSavedCount === 'number' && totalSavedCount > 0 ? ` (${totalSavedCount})` : ''}`}
        label="Mục đã lưu"
        badge={totalSavedCount}
        icon={<Bookmark size={19} className="transition-transform group-hover:scale-110" />}
        onClick={handleBookmarkClick}
      />

      {/* 2. Feedback: Góp ý */}
      <QuickDockButton
        id="quick-dock-feedback"
        aria-label="Góp ý phản hồi"
        label="Góp ý"
        icon={<MessageSquarePlus size={19} className="transition-transform group-hover:scale-110" />}
        onClick={handleFeedbackClick}
      />

      {/* 3. Support: Hỗ trợ */}
      <QuickDockButton
        id="quick-dock-support"
        aria-label="Trung tâm hỗ trợ"
        label="Hỗ trợ"
        icon={<Headset size={19} className="transition-transform group-hover:scale-110" />}
        onClick={handleSupportClick}
      />

      {/* 4. Scroll to top: only when scrolled > 300px */}
      {showScrollTop && <ScrollToTopButton onClick={handleScrollToTop} />}

      {/* 5. Support Popover */}
      {isSupportOpen && (
        <SupportPopover
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
        />
      )}
    </aside>
  )
}

