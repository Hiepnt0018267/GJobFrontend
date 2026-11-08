import { ExternalLink, Info, Mail, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { getSupportConfig } from '../../config/supportConfig'

export type FeedbackIntentModalProps = {
  open: boolean
  onClose: () => void
  onSelectFeedback: () => void
}

export default function FeedbackIntentModal({
  open,
  onClose,
  onSelectFeedback,
}: FeedbackIntentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const config = getSupportConfig()
  const zaloUrl = config.zaloUrl || 'https://zalo.me/0325368492'

  // Handle Escape key
  useEffect(() => {
    if (!open) return
    modalRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="motion-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intent-modal-title"
        tabIndex={-1}
        className="motion-dialog relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5">
          <h2 id="intent-modal-title" className="text-lg font-bold text-slate-950">
            Bạn muốn?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex flex-col gap-4 p-6">
          {/* Option 1: Góp ý sản phẩm */}
          <button
            type="button"
            onClick={() => {
              onClose()
              onSelectFeedback()
            }}
            className="btn-press group flex w-full items-start gap-4 rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/40 p-4 text-left transition-all hover:border-emerald-600 hover:bg-emerald-50/70 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Mail size={24} aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-950 group-hover:text-emerald-700 transition-colors">
                Góp ý sản phẩm
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Chia sẻ ý kiến, đề xuất và nhận xét về sản phẩm giúp GJob ngày càng hoàn thiện hơn.
              </p>
            </div>
          </button>

          {/* Option 2: Chat Zalo để được hỗ trợ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-xs">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0068FF] text-white shadow-xs font-bold text-lg">
                Zalo
              </span>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-950">
                  Chat Zalo để được hỗ trợ
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Yêu cầu hỗ trợ trực tiếp liên quan đến tài khoản, sử dụng công cụ hoặc dịch vụ.
                </p>
              </div>
            </div>

            {/* Zalo Action Button */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0052cc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0068FF]"
              >
                <span>Mở Zalo chat ngay</span>
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Privacy Assurance Notice */}
          <div
            role="note"
            className="flex items-start gap-2.5 rounded-xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-900 leading-relaxed"
          >
            <Info size={18} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />
            <span>
              Bạn đang gửi góp ý/yêu cầu hỗ trợ tới Ban quản trị GJob. Nhà tuyển dụng sẽ không đọc được nội dung này.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

