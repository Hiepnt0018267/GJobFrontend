import { ChevronRight, ExternalLink, Headset, HelpCircle, ShieldAlert, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GJobLogo from '../brand/GJobLogo'
import { getSupportConfig } from '../../config/supportConfig'

export type SupportPopoverProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SupportPopover({ isOpen, onClose }: SupportPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const config = getSupportConfig()
  const zaloUrl = config.zaloUrl || 'https://zalo.me/0325368492'
  const supportEmail = config.email || 'hiepbosv2@gmail.com'

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      // Do not close if clicking inside popover or on the quick dock support button
      const supportButton = document.getElementById('quick-dock-support')
      if (popoverRef.current && !popoverRef.current.contains(target) && (!supportButton || !supportButton.contains(target))) {
        onClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleNavigateToHelp = (categorySlug: string) => {
    onClose()
    navigate(`/help?category=${categorySlug}`)
  }

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-label="Trung tâm hỗ trợ GJob"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-20 z-50 flex w-[calc(100vw-2rem)] max-w-sm sm:w-84 max-h-[calc(100vh-7rem)] overflow-y-auto flex-col rounded-3xl border border-slate-200/90 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-sm border border-slate-100">
            <GJobLogo variant="mark" className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">
              Trung tâm hỗ trợ GJob
            </h2>
            <p className="text-[11px] text-slate-500">
              Chúng tôi luôn ghi nhận và hỗ trợ bạn.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng trung tâm hỗ trợ"
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* 4 Action Menu Rows */}
      <div className="divide-y divide-slate-100 p-2 text-sm text-slate-700">
        {/* Item 1: Hướng dẫn tìm việc an toàn */}
        <button
          type="button"
          onClick={() => handleNavigateToHelp('safety')}
          className="btn-press flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors hover:bg-teal-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#15999B] ring-1 ring-teal-200/70">
              <ShieldAlert size={18} aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  Hướng dẫn tìm việc an toàn
                </span>
                <span className="text-[10px] font-bold text-rose-500">*</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nhận diện cơ hội minh bạch & phòng ngừa rủi ro
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
        </button>

        {/* Item 2: Các câu hỏi thường gặp */}
        <button
          type="button"
          onClick={() => handleNavigateToHelp('cv')}
          className="btn-press flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70">
              <HelpCircle size={18} aria-hidden="true" />
            </span>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                Các câu hỏi thường gặp
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Giải đáp nhanh về tạo CV, ứng tuyển & AI Matching
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
        </button>

        {/* Item 3: Hỗ trợ qua Zalo */}
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-press flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0068FF]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0068FF] text-white font-bold text-xs shadow-xs">
              Zalo
            </span>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                Hỗ trợ qua Zalo
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nhắn tin trực tiếp với ban quản trị GJob
              </p>
            </div>
          </div>
          <ExternalLink size={15} className="text-[#0068FF] shrink-0" aria-hidden="true" />
        </a>

        {/* Item 4: Liên hệ GJob */}
        <a
          href={`mailto:${supportEmail}?subject=${encodeURIComponent('Hỗ trợ GJob - Yêu cầu trợ giúp')}`}
          onClick={onClose}
          className="btn-press flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              <Headset size={18} aria-hidden="true" />
            </span>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                Liên hệ GJob
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {supportEmail}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
        </a>
      </div>

      {/* Footer reassurance note */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-[11px] leading-tight text-slate-500">
        Mọi ý kiến đóng góp và yêu cầu hỗ trợ của bạn đều được Ban quản trị tiếp nhận để nâng cấp và hoàn thiện sản phẩm.
      </div>
    </div>
  )
}
