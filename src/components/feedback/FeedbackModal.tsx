import axios from 'axios'
import { AlertCircle, CheckCircle2, Loader2, MessageSquarePlus, ShieldCheck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { feedbackService } from '../../services/feedbackService'
import {
  FEEDBACK_RATING_OPTIONS,
  FEEDBACK_TOPIC_LABELS,
  type FeedbackRatingOption,
  type FeedbackTopic,
} from '../../types/feedback'

const TOPICS: FeedbackTopic[] = [
  'CV_TOOL',
  'AI_MATCHING',
  'JOB_SEARCH',
  'JOB_NOTIFICATION',
  'WEBSITE_UI_UX',
  'OTHER',
]

const MAX_CONTENT_LENGTH = 1000

export type FeedbackModalProps = {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const toast = useToast()
  const modalRef = useRef<HTMLDivElement>(null)

  const [topic, setTopic] = useState<FeedbackTopic>('WEBSITE_UI_UX')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Handle escape key
  useEffect(() => {
    if (!open) return
    modalRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, submitting, onClose])

  if (!open) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose()
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= MAX_CONTENT_LENGTH) {
      setContent(val)
      setValidationError(null)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const trimmed = content.trim()
    if (!trimmed) {
      setValidationError('Vui lòng nhập nội dung góp ý.')
      return
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      setValidationError(`Nội dung tối đa ${MAX_CONTENT_LENGTH} ký tự.`)
      return
    }
    if (!rating || rating < 1 || rating > 5) {
      setValidationError('Vui lòng chọn mức độ hài lòng.')
      return
    }

    setSubmitting(true)
    setError(null)
    setValidationError(null)

    try {
      await feedbackService.submitFeedback({
        topic,
        content: trimmed,
        rating,
      })
      toast.success('Cảm ơn bạn đã đóng góp ý kiến! GJob sẽ ghi nhận và cải tiến sản phẩm.')
      // Reset form on success
      setContent('')
      setTopic('WEBSITE_UI_UX')
      setRating(5)
      onClose()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        const detail = err.response.data.detail
        setError(typeof detail === 'string' ? detail : 'Không thể gửi phản hồi. Vui lòng thử lại.')
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="motion-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        tabIndex={-1}
        className="motion-dialog relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#15999B]">
              <MessageSquarePlus size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="feedback-modal-title" className="text-lg font-bold text-slate-950">
                Góp ý sản phẩm
              </h2>
              <p className="text-xs text-slate-500">
                Ý kiến của bạn giúp GJob không ngừng cải thiện và phục vụ bạn tốt hơn
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Đóng cửa sổ góp ý"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
          {/* Error alerts */}
          {(error || validationError) && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* 1. Topic selection */}
          <div className="mb-5">
            <label id="feedback-topic-label" className="mb-2 block text-sm font-semibold text-slate-900">
              Chủ đề cần góp ý <span className="text-red-500">*</span>
            </label>
            <div
              role="radiogroup"
              aria-labelledby="feedback-topic-label"
              className="flex flex-wrap gap-2"
            >
              {TOPICS.map((t) => {
                const isSelected = topic === t
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setTopic(t)}
                    className={`btn-press rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#15999B] text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {FEEDBACK_TOPIC_LABELS[t]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Content */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="feedback-content" className="text-sm font-semibold text-slate-900">
                Mô tả góp ý <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs tabular-nums ${
                  content.length >= MAX_CONTENT_LENGTH ? 'font-bold text-red-600' : 'text-slate-400'
                }`}
              >
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
            <textarea
              id="feedback-content"
              rows={4}
              required
              value={content}
              onChange={handleContentChange}
              placeholder="Chia sẻ chi tiết vấn đề bạn gặp phải, hoặc tính năng bạn muốn GJob có thêm..."
              className="w-full resize-y rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#49BBBD] focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/20"
            />
          </div>

          {/* 3. Rating */}
          <div className="mb-6">
            <label id="feedback-rating-label" className="mb-2.5 block text-sm font-semibold text-slate-900">
              Bạn có hài lòng với GJob không? <span className="text-red-500">*</span>
            </label>
            <div
              role="radiogroup"
              aria-labelledby="feedback-rating-label"
              className="grid grid-cols-5 gap-2"
            >
              {FEEDBACK_RATING_OPTIONS.map((opt: FeedbackRatingOption) => {
                const isSelected = rating === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setRating(opt.value)}
                    className={`btn-press flex flex-col items-center justify-center rounded-xl p-2.5 transition-all ${
                      isSelected
                        ? 'border-2 border-[#15999B] bg-teal-50/70 shadow-xs'
                        : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl transition-transform group-hover:scale-110 sm:text-3xl">
                      {opt.emoji}
                    </span>
                    <span
                      className={`mt-1.5 text-[11px] font-semibold ${
                        isSelected ? 'text-[#15999B]' : 'text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Privacy Assurance Note */}
          <div
            role="note"
            className="mb-4 flex items-start gap-2 rounded-xl border border-teal-200/80 bg-teal-50/60 p-3 text-xs text-teal-900 leading-relaxed"
          >
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />
            <span>
              Góp ý của bạn được bảo mật và chỉ gửi tới Ban quản trị GJob. Nhà tuyển dụng không thể xem được phản hồi này.
            </span>
          </div>

          {/* Footer actions */}
          <div className="mt-auto flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="btn-press rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-[#15999B] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#128284] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Gửi phản hồi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

