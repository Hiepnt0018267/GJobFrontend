import { AlertTriangle, Building2, Check, LockKeyhole, ShieldAlert, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export type SafetyGuideModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SafetyGuideModal({ isOpen, onClose }: SafetyGuideModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent background scrolling while modal is open
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 sm:z-[70] flex items-center justify-center p-4 sm:p-6 sm:py-10 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-guide-title"
        className="relative flex flex-col w-full max-w-xl max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#15999B] ring-1 ring-teal-200">
              <ShieldAlert size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="safety-guide-title" className="text-base sm:text-lg font-bold text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">
                Hướng dẫn tìm việc an toàn
              </h2>
              <p className="text-xs text-slate-500">
                Nguyên tắc giúp bạn nhận diện cơ hội minh bạch và phòng tránh rủi ro
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hướng dẫn an toàn"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm text-slate-600">
          {/* Section 1: Cảnh giác với yêu cầu chuyển tiền */}
          <section className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
            <div className="flex items-center gap-2.5 font-bold text-rose-900 text-sm mb-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle size={16} aria-hidden="true" />
              </span>
              <h3>Cảnh giác với yêu cầu chuyển tiền</h3>
            </div>
            <ul className="space-y-1.5 pl-9 text-xs sm:text-sm text-slate-700 list-disc">
              <li><strong>Không chuyển tiền đặt cọc:</strong> Tuyệt đối không nộp tiền giữ chỗ, lệ phí phỏng vấn hoặc phí hồ sơ.</li>
              <li><strong>Không trả phí để được nhận việc:</strong> Các doanh nghiệp uy tín không bao giờ thu phí tuyển dụng từ ứng viên.</li>
              <li><strong>Cẩn trọng với yêu cầu thanh toán trước:</strong> Cảnh giác với các yêu cầu nạp tiền làm nhiệm vụ, mua khóa đào tạo hoặc mua thiết bị trước khi làm việc.</li>
            </ul>
          </section>

          {/* Section 2: Bảo vệ tài khoản */}
          <section className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="flex items-center gap-2.5 font-bold text-amber-900 text-sm mb-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <LockKeyhole size={16} aria-hidden="true" />
              </span>
              <h3>Bảo vệ tài khoản & thông tin cá nhân</h3>
            </div>
            <ul className="space-y-1.5 pl-9 text-xs sm:text-sm text-slate-700 list-disc">
              <li><strong>Không cung cấp mã OTP:</strong> Không bao giờ chia sẻ mã OTP xác thực ngân hàng hay tài khoản cá nhân cho bất kỳ ai.</li>
              <li><strong>Không chia sẻ mật khẩu:</strong> Giữ kín mật khẩu tài khoản GJob và các ứng dụng cá nhân khác.</li>
              <li><strong>Bảo mật thông tin nhạy cảm:</strong> Không gửi ảnh chụp 2 mặt thẻ ngân hàng, mã CVV/CVC hoặc thông tin tài chính nhạy cảm khi chưa xác thực hợp đồng lao động chính thức.</li>
            </ul>
          </section>

          {/* Section 3: Kiểm tra nhà tuyển dụng */}
          <section className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
            <div className="flex items-center gap-2.5 font-bold text-teal-900 text-sm mb-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-[#15999B]">
                <Building2 size={16} aria-hidden="true" />
              </span>
              <h3>Kiểm tra nhà tuyển dụng</h3>
            </div>
            <ul className="space-y-1.5 pl-9 text-xs sm:text-sm text-slate-700 list-disc">
              <li><strong>Kiểm tra thông tin doanh nghiệp:</strong> Xem trang hồ sơ công ty trên GJob, website chính thức, địa chỉ và mã số thuế trước khi nộp đơn.</li>
              <li><strong>Xem kỹ mô tả và điều kiện:</strong> Đọc kỹ phạm vi công việc, địa điểm làm việc, và thời gian thử việc.</li>
              <li><strong>Cảnh giác với mức lương bất thường:</strong> Cảnh giác với những lời mời "việc nhẹ lương cao" không yêu cầu kỹ năng cụ thể.</li>
              <li><strong>Báo cáo tin tuyển dụng đáng ngờ:</strong> Hãy liên hệ hoặc gửi góp ý cho đội ngũ GJob nếu phát hiện dấu hiệu mạo danh hoặc gian lận.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 px-6 py-3.5 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-[#49BBBD] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#15999B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]"
          >
            <Check size={16} aria-hidden="true" />
            Đã hiểu
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

