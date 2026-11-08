export type FeedbackTopic =
  | 'CV_TOOL'
  | 'AI_MATCHING'
  | 'JOB_SEARCH'
  | 'JOB_NOTIFICATION'
  | 'WEBSITE_UI_UX'
  | 'OTHER'

export type FeedbackStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED'

export const FEEDBACK_TOPIC_LABELS: Record<FeedbackTopic, string> = {
  CV_TOOL: 'Công cụ tạo CV',
  AI_MATCHING: 'Tính năng AI Matching',
  JOB_SEARCH: 'Tìm kiếm và lọc việc làm',
  JOB_NOTIFICATION: 'Thông báo việc làm',
  WEBSITE_UI_UX: 'Giao diện / Trải nghiệm web',
  OTHER: 'Khác',
}

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  NEW: 'Mới tiếp nhận',
  IN_REVIEW: 'Đang xem xét',
  RESOLVED: 'Đã xử lý',
}

export type FeedbackRatingOption = {
  value: number
  emoji: string
  label: string
}

export const FEEDBACK_RATING_OPTIONS: FeedbackRatingOption[] = [
  { value: 1, emoji: '😡', label: 'Rất tệ' },
  { value: 2, emoji: '😕', label: 'Tệ' },
  { value: 3, emoji: '😐', label: 'Bình thường' },
  { value: 4, emoji: '😊', label: 'Tốt' },
  { value: 5, emoji: '😍', label: 'Tuyệt vời' },
]

export type FeedbackSender = {
  id: string
  email: string
  full_name: string
  role: string
}

export type FeedbackItem = {
  id: string
  user_id: string | null
  sender: FeedbackSender | null
  topic: FeedbackTopic
  content: string
  rating: number
  status: FeedbackStatus
  created_at: string
  updated_at: string
}

export type FeedbackCreatePayload = {
  topic: FeedbackTopic
  content: string
  rating: number
}

export type FeedbackListResponse = {
  items: FeedbackItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type FeedbackListParams = {
  page?: number
  page_size?: number
  topic?: FeedbackTopic
  status?: FeedbackStatus
  rating?: number
  search?: string
}
