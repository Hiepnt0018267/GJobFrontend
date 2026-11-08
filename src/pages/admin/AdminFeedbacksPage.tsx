import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Eye,
  MessageSquare,
  Search,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminFilterPill, AdminFilterResetButton } from '../../components/admin/AdminFilterControls'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminViewportPortal from '../../components/admin/AdminViewportPortal'
import { useToast } from '../../hooks/useToast'
import { feedbackService } from '../../services/feedbackService'
import { saveStoredReadFeedbackId } from '../../utils/notification'
import {
  FEEDBACK_RATING_OPTIONS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TOPIC_LABELS,
  type FeedbackItem,
  type FeedbackListResponse,
  type FeedbackStatus,
  type FeedbackTopic,
} from '../../types/feedback'

const PAGE_SIZE = 15

const TOPIC_BADGE_COLORS: Record<FeedbackTopic, string> = {
  CV_TOOL: 'bg-purple-50 text-purple-700 border-purple-200',
  AI_MATCHING: 'bg-blue-50 text-blue-700 border-blue-200',
  JOB_SEARCH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  JOB_NOTIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
  WEBSITE_UI_UX: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  OTHER: 'bg-slate-100 text-slate-700 border-slate-200',
}

const STATUS_BADGE_COLORS: Record<FeedbackStatus, string> = {
  NEW: 'bg-sky-50 text-sky-700 border-sky-200',
  IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const TOPIC_OPTIONS = [
  { value: 'ALL', label: 'Tất cả chủ đề' },
  ...Object.entries(FEEDBACK_TOPIC_LABELS).map(([k, v]) => ({ value: k, label: v })),
]

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  ...Object.entries(FEEDBACK_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v })),
]

const RATING_OPTIONS = [
  { value: 'ALL', label: 'Tất cả đánh giá' },
  { value: '5', label: '😍 5 sao' },
  { value: '4', label: '🙂 4 sao' },
  { value: '3', label: '😐 3 sao' },
  { value: '2', label: '🙁 2 sao' },
  { value: '1', label: '😡 1 sao' },
]

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Chưa xác định'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

function getRatingEmoji(rating: number): string {
  const found = FEEDBACK_RATING_OPTIONS.find((r) => r.value === rating)
  return found ? found.emoji : '⭐'
}

type FeedbackDetailDialogProps = {
  feedback: FeedbackItem
  onClose: () => void
  onStatusUpdated: (updated: FeedbackItem) => void
}

