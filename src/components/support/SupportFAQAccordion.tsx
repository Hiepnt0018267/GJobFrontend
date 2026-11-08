import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export interface FAQItem {
  id: string
  question: string
  answer: string
}

const GJOB_FAQS: FAQItem[] = [
  {
    id: 'create-cv',
    question: 'Làm sao để tạo CV trên GJob?',
    answer:
      'Bạn có thể vào mục "Tạo CV" trên thanh điều hướng để lựa chọn mẫu CV theo phong cách (Đơn giản, Ấn tượng, Chuyên nghiệp) hoặc theo vị trí ứng tuyển. Sau đó, điền và chỉnh sửa thông tin cá nhân, học vấn, kinh nghiệm làm việc và kỹ năng trực tiếp trên trình soạn thảo CV chuẩn A4, rồi nhấn "Lưu CV".',
  },
  {
    id: 'download-cv',
    question: 'Làm thế nào để tải CV về máy?',
    answer:
      'Sau khi tạo và lưu CV, bạn truy cập vào mục "CV của tôi" (/candidate/cvs), chọn CV muốn tải và nhấn "Xem chi tiết". Tại đây, bạn chọn tính năng "Tải xuống PDF" hoặc "In CV" để lưu tệp CV định dạng chuẩn về thiết bị của mình.',
  },
  {
    id: 'search-apply',
    question: 'Làm thế nào để tìm kiếm và ứng tuyển việc làm?',
    answer:
      'Bạn vào trang "Việc làm" (/jobs), sử dụng thanh tìm kiếm và các bộ lọc theo ngành nghề, vị trí công việc, mức lương, cấp bậc và hình thức làm việc. Khi tìm thấy công việc phù hợp, bấm vào tin tuyển dụng để xem chi tiết và nhấn nút "Ứng tuyển ngay", sau đó chọn CV đã tạo để gửi hồ sơ đến nhà tuyển dụng.',
  },
  {
    id: 'ai-matching',
    question: 'AI Matching đánh giá độ phù hợp CV–JD như thế nào?',
    answer:
      'Hệ thống AI Matching của GJob tiến hành đối chiếu nội dung CV của bạn (kỹ năng, kinh nghiệm, chuyên môn) với các yêu cầu cốt lõi trong bản mô tả công việc (JD). Từ đó tính toán tỷ lệ % phù hợp và đưa ra phân tích chi tiết về điểm mạnh cũng như các kỹ năng gợi ý cần bổ sung.',
  },
  {
    id: 'save-job-follow-company',
    question: 'Làm thế nào để lưu việc làm và theo dõi công ty?',
    answer:
      'Bạn có thể bấm biểu tượng Bookmark trên từng thẻ việc làm để lưu lại vị trí yêu thích, hoặc bấm "Theo dõi" trên trang thông tin công ty. Tất cả cơ hội đã lưu được quản lý tập trung tại trang "Đã lưu" (/candidate/saved) với 2 tab "Việc làm đã lưu" và "Công ty đã theo dõi".',
  },
  {
    id: 'job-notifications',
    question: 'Làm thế nào để nhận thông báo việc làm mới?',
    answer:
      'Khi bạn theo dõi một công ty, mọi tin tuyển dụng mới được duyệt của công ty đó sẽ tự động gửi thông báo đến bạn. Bạn có thể kiểm tra danh sách thông báo tại biểu tượng Chuông trên thanh điều hướng hoặc truy cập trang "Thông báo" (/candidate/notifications).',
  },
]

export default function SupportFAQAccordion() {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white" role="region" aria-label="Câu hỏi thường gặp">
      {GJOB_FAQS.map((faq, index) => {
        const isOpen = openId === faq.id
        const controlId = `faq-trigger-${faq.id}`
        const panelId = `faq-panel-${faq.id}`

        return (
          <div key={faq.id} className="transition-colors hover:bg-slate-50/50">
            <button
              type="button"
              id={controlId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(faq.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#49BBBD]"
            >
              <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                <span className="text-slate-400 font-bold mr-1.5">{index + 1}.</span>
                {faq.question}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#15999B]' : ''}`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={controlId}
                className="px-4 pb-3 pt-0 text-xs sm:text-sm leading-relaxed text-slate-600 animate-in fade-in-50 duration-150"
              >
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