function FeedbackDetailDialog({
  feedback,
  onClose,
  onStatusUpdated,
}: FeedbackDetailDialogProps) {
  const toast = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dialogRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !updating) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [updating, onClose])

  const handleUpdateStatus = async (newStatus: FeedbackStatus) => {
    if (updating || newStatus === feedback.status) return
    setUpdating(true)
    setError(null)
    try {
      const updated = await feedbackService.updateFeedbackStatusAdmin(feedback.id, newStatus)
      toast.success(`Đã cập nhật trạng thái thành: ${FEEDBACK_STATUS_LABELS[newStatus]}`)
      onStatusUpdated(updated)
    } catch {
      setError('Không thể cập nhật trạng thái. Vui lòng thử lại.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <AdminViewportPortal>
      <div
        className="motion-backdrop fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/50 p-4 sm:p-6 backdrop-blur-xs"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !updating) onClose()
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-detail-title"
          tabIndex={-1}
          className="motion-dialog relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
        >
          <header className="flex shrink-0 items-start justify-between border-b border-slate-100 bg-white px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <MessageSquare size={22} />
              </span>
              <div>
                <h2 id="feedback-detail-title" className="text-lg font-bold text-slate-950 font-[Inter,sans-serif]">
                  Chi tiết ý kiến phản hồi
                </h2>
                <p className="text-xs text-slate-500">Mã góp ý: #{feedback.id.slice(0, 8)}</p>
              </div>
            </div>
            <button
              type="button"
              disabled={updating}
              onClick={onClose}
              aria-label="Đóng chi tiết"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Meta */}
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Chủ đề</span>
                <span
                  className={`mt-1 inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-bold ${
                    TOPIC_BADGE_COLORS[feedback.topic]
                  }`}
                >
                  {FEEDBACK_TOPIC_LABELS[feedback.topic]}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Đánh giá</span>
                <span className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <span className="text-xl">{getRatingEmoji(feedback.rating)}</span>
                  <span>{feedback.rating}/5 sao</span>
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Trạng thái</span>
                <span
                  className={`mt-1 inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-bold ${
                    STATUS_BADGE_COLORS[feedback.status]
                  }`}
                >
                  {FEEDBACK_STATUS_LABELS[feedback.status]}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Thời gian</span>
                <span className="mt-1 text-xs text-slate-700 font-medium block">
                  {formatTimestamp(feedback.created_at)}
                </span>
              </div>
            </div>

            {/* Sender Info */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <UserIcon size={14} /> Thông tin người gửi
              </h3>
              {feedback.sender ? (
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <span className="text-xs text-slate-500 block">Họ và tên:</span>
                    <strong className="text-slate-900">{feedback.sender.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Email:</span>
                    <span className="text-slate-700">{feedback.sender.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Vai trò:</span>
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                      {feedback.sender.role}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Khách vãng lai (Chưa đăng nhập tài khoản)</p>
              )}
            </div>

            {/* Full Content */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Nội dung góp ý chi tiết
              </h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-900 whitespace-pre-wrap">
                {feedback.content}
              </div>
            </div>

            {/* Status update actions */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Clock size={14} /> Cập nhật trạng thái xử lý
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={updating || feedback.status === 'NEW'}
                  onClick={() => handleUpdateStatus('NEW')}
                  className={`btn-press rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    feedback.status === 'NEW'
                      ? 'border-2 border-sky-500 bg-sky-100 text-sky-800 cursor-default'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                  } disabled:opacity-50`}
                >
                  Mới tiếp nhận (NEW)
                </button>
                <button
                  type="button"
                  disabled={updating || feedback.status === 'IN_REVIEW'}
                  onClick={() => handleUpdateStatus('IN_REVIEW')}
                  className={`btn-press rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    feedback.status === 'IN_REVIEW'
                      ? 'border-2 border-amber-500 bg-amber-100 text-amber-800 cursor-default'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                  } disabled:opacity-50`}
                >
                  Đang xem xét (IN_REVIEW)
                </button>
                <button
                  type="button"
                  disabled={updating || feedback.status === 'RESOLVED'}
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  className={`btn-press rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    feedback.status === 'RESOLVED'
                      ? 'border-2 border-emerald-500 bg-emerald-100 text-emerald-800 cursor-default'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  } disabled:opacity-50`}
                >
                  Đã xử lý (RESOLVED)
                </button>
              </div>
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-end border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              disabled={updating}
              onClick={onClose}
              className="btn-press rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              Đóng
            </button>
          </footer>
        </div>
      </div>
    </AdminViewportPortal>
  )
}

export default function AdminFeedbacksPage() {
  const [params, setParams] = useSearchParams()

  const rawPage = Number(params.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const topicFilter = (params.get('topic') as FeedbackTopic) || undefined
  const statusFilter = (params.get('status') as FeedbackStatus) || undefined
  const rawRating = Number(params.get('rating') ?? '')
  const ratingFilter = rawRating >= 1 && rawRating <= 5 ? rawRating : undefined
  const search = params.get('search') ?? ''

  const [searchInput, setSearchInput] = useState(search)
  const [data, setData] = useState<FeedbackListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const dismissedIdRef = useRef<string | null>(null)

  const fetchFeedbacks = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      setError(null)
      try {
        const res = await feedbackService.getFeedbacksAdmin(
          {
            page,
            page_size: PAGE_SIZE,
            topic: topicFilter,
            status: statusFilter,
            rating: ratingFilter,
            search: search.trim() || undefined,
          },
          signal,
        )
        setData(res)
      } catch {
        if (signal?.aborted) return
        setError('Không thể tải danh sách góp ý. Vui lòng thử lại.')
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [page, topicFilter, statusFilter, ratingFilter, search],
  )

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(() => fetchFeedbacks(controller.signal))
    return () => controller.abort()
  }, [fetchFeedbacks])

  const updateParam = (updates: Record<string, string | null>) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(updates).forEach(([k, v]) => {
          if (v === null || v === '') next.delete(k)
          else next.set(k, v)
        })
        return next
      },
      { replace: true },
    )
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam({ search: searchInput.trim() || null, page: null })
  }

  const handleFeedbackUpdated = (updated: FeedbackItem) => {
    setSelectedFeedback(updated)
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((item) => (item.id === updated.id ? updated : item)),
      }
    })
  }

  // Auto-open detail modal if navigated with ?id=... from notifications
  useEffect(() => {
    const targetId = params.get('id')
    if (!targetId) {
      return
    }

    if (dismissedIdRef.current === targetId) return
    if (selectedFeedback?.id === targetId) return

    saveStoredReadFeedbackId(targetId)

    let cancelled = false
    const found = data?.items.find((item) => item.id === targetId)
    if (found) {
      queueMicrotask(() => {
        if (!cancelled && dismissedIdRef.current !== targetId) {
          setSelectedFeedback(found)
        }
      })
      return () => {
        cancelled = true
      }
    }

    feedbackService
      .getFeedbackDetailAdmin(targetId)
      .then((fb) => {
        if (!cancelled && fb && dismissedIdRef.current !== targetId) {
          setSelectedFeedback(fb)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [params, data?.items, selectedFeedback?.id])

  const handleCloseDetail = () => {
    const currentTargetId = params.get('id') || selectedFeedback?.id
    if (currentTargetId) {
      dismissedIdRef.current = currentTargetId
    }
    setSelectedFeedback(null)
    if (params.has('id')) {
      updateParam({ id: null })
    }
  }

  const activeFilterCount = [
    Boolean(search),
    Boolean(topicFilter),
    Boolean(statusFilter),
    Boolean(ratingFilter),
  ].filter(Boolean).length
  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-black"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Tổng quan
            </Link>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-[#1C1C1C]">
              Quản lý góp ý sản phẩm
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Tiếp nhận, phân loại và xử lý ý kiến đóng góp từ người dùng và khách truy cập.
            </p>
          </div>
          {data && (
            <p className="text-sm text-slate-500">
              <span className="font-semibold tabular-nums text-slate-900">
                {data.total.toLocaleString('vi-VN')}
              </span>{' '}
              kết quả
            </p>
          )}
        </header>

        {/* Filters Toolbar */}
        <section className="mt-6 flex flex-wrap items-center gap-3" aria-label="Bộ lọc ý kiến góp ý">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] flex-1 max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm nội dung góp ý..."
              className="h-9 w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  updateParam({ search: null, page: null })
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Filter Pills */}
          <AdminFilterPill
            label="Chủ đề"
            value={topicFilter ?? 'ALL'}
            options={TOPIC_OPTIONS}
            onChange={(val) => updateParam({ topic: val === 'ALL' ? null : val, page: null })}
            ariaLabel="Lọc theo chủ đề"
          />

          <AdminFilterPill
            label="Trạng thái"
            value={statusFilter ?? 'ALL'}
            options={STATUS_OPTIONS}
            onChange={(val) => updateParam({ status: val === 'ALL' ? null : val, page: null })}
            ariaLabel="Lọc theo trạng thái"
          />

          <AdminFilterPill
            label="Đánh giá"
            value={ratingFilter ? String(ratingFilter) : 'ALL'}
            options={RATING_OPTIONS}
            onChange={(val) => updateParam({ rating: val === 'ALL' ? null : val, page: null })}
            ariaLabel="Lọc theo đánh giá"
          />

          {hasActiveFilters && (
            <AdminFilterResetButton
              onClick={() => {
                setSearchInput('')
                setParams({})
              }}
              count={activeFilterCount}
            />
          )}
        </section>

        {/* Content List / Table */}
        {error ? (
          <section
            role="alert"
            className="mt-6 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200"
          >
            <AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-slate-950 font-[Inter,sans-serif]">
              Không thể tải danh sách góp ý.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => void fetchFeedbacks()}
              className="btn-press mt-5 rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Thử lại
            </button>
          </section>
        ) : loading && !data ? (
          <div className="mt-6 space-y-3" aria-busy="true" aria-label="Đang tải danh sách góp ý">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04] text-[#1C1C1C] ring-1 ring-black/10">
              <MessageSquare size={27} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-950 font-[Inter,sans-serif]">
              {hasActiveFilters ? 'Không tìm thấy ý kiến góp ý phù hợp.' : 'Chưa có ý kiến góp ý nào trong hệ thống.'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {hasActiveFilters
                ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.'
                : 'Các phản hồi từ ứng viên sẽ xuất hiện tại đây khi họ gửi góp ý.'}
            </p>
          </section>
        ) : data ? (
          <>
            {/* Desktop Table View (table-fixed, fully constrained within container) */}
            <section className="mt-6" aria-label="Danh sách góp ý sản phẩm">
              <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:block">
                <table className="w-full table-fixed text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="w-[12%] px-5 py-4">Đánh giá</th>
                      <th className="w-[18%] px-4 py-4">Chủ đề</th>
                      <th className="w-[28%] px-4 py-4">Nội dung góp ý</th>
                      <th className="w-[18%] px-4 py-4">Người gửi</th>
                      <th className="w-[12%] px-4 py-4">Thời gian</th>
                      <th className="w-[12%] px-5 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {data.items.map((feedback) => (
                      <tr key={feedback.id} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                            <span className="text-lg">{getRatingEmoji(feedback.rating)}</span>
                            <span className="text-xs">({feedback.rating} ⭐)</span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                              TOPIC_BADGE_COLORS[feedback.topic]
                            }`}
                          >
                            {FEEDBACK_TOPIC_LABELS[feedback.topic]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="line-clamp-2 text-xs sm:text-sm text-slate-800 leading-snug break-words font-medium">
                            {feedback.content}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {feedback.sender ? (
                            <div className="min-w-0">
                              <span className="block truncate font-semibold text-slate-950 text-xs sm:text-sm">
                                {feedback.sender.full_name}
                              </span>
                              <span className="block truncate text-xs text-slate-500">
                                {feedback.sender.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Khách vãng lai</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="block text-xs text-slate-600 font-medium">
                            {formatTimestamp(feedback.created_at)}
                          </span>
                          <span
                            className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                              STATUS_BADGE_COLORS[feedback.status]
                            }`}
                          >
                            {FEEDBACK_STATUS_LABELS[feedback.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              dismissedIdRef.current = null
                              saveStoredReadFeedbackId(feedback.id)
                              setSelectedFeedback(feedback)
                            }}
                            className="btn-press inline-flex items-center gap-1 rounded-xl border border-black/[0.08] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1C1C1C] shadow-2xs transition-colors hover:bg-slate-50 cursor-pointer"
                          >
                            Xem chi tiết <Eye size={13} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="space-y-3 lg:hidden">
                {data.items.map((feedback) => (
                  <article
                    key={feedback.id}
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
                          TOPIC_BADGE_COLORS[feedback.topic]
                        }`}
                      >
                        {FEEDBACK_TOPIC_LABELS[feedback.topic]}
                      </span>
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-bold ${
                          STATUS_BADGE_COLORS[feedback.status]
                        }`}
                      >
                        {FEEDBACK_STATUS_LABELS[feedback.status]}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-sm text-slate-800 leading-relaxed font-medium">
                      {feedback.content}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>
                        {getRatingEmoji(feedback.rating)} {feedback.rating}/5 sao
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          dismissedIdRef.current = null
                          saveStoredReadFeedbackId(feedback.id)
                          setSelectedFeedback(feedback)
                        }}
                        className="inline-flex items-center gap-1 font-semibold text-[#1C1C1C] hover:underline cursor-pointer"
                      >
                        Xem chi tiết <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Pagination Controls */}
            {data.total_pages > 1 && (
              <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang">
                <button
                  type="button"
                  onClick={() => updateParam({ page: String(page - 1) })}
                  disabled={page <= 1}
                  className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 transition-colors"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Trước
                </button>
                <span className="text-sm text-slate-600">
                  Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> /{' '}
                  {data.total_pages}
                </span>
                <button
                  type="button"
                  onClick={() => updateParam({ page: String(page + 1) })}
                  disabled={page >= data.total_pages}
                  className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 transition-colors"
                >
                  Sau
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        ) : null}

        {/* Detail Dialog */}
        {selectedFeedback && (
          <FeedbackDetailDialog
            feedback={selectedFeedback}
            onClose={handleCloseDetail}
            onStatusUpdated={handleFeedbackUpdated}
          />
        )}
      </main>
    </div>
  )
}
